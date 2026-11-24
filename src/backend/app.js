import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { env } from './config/env.js';
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import categoryRoutes from './routes/categories.js';
import departmentRoutes from './routes/departments.js';
import noticeRoutes from './routes/notices.js';
import routineRoutes from './routes/routines.js';
import eventRoutes from './routes/events.js';
import materialRoutes from './routes/materials.js';
import commentRoutes from './routes/comments.js';
import questionRoutes from './routes/qa.js';
import fileRoutes from './routes/files.js';
import adminRoutes from './routes/admin.js';
import { requireAuth } from './middleware/requireAuth.js';
import { requireActive } from './middleware/authorize.js';
import { upload } from './middleware/upload.js';
import { uploadFile } from './controllers/file.js';
import { asyncHandler } from './middleware/asyncHandler.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const here = path.dirname(fileURLToPath(import.meta.url));

export const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

// Request log — makes it obvious from the terminal whether a failing request
// actually reached the API, which is the first thing to rule out.
if (!env.isProd) {
  app.use((req, res, next) => {
    const started = Date.now();
    res.on('finish', () => {
      console.log(
        `${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - started}ms)`
      );
    });
    next();
  });
}

// Same-origin in dev (Vite proxies /api), but keep CORS correct for direct calls.
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.use(
  '/uploads',
  express.static(path.join(here, 'uploads'), { maxAge: '1h', fallthrough: true })
);

app.get('/api/health', (req, res) => res.json({ ok: true, env: env.nodeEnv }));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/admin', adminRoutes);

app.post('/api/upload', requireAuth, requireActive, upload.single('file'), asyncHandler(uploadFile));

app.use(notFoundHandler);
app.use(errorHandler);
