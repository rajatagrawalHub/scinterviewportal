require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// === API Routes ===
const authRoutes = require('./routes/auth');
const candidatesRoute = require('./routes/candidates');
const formRoutes = require('./routes/form');
const evalRoutes = require('./routes/evaluation');
const pdfRoute = require('./routes/pdf');

app.use('/api/user', authRoutes);
app.use('/api/candidates', candidatesRoute);
app.use('/api/forms', formRoutes);
app.use('/api/evaluation', evalRoutes);
app.use('/api', pdfRoute);



// === MongoDB and Server Start ===
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  const PORT =  5000;
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// === Serve React Frontend (AFTER API routes) ===
app.use(express.static(path.join(__dirname, 'build')));