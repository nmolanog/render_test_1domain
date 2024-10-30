require('dotenv').config();
const express = require("express");
const session = require("express-session");
const MemoryStore = require('memorystore')(session);
const passport = require("passport");
const cors= require("cors");
const initializePassport = require("./passportConfig");
// Import routes
const authRoutes = require('./routes/authRoutes');
const genericRoutes = require('./routes/genericRoutes');
const studentRoutes = require('./routes/studentRoutes');
const programRoutes = require('./routes/programRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const commitmenttRoutes = require('./routes/commitmentRoutes');
const appointmenttRoutes = require('./routes/appointmentRoutes');

const app = express();

// Middleware for parsing body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
const isProduction = process.env.NODE_ENV === "production";

// Trust the proxy (required for HTTPS in environments like Render)
if (isProduction) {
    app.set('trust proxy', 1); // Trust the first proxy (e.g., Render's load balancer)
}

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
    cookie: { secure: isProduction } // Set to true if using HTTPS
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

initializePassport();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', genericRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/program', programRoutes);
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/commitment', commitmenttRoutes);
app.use('/api/appointment', appointmenttRoutes);

app.use(express.static(path.join(__dirname, 'render_sgr1_client/build')));

// Catch-all route to send React frontend for any unmatched routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'render_sgr1_client/build', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Hi there: Server running on port ${PORT}`);
    console.log(`production state ${isProduction}`);
    console.log(`get process.env.TZ: ${process.env.TZ}`);
    console.log('Current Time Zone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
}).setTimeout(5000); // Set timeout to 5 seconds (can be increased if needed)
