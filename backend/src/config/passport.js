const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const userProfile = {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
          avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
        };
        return done(null, userProfile);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// We are not using session based auth (we use JWT), so we just pass the user through
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;
