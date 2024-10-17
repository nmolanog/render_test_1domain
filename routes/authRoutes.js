const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const router = express.Router();
const pool = require('../db');
const isAuthenticated = require("../middleware/authMiddleware");

router.post("/register", async (req, res) => {
    const { name, email, password, usertype } = req.body;  // Include usertype

    try {
        // Check if user already exists
        const userExists = await pool.query("SELECT * FROM users WHERE user_email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user into the database with usertype
        await pool.query(
            "INSERT INTO users (user_name, user_email, user_password, usertype) VALUES ($1, $2, $3, $4)",
            [name, email, hashedPassword, usertype]
        );

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});


router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);  // Handle errors properly
        }
        if (!user) {
            return res.status(400).json({ message: "Login failed. Check your email and password." });  // No user found or incorrect credentials
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);  // Handle login error
            }
            return res.status(200).json({ message: "Logged in successfully", usertype: user.usertype });  // Send a successful response
        });
    })(req, res, next);  // This is needed to call passport.authenticate
});


router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);  // Pass any errors to the next middleware
        }
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            }
            res.clearCookie('connect.sid', { path: '/' });  // Clear the session cookie
            return res.status(200).json({ message: "Logged out successfully" });
        });
    });
});

router.get("/status", (req, res) => {
    if (req.isAuthenticated()) {
        // Assuming user object has usertype
        res.json({
            isAuthenticated: true,
            username: req.user.user_name,
            usertype: req.user.usertype,  // Send the usertype to the client
            userid: req.user.user_id
        });
    } else {
        res.json({
            isAuthenticated: false,
            usertype: null
        });
    }
});

router.get("/verify_password/:id", isAuthenticated, async (req, res) => {
        const { id } = req.params;
        const { oldPassword } = req.query;  // Extract oldPassword from query parameters

        try {
            // Execute the query
            const result = await pool.query("SELECT user_password from users WHERE user_id = $1", [id]);
            const dbPassword = result.rows[0].user_password;
            const isMatch = await bcrypt.compare(oldPassword, dbPassword);
            res.status(200).json(isMatch ? "verified" : "not verified");
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: "Internal server error" });
        }

});


router.put("/editpassword/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;

            if (id !== req.user.user_id) {
                return res.status(403).json({ error: "Unauthorized: Cannot change another user's password" });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            const updatePassword = await pool.query("UPDATE users SET user_password = $1 WHERE user_id = $2", [hashedPassword, id]);
            res.status(200).json(`user with id ${id} updated password sucessfully`);
        } catch (err) {
            console.error(err.message);
        }
});

module.exports = router;