import crypto from 'crypto'
import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + path.extname(file.originalname);
      cb(null,filename);
  }
})

export const upload = multer({ storage: storage })