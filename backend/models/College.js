const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  location: { type: String, required: true },
  area: { type: String, required: true },
  address: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['Engineering', 'Medical', 'Arts & Science', 'Commerce', 'Law', 'Business School',
           'Liberal Arts', 'Deemed University', 'Research Institute']
  },
  courses: [{ type: String }],
  fees: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'INR/year' }
  },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  placement: {
    percentage: Number,
    avgPackage: Number,  // in LPA
    topPackage: Number   // in LPA
  },
  facilities: [{ type: String }],
  ranking: {
    nirf: Number,
    qs: Number
  },
  established: Number,
  affiliation: String,
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  website: String,
  description: String,
  admissionProcess: String,
  contactEmail: String,
  phone: String,
  campusSize: String,
  totalStudents: Number
}, { timestamps: true });

// Text index for search
collegeSchema.index({ name: 'text', location: 'text', area: 'text', courses: 'text', type: 'text' });

collegeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('College', collegeSchema);
