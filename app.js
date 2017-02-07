var express = require('express');
var path = require('path');

var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

//DATABASE
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var db;

var config = require('config');

var env = config.util.getEnv('NODE_ENV');

if (env === 'development') {
	db = mongoose.connect('mongodb://localhost/galleria');
}
if (env === 'test') {
	db = mongoose.connect('mongodb://localhost/galleria_test');
}
if (env === 'production') {
	db = mongoose.connect('mongodb://localhost/galleria_production');
}

//APP
var app = express();

//MODELS
var user = require('./models/user');
var token = require('./models/token');

// STATIC PATHS
app.use(express.static(path.join(__dirname, '/public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// VIEWS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//PARSERS
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('secret'));

//PASSPORT
var passport = require('passport');

//SESSION
var session = require('express-session');

//SESSION STORAGE IN MONGODB
var MongoStore = require('connect-mongo')(session);

//SESSION SETUP
app.use(session({
    secret: 'mueph6ro',
	name: 'sessionId',
    resave: false,
    saveUninitialized: false,
	cookie: {
		secure: false
	},
	store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

//PASSPORT SETUP
app.use(passport.initialize());
app.use(passport.session());

//FLASH MESSAGES
var flash = require('connect-flash');
app.use(flash());

//PASSPORT INITIALIZE
var initPassport = require('./authentication/init');
initPassport(passport);


//ROUTES & CONTROLLERS
var routes = require('./controllers/index')(passport);
var user = require('./controllers/user');
var media = require('./controllers/media');

app.use('/', routes);
app.use('/user', user);
app.use('/media', media);

// 404
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;