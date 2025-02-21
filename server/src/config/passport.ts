import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model";

// Serialize the user for the session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize the user from the session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.error("Deserialize error:", error);
    done(error, null);
  }
});

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "http://localhost:8080/api/auth/google/callback",
      proxy: true,
      state: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Create new user if doesn't exist
          user = await User.create({
            googleId: profile.id,
            email: profile.emails![0].value,
            displayName: profile.displayName,
            avatar: profile.photos![0].value,
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("Google Strategy Error:", error);
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;
