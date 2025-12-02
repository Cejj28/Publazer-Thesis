const mongoose = require('mongoose');

const PaperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  abstract: { type: String, required: true },
  keywords: { type: String },
  fileName: { type: String }, // Stores the PDF filename
  author: { type: String, required: true },
  authorId: { type: String, required: true },
  department: { type: String },
  uploadDate: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' },
  plagiarismScore: { type: Number, default: 0 }
});

module.exports = mongoose.model('Paper', PaperSchema);