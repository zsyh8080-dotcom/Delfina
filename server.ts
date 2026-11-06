import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Server-side Persian Audio Transcription Fallback using @google/genai
  app.post('/api/transcribe', async (req, res) => {
    try {
      const { audioBase64, mimeType } = req.body as {
        audioBase64?: string;
        mimeType?: string;
      };

      if (!audioBase64) {
        res.status(400).json({ error: 'No audio data provided' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        res.status(503).json({ error: 'GEMINI_API_KEY not configured' });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const promptText =
        'این صدای کوتاه یک فرمان صوتی فارسی در بازی است. بازیکن یکی از عبارت‌های «حمله کن»، «سپر بگیر»، «بپر بکن»، «بپر» یا «قدرت حبابی» را به زبان فارسی می‌گوید. فقط و فقط متن فارسی شنیده‌شده را بدون هیچ توضیح اضافه‌ای بنویس.';

      let transcript = '';
      const candidateModels = [
        'gemini-3.5-transcribe',
        'gemini-3.1-flash-lite-preview',
        'gemini-3.8-flash',
      ];

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType || 'audio/webm',
                    data: audioBase64,
                  },
                },
                {
                  text: promptText,
                },
              ],
            },
          });
          transcript = (response.text ?? '').trim();
          if (transcript) break;
        } catch {
          // Try next model in cascade or gracefully fall back to browser Web Speech API
        }
      }

      res.json({ transcript });
    } catch {
      // Never return 500 or log noisy quota errors when Free Tier rate limit is reached
      res.status(200).json({ transcript: '', fallbackToWebSpeech: true });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
