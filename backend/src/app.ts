import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import studentsRoutes from './routes/studentsRoutes.js';
import postsRoutes from './routes/postsRoutes.js';
import commentsRoutes from './routes/commentsRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import videosRoutes from './routes/videosRoutes.js';
import questsRoutes from './routes/questsRoutes.js';
import badgesRoutes from './routes/badgesRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import announcementsRoutes from './routes/announcementsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import panelRoutes from './routes/panelRoutes.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
    credentials: true,
  })
);
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

// Prevent caching of API responses so clients always get fresh data (avoids 304 with stale/empty body).
app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/quests', questsRoutes);
app.use('/api/badges', badgesRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/panel', panelRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

export default app;
