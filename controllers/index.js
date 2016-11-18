var express = require('express');
var router = express.Router();

/*
 *	/	GET
 *
 *
 *
 *
 */
router.get('/', function (req, res) {
    res.render('index', {								//Näytetään etusivu
		title : 'Galleria',
		user: req.session.user,
		url: req.originalUrl,
		messages: req.flash()
	});
});

/*
 *	/LOGOUT	GET
 *
 *
 *
 *
 */
router.get('/logout', function(req, res) {
	console.log('Logging out: ' + req.session.user);
    req.session.destroy();
	//message(kirjauduttu ulos käyttäjältä x)
    res.redirect('/galleria');							//Ohjataan etusivulle
});

module.exports = router;
