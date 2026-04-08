const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const connectDB = require('./config/db');
connectDB();

const app = express();

// 🛡️ SECURITY: Configure CORS for production
app.use(cors()); // 🛡️ Temporarily allow all origins for stability during debug

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

const idRoutes = require('./routes/id.routes');
app.use('/api/id', idRoutes);

app.get('/', (req, res) => {
  res.send('Digital ID Backend Running');
});

// 🚨 GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('🔥 UNHANDLED ERROR:', err.stack);
  res.status(500).json({
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});