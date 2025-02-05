import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import userModel from '../Model/user.model.js';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await userModel.findOne({ googleId: profile.id });

        if (!user) {
          user = new userModel({
            googleId: profile.id,
            fullName: profile.displayName,
            email: profile.emails[0].value,
            profilePicture: profile.photos[0].value,
            isVerified: true
          });
          await user.save();
        }

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);


// Serialize and deserialize user to save in the session
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

export default passport;