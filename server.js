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

var strategy = {

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
// passport.use( strategy.Facebook );

// passport.serializeUser( function (user, done) {
// 	done(null, user);
// });

// passport.deserializeUser( function (user, done) {
// 	done(null, user);
// });

// Routes
app.get('/', router.index.view);

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