var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var	bodyParser = require('body-parser'); //parses information from POST
var	methodOverride = require('method-override'); //used to manipulate POST
var multer = require('multer');
var Media = require('../models/media');
var serve = require('../help/serve');

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/')
	},
	filename: function (req, file, cb) {
		var extension = (file.mimetype).split("/")[1];
		if (file.mimetype == 'audio/mpeg') extension = 'mp3';
		cb(null, Date.now()+"."+ extension)
	}
})

var upload = multer({storage:storage, fileFilter: function (req, file, cb) {
		console.log(file.mimetype);
		var ext = file.mimetype;
		if (ext !== 'image/png' && ext !== 'image/jpg' && ext !== 'image/bmp' && ext !== 'image/jpeg' && ext !== 'image/gif' && ext !== 'video/mp4' && ext !== 'video/webm' && ext !== 'audio/mpeg') {
			req.fileValidationError = 'goes wrong on the mimetype';
			return cb(null, false, new Error('goes wrong on the mimetype'));
		}
		cb(null, true);
	}
});

router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method
        delete req.body._method
        return method
      }
}))

router.route('/').get(function(req, res, next) {	
	mongoose.model('Media').find({}, function (err, mediafiles) {
		if (err) {
			return console.error(err);
		} else {
			serve(mediafiles,req,res);
		}     
	});
});

router.route('/kuvat').get(function(req, res, next) {	
	mongoose.model('Media').find({filetype: 'image'}, function (err, mediafiles) {
		if (err) {
			return console.error(err);
		} else {
			serve(mediafiles,req,res,'Kuvat');
		}     
	});
});

router.route('/videot').get(function(req, res, next) {	
	mongoose.model('Media').find({filetype: 'video'}, function (err, mediafiles) {
		if (err) {
			return console.error(err);
		} else {
			serve(mediafiles,req,res,'Videot');
		}     
	});
});

router.route('/aanet').get(function(req, res, next) {	
	mongoose.model('Media').find({filetype: 'audio'}, function (err, mediafiles) {
		if (err) {
			return console.error(err);
		} else {
			serve(mediafiles,req,res.'Äänet');
		}     
	});
});

router.get('/haku', function(req, res) {
    res.render('media/search', { 
		title: 'Haku',
		user: req.user,
		url: req.originalUrl,
		messages: req.flash()
	});
});

router.get('/laheta', function(req, res) {
    res.render('media/submit', {
		title: 'Lähetä tiedosto',
		user: req.user,
		url: req.originalUrl,
		messages: req.flash()
	});
});

router.post('/laheta', upload.single('submission'), function(req, res) {
	console.log("UPLOADING:    "+req.file.filename);
	if (req.fileValidationError != null) {
		req.flash('error','Tiedoston tyyppi ei ollut oikeanlainen.\nSallitut tiedostotyypit: .png .jpg .jpeg .bmp .gif .webm .mp3 .mp4');
		res.redirect('/galleria/media/laheta');
	}
	else {
		var newMedia = new Media();
		
		var ext = req.file.mimetype;
		ext = ext.substring(0, ext.indexOf("/"));
		
		var file_id = req.file.filename;
		file_id = file_id.substring(0, file_id.indexOf("."));
		
		newMedia.filename = req.file.filename;
		newMedia.file = file_id;
		newMedia.name = req.param('name');
		newMedia.desc = req.param('description');
		newMedia.filetype = ext;
		newMedia.approved = false;


		newMedia.save(function(err) {
			if (err){
				console.log('Error in saving media: '+err);  
				throw err;  
			}
			console.log('Media saving successful');    
			//return done(null, newMedia);
		});
		
		req.flash('success','Tiedosto lähetetty onnistuneesti');
		res.redirect('/galleria/media');

			
	}
});


module.exports = router;