require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;

passport.use(new SpotifyStrategy({
    clientID: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/spotify/callback"
  },
  function(accessToken, refreshToken, expires_in, profile, done) {
    // Save accessToken, refreshToken, and profile info
    return done(null, profile);
  }
));

app.use(passport.initialize());
app.get('/auth/spotify', passport.authenticate('spotify'));
app.get('/auth/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to frontend
    res.redirect('/dashboard');
  }
);
