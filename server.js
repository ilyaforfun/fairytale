const express = require('express');
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const config = require('./config');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 8000;

// Passport config
passport.use(new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL
  },
  (accessToken, refreshToken, profile, done) => {
    // Here you would typically find or create a user in your database
    // For now, we'll just pass the profile info
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.use(express.json());
app.use(session({
  secret: config.session.cookieKey,
  resave: false,
  saveUninitialized: true
}));

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

// Add this logging middleware
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'client/dist')));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Explicitly serve audio files with logging
app.use('/audio', (req, res, next) => {
  console.log(`Audio file requested: ${req.url}`);
  const audioPath = path.join(__dirname, 'public', 'audio', req.url);
  res.sendFile(audioPath, (err) => {
    if (err) {
      console.error(`Error serving audio file: ${err.message}`);
      next(err);
    }
  });
});

// Auth Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// For any other route, serve the index.html file from the React app build directory
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
