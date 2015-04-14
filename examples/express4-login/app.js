var express = require('express')
  , app = express()
  , https = require('https')
  , fs = require('fs')
  , logger = require('express-logger')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , session = require('express-session')
  , methodOverride = require('method-override')
  , passport = require('passport')
  , TraktStrategy = require('passport-trakt').Strategy;

var TRAKT_CLIENT_ID = '--my-client-id--';
var TRAKT_CLIENT_SECRET = '--my-client-secret--';

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Trakt profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the TraktStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Trakt
//   profile), and invoke a callback with a user object.
passport.use(new TraktStrategy({
    clientID: TRAKT_CLIENT_ID,
    clientSecret: TRAKT_CLIENT_SECRET,
    callbackURL: 'https://127.0.0.1:3000/auth/trakt/callback'
  },
  function(accessToken, refreshToken, params, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      console.log(params);
      // To keep the example simple, the user's Trakt profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Trakt account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(logger({ path: __dirname + '/express.log' }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true }
}));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/trakt
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Trakt authentication will involve redirecting
//   the user to trakt.tv.  After authorization, Trakt will redirect the user
//   back to this application at /auth/trakt/callback
app.get('/auth/trakt',
  passport.authenticate('trakt'),
  function(req, res){
    // The request will be redirected to Trakt for authentication, so this
    // function will not be called.
  });

// GET /auth/trakt/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/trakt/callback',
  passport.authenticate('trakt', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Trakt only support HTTPS callback URL.
// Need to provide key and certificate to create the server.
var options = {
  key: fs.readFileSync('test/test.key.pem'),
  cert: fs.readFileSync('test/test.cert.pem')
};

https.createServer(options, app).listen(3000);
