const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// MongoDB Connection (Cached for Serverless)
let isConnected = false;
let mongod = null;

const connectToDatabase = async () => {
  if (isConnected) return;
  
  let MONGO_URL = process.env.MONGO_URL;
  const DB_NAME = process.env.DB_NAME || 'spectra_db';

  try {
    // If running locally and no MongoDB URL provided or connection refused, use In-Memory DB
    if (process.env.NODE_ENV !== 'production' && (!MONGO_URL || MONGO_URL.includes('localhost'))) {
        try {
            console.log('? Attempting to connect to local MongoDB...');
            await mongoose.connect(MONGO_URL, { dbName: DB_NAME, serverSelectionTimeoutMS: 2000 });
            isConnected = true;
            console.log('? Connected to Local MongoDB');
            return;
        } catch (localErr) {
            console.warn('? Local MongoDB not found, switching to In-Memory MongoDB...');
            const { MongoMemoryServer } = require('mongodb-memory-server');
            mongod = await MongoMemoryServer.create();
            MONGO_URL = mongod.getUri();
            console.log('? In-Memory MongoDB URI:', MONGO_URL);
        }
    }

    await mongoose.connect(MONGO_URL, { dbName: DB_NAME });
    isConnected = true;
    console.log('? Connected to MongoDB');
  } catch (err) {
    console.error('? MongoDB Connection Error:', err);
  }
};

// Connect to DB immediately if running locally
if (require.main === module) {
  connectToDatabase();
} else {
  // For serverless, connect inside the request handler or middleware
  app.use(async (req, res, next) => {
    await connectToDatabase();
    next();
  });
}

// Models
const StatusCheck = require('./models/StatusCheck');
const authRoutes = require('./routes/auth');
const balanceRoutes = require('./routes/balance');
const swapRoutes = require('./routes/swap');
const transferRoutes = require('./routes/transfer');
const depositRoutes = require('./routes/deposit');
const withdrawRoutes = require('./routes/withdraw');
const transactionRoutes = require('./routes/transactions');

// API Routes
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/balance', balanceRoutes);
apiRouter.use('/swap', swapRoutes);
apiRouter.use('/transfer', transferRoutes);
apiRouter.use('/deposit', depositRoutes);
apiRouter.use('/withdraw', withdrawRoutes);
apiRouter.use('/transactions', transactionRoutes);

apiRouter.get('/', (req, res) => {
  res.json({ message: "SpectraV2 API is running" });
});

// GET /api/status - List status checks
apiRouter.get('/status', async (req, res) => {
  try {
    const checks = await StatusCheck.find().sort({ timestamp: -1 }).limit(1000);
    res.json(checks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/status - Create status check
apiRouter.post('/status', async (req, res) => {
  try {
    const { client_name } = req.body;
    if (!client_name) {
      return res.status(400).json({ error: "client_name is required" });
    }

    const newCheck = new StatusCheck({ client_name });
    const savedCheck = await newCheck.save();
    res.status(201).json(savedCheck);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mount API routes
app.use('/api', apiRouter);

// Serve Static Frontend (Only in Local/Production Server Mode)
// In Vercel, Frontend is served separately
if (require.main === module) {
  const frontendPath = path.join(__dirname, '../frontend/build');
  app.use(express.static(frontendPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });

  // Start Server
  app.listen(PORT, () => {
    console.log(`
  ?? Server is running on http://localhost:${PORT}
  ? Frontend is being served at the same URL
    `);
  });
}

// Export for Vercel Serverless
module.exports = app;
