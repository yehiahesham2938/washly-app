const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const centersRoutes = require('./routes/centers');
const homePackagesRoutes = require('./routes/homePackages');
const bookingsRoutes = require('./routes/bookings');
const usersRoutes = require('./routes/users');
const vendorRequestsRoutes = require('./routes/vendorRequests');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: '12mb' }));

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Washly API is running',
    jwtConfigured: Boolean((process.env.JWT_SECRET || '').trim()),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/centers', centersRoutes);
app.use('/api/home-packages', homePackagesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/vendor-requests', vendorRequestsRoutes);

// Catch async failures / rejects that bypass route try/catch (Express 5)
app.use((err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  console.error('[api]', req.method, req.path, err);
  const msg = err instanceof Error ? err.message : String(err);
  const exposeStack = process.env.NODE_ENV !== 'production';
  const detail =
    err instanceof Error
      ? exposeStack
        ? err.stack || err.message
        : err.message
      : String(err);
  res.status(Number(err.status) || Number(err.statusCode) || 500).json({
    message: msg || 'Server error',
    detail,
  });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      const jwtOk = Boolean((process.env.JWT_SECRET || '').trim());
      console.log(`Server running on port ${PORT} (http://localhost:${PORT} and http://127.0.0.1:${PORT})`);
      console.log(`[washly] JWT_SECRET loaded: ${jwtOk}`);
      if (!jwtOk) {
        console.error('[washly] Set JWT_SECRET in server/.env — auth routes will fail.');
      }
    });
  } catch (error) {
    console.error(`Server startup error: ${error.message}`);
    process.exit(1);
  }
};

startServer();
