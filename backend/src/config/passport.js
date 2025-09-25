const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const crypto = require('crypto');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ emailId: email });
        if (!user) {
            // Split name into first and last
            const [firstName, ...lastNameArr] = profile.displayName.split(' ');
            let lastName = lastNameArr.join(' ');
            if (!lastName || lastName.length < 3) {
                lastName = 'User'; // default lastName with at least 3 chars
            }
            user = await User.create({
                firstName: firstName || 'Google',
                lastName,
                emailId: email,
                password: crypto.randomBytes(32).toString('hex'), // random password
            });
        }
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport; 