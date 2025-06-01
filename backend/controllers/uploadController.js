const cloudinary = require('../utils/cloudinary');
const multer = require('multer');
const streamifier = require('streamifier');

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Express middleware za upload slike
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Ni datoteke za upload.' });
    }
    // Upload preko streama (ker je v memory)
    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'eventease' },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };
    const result = await streamUpload(req);
    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ error: 'Napaka pri uploadu slike.' });
  }
};

module.exports = { upload, uploadImage }; 