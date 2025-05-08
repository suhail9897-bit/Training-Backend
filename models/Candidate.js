const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  candidateId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  dob: { type: Date },
  gender: { type: String },
  state: { type: String },
  qualification: { type: String },
  reference: { type: String },
  assignedTrainings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Training' }]
});

module.exports = mongoose.model('Candidate', candidateSchema);
