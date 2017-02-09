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
	res.redirect('./');
}

module.exports = function(passport){
	
	
	
	/*
	 *	/		GET
	 *
	 *	Etusivu
	 *	-Näyttää sivuston etusivun
	 */
	router.get('/', function(req, res) {
		res.render('index', {
			title: 'Galleria',
			user: req.user,
			messages: req.flash()
		});
	});
	
	
	
	/*
	 *	/LOGIN/		GET
	 *
	 *	Sisäänkirjautumissivu
	 *	-Näyttää varsinaisen sisäänkirjautumissivun
	 */
	router.get('/login', function(req, res) {
		res.render('user/login', {
			title: 'Sisäänkirjautuminen',
			messages: req.flash()
		});
	});

	
	
	/*
	 *	/LOGIN/		POST
	 *
	 *	Sisäänkirjautuminen
	 *	-Tarkastaan onko sisäänkirjautuminen hyväksytty
	 */
	router.post('/login', passport.authenticate('login', {
		//Kirjautumisen onnistuessa käyttäjä ohjataan sille sivulle mistä on kirjauduttu, olettaen että kirjauduttiin navbar:in kautta
		successRedirect: 'back',
		successFlash : true,
		//Epäonnistuessa käyttäjä ohjataan varsinaiselle kirjautumissivulle
		failureRedirect: './login',
		failureFlash : true  
	}));

	
	
	/*
	 *	/REGISTER/		POST
	 *
	 *	Rekisteröityminen
	 *	-Luo uuden käyttäjän
	 */
	router.post('/register', passport.authenticate('signup', {
		//Rekisteröinnin onnistuessa käyttä ohjataan etusivulle
		successRedirect: './',
		successFlash : true,
		//Epäonnistuessa käyttäjä ohjataan takaisin rekisteröitymissivulle
		failureRedirect: './user/register',
		failureFlash : true  
	}));

	
	
	/*
	 *	/LOGOUT/		GET
	 *
	 *	Uloskirjautuminen
	 *	-Kirjaa käyttäjän ulos ja ohjaa etusivulle
	 */
	router.get('/logout', function(req, res) {
		//Kirjataan käyttäjä ulos
		req.logout();
		//Ohjaus etusivulle
		res.redirect('./');
	});

	return router;
}
