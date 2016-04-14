const handlebars = require('express-handlebars');
const io = require('socket.io')(http);
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

const express = require('express');
const app = express();
const http = require('http').createServer(app);

require('dotenv').load();

var models = require('./models');

// DB Connection
var db = mongoose.connection;
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://127.0.0.1/cogs121');
db.on('error', console.error.bind(console, 'Mongo DB Connection Error...'));
db.on('open', function (callback) {
	console.log("Database connected successfully.");
});

var router = {
	index: require('./routes/index')
};

var parser = {
	body: require('body-parser'),
	cookie: require('cookie-parser')
};

var strategy = { /* TODO */
	Twitter: require("passport-twitter").Strategy
};

// Session Middleware
var session_middleware = session({
	key: 'session',
	secret: process.env.SESSION_SECRET,
	saveUninitialized: true,
	resave: true,
	store: new MongoStore({ mongooseConnection: db })
});

// Middleware
app.set('port', process.env.PORT || 3000 );
app.engine('html', handlebars({ defaultLayout: 'default', extname: '.html' }));
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(parser.cookie());
app.use(parser.body.urlencoded({ extended: true }));
app.use(parser.body.json());
app.use(require('method-override')());
app.use(session_middleware);
app.use(passport.initialize());
app.use(passport.session());

// Passport Setup
passport.use(new strategy.Twitter ({
	consumerKey: process.env.TWITTER_CONSUMER_KEY,
	consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
	callbackURL: "/auth/twitter/callback"
}, function(token, token_secret, profile, done) {
	models.User.findOne({ "twitterID": profile.id }, function(err, user) {
	// (1) Check if there is an error. If so, return done(err);
	console.log("Logged into passport w/ strategy twitter: " + user 
		+ "\n" + profile.username);
	if (err) {return done(err); }
	var newUser = new models.User();

	if(!user) {
		// (2) since the user is not found, create new user.
		// Refer to Assignment 0 to how create a new instance of a model
		console.log("User does not exist. Creating user.");

		// Pull inputs from Twitter
		newUser.twitterID = profile.id;
		newUser.token = profile.token;
		newUser.username = profile.username;
		newUser.displayName = profile.displayName;
		// Save new user into datebase
		newUser.save(function(err) {
			if (err)
				throw err;
		})
		return done(null, profile);
	} else {
		console.log("User exists. Updating user.");

		// (3) since the user is found, update user’s information
		// newUser.twitter.id = profile.id;
		newUser.twitterID = profile.id;
		newUser.token = profile.token;
		newUser.username = profile.username;
		newUser.displayName = profile.displayName;

		process.nextTick(function() {
			return done(null, profile);
		});
	}
  });
}));
// passport.use(new FacebookStrategy({
// 		clientID: process.env.FACEBOOK_APP_ID,
// 		clientSecret: process.env.FACEBOOK_APP_SECRET,
// 		callbackURL: "http://localhost:3000/auth/facebook/callback"
// 	},
// 	function(accessToken, refreshToken, profile, cb) {
// 		User.findOrCreate({ facebookId: profile.id }, function (err, user) {
// 		  return cb(err, user);
// 		});
// 	}
// ));


passport.serializeUser( function (user, done) {
	done(null, user);
});

passport.deserializeUser( function (user, done) {
	done(null, user);
});

// Routes
app.get('/', router.index.view);

app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { successRedirect: '/',
                                     failureRedirect: '/' }));
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


// Helper Functions
function isLoggedIn (req, res, next) {
	if( req.user ) {
		next();
	} else {
		res.redirect('/');
	}
}
// Socket.io Usage

// Start Server 
http.listen(app.get('port'), function () {
	console.log('Express server listening on port ', app.get('port'));
})