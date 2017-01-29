var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');


//
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//
var flash = require('connect-flash');



//
var app = express();

//authentication
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

var user = require('./models/user');
var token = require('./models/token');

// VIEWS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// STATIC PATH
app.use(express.static(path.join(__dirname, '/public')));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('secret'));

var passport = require('passport');
//
var routes = require('./controllers/index')(passport);
var user = require('./controllers/user');
var media = require('./controllers/media');
//session init
app.use(session({
    secret: 'mueph6ro',
	name: 'sessionId',
    resave: false,
    saveUninitialized: false,
	cookie: {
		secure: false
	}
}));

app.use(passport.initialize());
app.use(passport.session());

//
app.use(flash());

var initPassport = require('./authentication/init');
initPassport(passport);


// ROUTES/CONTROLLERS
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
else mongoose.createConnection('mongodb://localhost/galleria_prod');

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