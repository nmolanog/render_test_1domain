const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const pool = require("./db"); 

function initializePassport() {
    passport.use(new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password"
        },
        async (email, password, done) => {
            try {
                const result = await pool.query("SELECT * FROM users WHERE user_email = $1", [email]);
                if (result.rows.length === 0) {
                    return done(null, false, { message: "No user with that email" });
                }

                const user = result.rows[0];

                const isMatch = await bcrypt.compare(password, user.user_password);
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: "Incorrect password" });
                }
            } catch (err) {
                return done(err);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, { id: user.user_id});
    });

    passport.deserializeUser(async (userObj, done) => {
        try {
            const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [userObj.id]);
            if (result.rows.length > 0) {
                const user = result.rows[0];
                /*user.usertype = userObj.usertype;*/
                done(null, user);
            } else {
                done(new Error("User not found"), null);
            }
        } catch (err) {
            done(err);
        }
    });
}

module.exports = initializePassport;