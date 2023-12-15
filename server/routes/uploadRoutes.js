const express = require('express');
const router = express.Router();
const multer = require('multer')
const PdfDetails = require('../models/PdfDetailsSchema');
app.use("/files", express.static("files"));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./files");
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now();
      cb(null, uniqueSuffix + file.originalname);
    },
  });

const upload = multer({ storage : storage})

app.post('/upload-files',upload.single("file"),async(req, res) => {
    console.log(req.file);
    const title = req.body.title;
    const fileName = req.file.filename;
    try {
      await PdfDetails.create({ title: title, pdf: fileName });
      res.send({ status: "ok" });
    } catch (error) {
      res.json({ status: error });
    }
});

app.get("/get-files", async (req, res) => {
  try {
    PdfDetails.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});


module.exports = router;