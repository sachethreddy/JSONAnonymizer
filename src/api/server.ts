import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { processStream } from '../utils/stream-parser';
import { ObfuscatorConfig } from '../config/types';

const app = express();
app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Store files locally for parsing
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

app.post('/api/obfuscate', upload.single('file'), async (req, res): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Config should be passed as a JSON string in req.body.config
    let config: ObfuscatorConfig = {};
    if (req.body.config) {
      config = JSON.parse(req.body.config);
    }

    const inputPath = req.file.path;
    const outputPath = `${inputPath}.obfuscated.json`;

    await processStream(inputPath, outputPath, config);

    // Send the file back to client
    res.download(outputPath, `obfuscated-${req.file.originalname}`, (err) => {
      // Cleanup files after response
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
