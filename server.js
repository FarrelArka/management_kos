require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const kosRoutes = require('./routes/kos');
const reviewRoutes = require('./routes/reviews');
const bookingRoutes = require('./routes/bookings');
const cookieParser = require("cookie-parser");


const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
  credentials: true
}));
// ⬇️ Tambahin header manual di sini
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use(cookieParser());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/kos', kosRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 5050;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    // Hati-hati: sync({ alter: true }) untuk dev; di production gunakan migration
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  } catch (err) {
    console.error('Unable to start app', err);
  }
})();
