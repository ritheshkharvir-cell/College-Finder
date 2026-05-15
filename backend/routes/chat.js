const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const College = require('../models/College');
const User = require('../models/User');
const fetch = require('node-fetch');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

// Build system prompt with college context
async function buildSystemPrompt() {
  const colleges = await College.find().select('name type courses fees rating placement area');
  const collegeList = colleges.map(c =>
    `- ${c.name} (${c.type}, ${c.area}): Courses: ${c.courses.slice(0,4).join(', ')}; Fees: ₹${c.fees?.min?.toLocaleString()}-₹${c.fees?.max?.toLocaleString()}/yr; Rating: ${c.rating}/5; Placement: ${c.placement?.percentage}%`
  ).join('\n');

  return `You are "College Finder", a friendly and intelligent AI assistant helping students explore colleges in Bangalore, India.

You have knowledge about the following Bangalore colleges:
${collegeList}

Guidelines:
- Answer questions about colleges, admissions, fees, courses, placements, campus life
- Be concise, friendly and helpful
- If asked to compare colleges, highlight key differences in fees, placements, ratings, courses
- For recommendation queries, ask about budget, preferred course, and location preference
- If you don't know something specific, say "I don't have that specific information, but you can check the college's official website"
- Always respond in English unless the user writes in another language
- For career advice, suggest relevant courses and colleges
- Mention NIRF rankings when available
- Keep responses under 200 words unless detailed comparison is needed`;
}

// @route POST /api/chat - Send message to AI
router.post('/', protect, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message required' });

    // Save user message to history
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        chatHistory: {
          $each: [{ role: 'user', content: message }],
          $slice: -50  // keep last 50 messages
        }
      }
    });

    const systemPrompt = await buildSystemPrompt();

    // Build messages for Ollama
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    // Try Ollama first
    try {
      const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages,
          stream: false,
          options: { temperature: 0.7, num_ctx: 4096 }
        }),
        timeout: 30000
      });

      if (!response.ok) throw new Error('Ollama not available');

      const data = await response.json();
      const aiResponse = data.message?.content || "I couldn't generate a response.";

      // Save AI response
      await User.findByIdAndUpdate(req.user._id, {
        $push: { chatHistory: { role: 'assistant', content: aiResponse } }
      });

      return res.json({ success: true, response: aiResponse, source: 'ollama' });

    } catch (ollamaError) {
      // Fallback: rule-based responses
      const fallbackResponse = await generateFallbackResponse(message);

      await User.findByIdAndUpdate(req.user._id, {
        $push: { chatHistory: { role: 'assistant', content: fallbackResponse } }
      });

      return res.json({ success: true, response: fallbackResponse, source: 'fallback' });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Rule-based fallback when Ollama is not running
async function generateFallbackResponse(message) {
  const msg = message.toLowerCase();
  const colleges = await College.find();

  // Compare intent
  if (msg.includes('compare')) {
    return "To compare colleges, use the **Compare** feature in the sidebar. You can select up to 4 colleges and see a side-by-side comparison of fees, placements, ratings, and more!";
  }

  // Recommendation intent
  if (msg.includes('recommend') || msg.includes('suggest') || msg.includes('best college')) {
    const top = colleges.sort((a, b) => b.rating - a.rating).slice(0, 3);
    return `Here are the top-rated colleges in Bangalore:\n\n${top.map((c, i) => `${i+1}. **${c.name}** (${c.type}) - Rating: ${c.rating}/5, Placement: ${c.placement?.percentage}%`).join('\n')}\n\nUse the Recommendations page for personalized suggestions based on your budget and interests!`;
  }

  // Fees-related
  if (msg.includes('fee') || msg.includes('cost') || msg.includes('expensive')) {
    const cheap = colleges.filter(c => c.fees?.min < 100000).sort((a,b) => a.fees.min - b.fees.min).slice(0,3);
    return `Most affordable colleges in Bangalore:\n\n${cheap.map(c => `• **${c.name}**: ₹${c.fees?.min?.toLocaleString()} - ₹${c.fees?.max?.toLocaleString()}/year`).join('\n')}\n\nUse the Search & Filter to find colleges within your budget.`;
  }

  // Medical
  if (msg.includes('mbbs') || msg.includes('medical') || msg.includes('neet')) {
    const medical = colleges.filter(c => c.type === 'Medical');
    return `Medical colleges in Bangalore:\n\n${medical.map(c => `• **${c.name}** - Rating: ${c.rating}/5\n  Admission: ${c.admissionProcess} | Fees: ₹${c.fees?.min?.toLocaleString()}/yr`).join('\n\n')}`;
  }

  // Engineering
  if (msg.includes('engineering') || msg.includes('b.e') || msg.includes('b.tech')) {
    const eng = colleges.filter(c => c.type === 'Engineering').sort((a,b) => b.rating - a.rating).slice(0,4);
    return `Top Engineering colleges in Bangalore:\n\n${eng.map((c,i) => `${i+1}. **${c.name}** - Rating: ${c.rating}/5 | Avg Package: ₹${c.placement?.avgPackage} LPA`).join('\n')}`;
  }

  // Placement
  if (msg.includes('placement') || msg.includes('job') || msg.includes('package')) {
    const top = colleges.sort((a,b) => (b.placement?.percentage || 0) - (a.placement?.percentage || 0)).slice(0,4);
    return `Colleges with best placement records:\n\n${top.map((c,i) => `${i+1}. **${c.name}**: ${c.placement?.percentage}% placement | Avg: ₹${c.placement?.avgPackage} LPA | Top: ₹${c.placement?.topPackage} LPA`).join('\n')}`;
  }

  // Law
  if (msg.includes('law') || msg.includes('llb') || msg.includes('clat')) {
    return `For law in Bangalore, **National Law School of India University (NLSIU)** is India's #1 law school (NIRF Rank 1). Admission through CLAT. Fees: ₹2-2.5 lakh/year. Placement: 98%!`;
  }

  // Default
  return `I can help you with information about colleges in Bangalore! You can ask me about:\n• **Fees** - "What are affordable colleges?"\n• **Placements** - "Which college has best placements?"\n• **Courses** - "Where can I study MBA?"\n• **Medical/Engineering/Law** colleges\n• **Recommendations** - based on budget and interests\n\nNote: For full AI responses, make sure Ollama is running locally.`;
}

// @route GET /api/chat/history - Get chat history
router.get('/history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('chatHistory');
    res.json({ success: true, history: user.chatHistory || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route DELETE /api/chat/history - Clear chat history
router.delete('/history', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { chatHistory: [] });
    res.json({ success: true, message: 'History cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
