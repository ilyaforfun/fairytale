module.exports = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback' // We'll use a relative URL for flexibility
  },
  session: {
    cookieKey: process.env.SESSION_COOKIE_KEY || 'defaultSecretKey' // It's better to use an environment variable for this
  }
};
