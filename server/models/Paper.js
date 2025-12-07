const mongoose = require('mongoose');

const PaperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  abstract: { type: String, required: true },
  keywords: { type: String },
  fileName: { type: String },
  author: { type: String, required: true },
  authorId: { type: String, required: true },
  department: { type: String },
  uploadDate: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' },
  plagiarismScore: { type: Number, default: 0 },
  
  comments: [
    {
      text: { type: String, required: true },
      reviewerName: { type: String }, 
      date: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('Paper', PaperSchema);