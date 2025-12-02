const mongoose = require('mongoose');

const PaperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  abstract: { type: String, required: true },
  keywords: { type: String }, // We will store "AI, ML, Data" as a string
  fileName: { type: String }, // We'll store the filename for now
  author: { type: String, required: true },
  authorId: { type: String, required: true }, // Links paper to the user who uploaded it
  department: { type: String },
  uploadDate: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' }, // pending, approved, rejected
  plagiarismScore: { type: Number, default: 0 }
});

module.exports = mongoose.model('Paper', PaperSchema);