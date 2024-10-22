require('dotenv').config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const pool = require("./db");
const bcrypt = require("bcryptjs");
const initializePassport = require("./passportConfig");
const path = require('path');  // Import path for serving static files
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

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        /*
        secure: isProduction && app.get('trust proxy') === 1, // Only secure if in production and using HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        sameSite: isProduction ? "None" : "Lax" // 'None' for cross-origin requests in production, 'Lax' otherwise
        */
        secure: true
    }
}));

// Trust the proxy (required for HTTPS in environments like Render)
if (isProduction) {
    app.set('trust proxy', 1); // Trust the first proxy (e.g., Render's load balancer)
}

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
