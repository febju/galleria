var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var	bodyParser = require('body-parser');
var	methodOverride = require('method-override');
var multer = require('multer');
var Media = require('../models/media');
var serve = require('../help/serve');
var filter = require('../help/filter');

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


/*
 *	/MEDIA/				GET
 *
 *	Mediagallerian etusivu
 *
 *
 */
router.route('/').get(function(req, res, next) {
	var title = 'Mediagalleria';
	var path = '';
	if (typeof req.query.id == "undefined"){
		var all = Media.find().exec();
		all.then(function(mediafiles) {
			serve(mediafiles,req,res,title,path);
		})
		.catch(function(err){
			console.log('error:', err);
		});
	} else {
		var detailmedia;
		var prev;
		var next;
		var browse_files = [];
		var max;
		var min;
		var previous_file;
		var next_file;
		var single = Media.findOne({file : req.query.id}).exec();
		single.then(function(media) {
			detailmedia = media;
 			prev = media._id-1;
			next = media._id+1;
		})
		.then(function() {
			return Media.findOne().sort({_id: 'desc'}).exec();
		})
		.then(function(id_max) {
			max = id_max._id;
			//console.log('MAX: '+max);
		})
		.then(function() {
			return Media.findOne().sort({_id: 'asc'}).exec();
		})
		.then(function(id_min) {
			min = id_min._id;
			//console.log('MIN: '+min);
		})
		.then(function() {
			return Media.find({$or: [{_id : prev},{_id : next}]}).exec();
		})
		.then(function(neighbors) {
			if ((detailmedia._id != min) || (detailmedia._id != max)) {
				if (detailmedia._id != min && detailmedia._id != max) {
					previous_file = neighbors[0];
					next_file = neighbors[1];
				}
				if (detailmedia._id == min) next_file = neighbors[0];
				if (detailmedia._id == max) previous_file = neighbors[0];
			}
			res.render('media/detail', {
				title: detailmedia.name,
				user: req.user,
				url: req.originalUrl,
				file: detailmedia,
				prev: previous_file,
				next: next_file
			});
		})
		.catch(function(err){
			console.log('error:', err);
		});
	}
});



/*
 *	/MEDIA/IMAGE		GET
 *
 * Mediagallerian kuvakategorian etusivu
 *
 *
 */
router.route('/image').get(function(req, res, next) {
	var title = 'Kuvat';
	var path = '/image';
	var images = Media.find( { filetype: 'image' } ).exec();
	images.then(function(mediafiles) {
		serve(mediafiles,req,res,title,path);
	})
	.catch(function(err){
		console.log('error:', err);
	});
});



/*
 *	/MEDIA/VIDEO		GET
 *
 * Mediagallerian videokategorian etusivu
 *
 *
 */
router.route('/video').get(function(req, res, next) {
	var title = 'Videot';
	var path = '/video';
	var videos = Media.find( { filetype: 'video' } ).exec();
	videos.then(function(mediafiles) {
		serve(mediafiles,req,res,title,path);
	})
	.catch(function(err){
		console.log('error:', err);
	});
});



/*
 *	/MEDIA/AUDIO		GET
 *
 * Mediagallerian audiokategorian etusivu
 *
 *
 */
router.route('/audio').get(function(req, res, next) {
	var title = 'Äänet';
	var path = '/audio';
	var audio = Media.find( { filetype: 'audio' } ).exec();
	audio.then(function(mediafiles) {
		serve(mediafiles,req,res,title,path);
	})
	.catch(function(err){
		console.log('error:', err);
	});
});



/*
 *	/MEDIA/SEARCH		GET
 *
 *	Mediagallerian hakusivu
 *
 *
 */
router.get('/search', function(req, res) {
	req.flash('error','Pyytämääsi mediasivua ei ole olemassa.');
    res.redirect('/galleria/media');
});



/*
 *	/MEDIA/SEARCH		POST
 *
 *	Mediagallerian hakusivu
 *
 *
 */
router.post('/search', function(req, res) {
	var title = 'Haku';
	var path = '/search';
	var filetype = req.body.filetype;
	var attribute = req.body.attribute;
	var search = req.body.query;
	var filtered = [];
	if ( typeof (req.body.attribute) == 'object') {
		mongoose.model('Media').find( { $or: [{ name: new RegExp( search, 'i') }, { desription: new RegExp( search, 'i') } ] }, function (err, mediafiles) {
			if (err) {
				return console.error(err);
			} else {
				filtered = filter(filetype,mediafiles,req);
				serve(filtered,req,res,title,path);
			}
		});
	}
	else {
		if (attribute == 'name') {
			mongoose.model('Media').find( { name: new RegExp( search, 'i') }, function (err, mediafiles) {
				if (err) {
					return console.error(err);
				} else {
					filtered = filter(filetype,mediafiles,req);
					serve(filtered,req,res,title,path);
				}
			});
		}
		else {
			mongoose.model('Media').find( { description: new RegExp( search, 'i') }, function (err, mediafiles) {
				if (err) {
					return console.error(err);
				} else {
					filtered = filter(filetype,mediafiles,req);
					serve(filtered,req,res,title,path);
				}
			});
		}
	}
});



/*
 *	/MEDIA/SUBMIT		GET
 *
 *	Median lähetyssivu
 *	-Käyttäjä syöttää haluamansa tiedoston ja sille tarvitut tiedot.
 *
 */
router.get('/submit', function(req, res) {
    res.render('media/submit', {
		title: 'Lähetä tiedosto',
		user: req.user,
		url: req.originalUrl,
		messages: req.flash()
	});
});



/*
 *	/MEDIA/SUBMIT		POST
 *
 *	Median lähetyssivu
 *	-Median tiedot talletetaan tietokantaan ja mediatiedosto talletetaan palvelimelle.
 *
 */
router.post('/submit', upload.single('submission'), function(req, res) {
	console.log("UPLOADING:    "+req.file.filename);
	if (req.fileValidationError != null) {
		req.flash('error','Tiedoston tyyppi ei ollut oikeanlainen.\nSallitut tiedostotyypit: .png .jpg .jpeg .bmp .gif .webm .mp3 .mp4');
		res.redirect('/galleria/media/submit');
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
		res.redirect('../media');

	}
});


module.exports = router;