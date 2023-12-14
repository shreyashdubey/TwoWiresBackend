const mongoose = require("mongoose");

const pdfDetailsSchema = new mongoose.Schema(
  {
    pdf: {type: String, required: true},
    title: {type: String, required: true},
  },
  { timestamps: true }
);
const PdfDetailsSchema = mongoose.model('PdfDetailsSchema', pdfDetailsSchema);
module.exports = PdfDetailsSchema;
