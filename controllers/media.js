var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var	bodyParser = require('body-parser'); //parses information from POST
var	methodOverride = require('method-override'); //used to manipulate POST
	
router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}))

router.route('/')

.get(function(req, res, next) {
	res.format({
		//HTML response will render the index.jade file in the views/blobs folder. We are also setting "blobs" to be an accessible variable in our jade view
		html: function(){
			res.render('media/index', {
				title: 'Media',
				user : req.session.user,
				url: req.originalUrl
			});
		},
		//JSON response will show all blobs in JSON format
	});
})

router.get('/haku', function(req, res) {
    res.render('media/search', { 
		title: 'Haku',
		user : req.session.user,
		url: req.originalUrl
	});
});

router.get('/lisaa', function(req, res) {
    res.render('media/submit', {
		title: 'Lisää',
		user : req.session.user,
		url: req.originalUrl
	});
});

module.exports = router;