const express = require('express');
const router = express.Router();
const multer = require('multer')

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
})