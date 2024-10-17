function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); // If authenticated, proceed to the next middleware or route handler
    } else {
        return res.status(401).json({ error: "User not authenticated" });
    }
}

module.exports = isAuthenticated;