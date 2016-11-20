var express = require('express');
var router = express.Router();

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated()){
		return next();
	}
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}

module.exports = function(passport){

	router.get('/', function(req, res) {
		res.render('index', {
			title: 'Galleria',
			user: req.user,
			messages: req.flash()
		});
	});
	
	router.get('/login', function(req, res) {
		res.render('user/login', {
			title: 'Sisäänkirjautuminen',
			messages: req.flash()
		});
	});

	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: 'back',
		successFlash : true,
		failureRedirect: '/galleria/login',
		failureFlash : true  
	}));

	/* Handle Registration POST */
	router.post('/register', passport.authenticate('signup', {
		successRedirect: '/galleria',
		successFlash : true,
		failureRedirect: '/galleria/user/register',
		failureFlash : true  
	}));

	/* Handle Logout */
	router.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/galleria');
	});

	return router;
}
