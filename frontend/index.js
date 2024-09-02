require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;


const http = require('http').createServer(app);
const io = require('socket.io')(http);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Passport Spotify Strategy
passport.use(new SpotifyStrategy({
    clientID: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    callbackURL: "https://spotifymusicapp-458d3e37c242.herokuapp.com/"
  },
  function(accessToken, refreshToken, expires_in, profile, done) {
    // Save accessToken, refreshToken, and profile info
    // Typically you'd save these to a database
    return done(null, profile);
  }
));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Routes
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/auth/spotify', passport.authenticate('spotify', { scope: ['user-read-email'] }));

app.get('/auth/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to frontend
    res.redirect('/dashboard');
  }
);


io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('joinSession', (sessionCode) => {
      socket.join(sessionCode);
  });
  
  socket.on('queueSong', (data) => {
      io.to(data.sessionCode).emit('updateQueue', data.song);
  });
  
  socket.on('disconnect', () => {
      console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

http.listen(PORT, () => console.log(`Server running on port ${PORT}`));