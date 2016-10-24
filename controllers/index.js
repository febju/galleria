var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
	//req.flash('info','ebin');
	//console.log(req.session.user);
    res.render('index', {
		title : 'Galleria',
		user: req.session.user,
		url: req.originalUrl,
		//messages: req.flash('info')
	});
});

router.get('/logout', function(req, res) {
    req.session.destroy();
	//req.flash('info','ebin');
    res.render('index', {
		title : 'Galleria',
		user: req.session.user,
		url: req.originalUrl,
		//messages: req.flash('info')
	});
});

module.exports = router;
