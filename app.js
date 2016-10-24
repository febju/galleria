var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');


//
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//authentication
var mongoose = require('mongoose');
var db = require('./models/db');
var user = require('./models/user');
var token = require('./models/token');

//
var flash = require('connect-flash');

//
var routes = require('./controllers/index');
var user = require('./controllers/user');
var media = require('./controllers/media');

//
var app = express();

// VIEWS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('secret'));

//
app.use(flash());

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

// STATIC PATH
app.use(express.static(path.join(__dirname, '/public')));

// ROUTES/CONTROLLERS
app.use('/', routes);
app.use('/user', user);
app.use('/media', media);

// MONGOOSE INIT
mongoose.createConnection('mongodb://localhost/galleria');

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