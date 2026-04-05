const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();   
connectDB();              

const app = express();

// 🛡️ SECURITY: Configure CORS for production
const allowedOrigins = [
  'http://localhost:8100', // Development
  'https://digital-id-app.onrender.com' // Production
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

const idRoutes = require('./routes/id.routes');
app.use('/api/id', idRoutes);

app.get('/', (req, res) => {
  res.send('Digital ID Backend Running');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});