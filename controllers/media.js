var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var	bodyParser = require('body-parser');
var	methodOverride = require('method-override');
var multer = require('multer');
var Media = require('../models/media');
var serve = require('../help/serve');	//Apufunktio mediatiedostojen selausnäkymän luomiseksi
var filter = require('../help/filter');	//Apufunktio hakutulosten suodattamiseksi ja hakutoiminnon tukemiseksi

/*
 * Mediatiedostojen talletus palvelimelle
 * Kohde: /uploads/
 * Tallennusnimi: aika ja tiedostopääte (123456789.jpg)
 * mp3-tiedostot tunnistetaan "audio/mpeg"-tyypiksi. Erityisehto tarpeellinen, jotta ne saadaan tallennettua mp3-päätteellä.
 */
var storage = multer.diskStorage({
	//Tallennuskohde
	destination: function (req, file, cb) {
		cb(null, 'uploads/')
	},
	//Tiedostonimi tallennettavalle tiedostolle
	filename: function (req, file, cb) {
		//Otetaan tiedostopääte
		var extension = (file.mimetype).split("/")[1];
		//Vaihdetaan pääte, jos mp3-tiedosto
		if (file.mimetype == 'audio/mpeg') extension = 'mp3';
		//Palautetaan tiedostonimi. Nimenä luomisaika ja tiedostopääte
		cb(null, Date.now()+"."+ extension)
	}
})

/*
 * Mediatiedostojen lähetys palvelimelle
 *
 *
 *
 */
var upload = multer({storage:storage, fileFilter: function (req, file, cb) {
		//console.log(file.mimetype);
		//Selvitetään tiedostotyyppi
		var ext = file.mimetype;
		//Tarkistetaan kuuluuko tiedostotyyppi hyväksyttyihin
		if (ext !== 'image/png' && ext !== 'image/jpg' && ext !== 'image/bmp' && ext !== 'image/jpeg' && ext !== 'image/gif' && ext !== 'video/mp4' && ext !== 'video/webm' && ext !== 'audio/mpeg') {
			//Palautetaan virhe jos tiedosto ei ole hyväksytyn tyyppinen
			req.fileValidationError = 'goes wrong on the mimetype';
			return cb(null, false, new Error('goes wrong on the mimetype'));
		}
		//Hyväksytään tiedosto, jos se ei riko ehtoja
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
 * Mediagallerian etusivu + yksittäisten tiedostojen tarkastelu
 * -Näyttää etusivu näkymän, jos parametrina ei tule id:tä 
 * -Jos id parametri, niin näytetään kyseisen median yksittäissivu
 * -Jakaa näytettävät mediat eri sivuille, 20 tiedostoa per sivu
 */
router.route('/').get(function(req, res, next) {
	var title = 'Mediagalleria';	//Sivun otsikko
	var path = '';					//Polku, johon palataan, jos virhe tapahtuu
	if (typeof req.query.id == "undefined"){									//Ei id-parametria
		//Haetaan kaikki mediatiedostot
		var all_query = Media.find().exec();
		all_query.then(function(all) {
			//Kutsutaan apufunktiota, joka vastaa tiedostojen näyttämisestä
			serve(all,req,res,title,path);
		})
		.catch(function(err){
			console.log('error:', err);
		});
	} else {																	//Yksittäisnäkymä parametrina saadulle tiedostolle
		var detailmedia;			//Tarkasteltavan mediatiedoston tiedot
		var prev;					//Edellisen tiedoston _id
		var next;					//Seuraavan tiedoston _id
		var max;					//Tietokannan suurin id
		var min;					//Tietokannan pienin id
		var previous_file;			//Edellisen tiedoston tiedot
		var next_file;				//Seuraavan tiedoston tiedot
		var single_query = Media.findOne({file : req.query.id}).exec();
		//Haetaan tarkasteltava tiedosto
		single_query.then(function(single) {
			//Otetaan tarkasteltavan tiedoston tiedot
			detailmedia = single;
			//Asetetaan edellisen ja seuraavan tiedoston _id:t
			/*
				HUOM!!!!!!!!!!
				EI TOIMI JOS VÄLISTÄ PUUTTUU TIEDOSTOJA
				KUN POISTOT MAHDOLLISTETAAN TÄYTYY VAIHTAA KEINOA
			*/
 			prev = single._id-1;
			next = single._id+1;
		})
		//Haetaan suurimman _id:n omaava tiedosto
		.then(function() {
			return Media.findOne().sort({_id: 'desc'}).exec();
		})
		//Talletaan pienin _id
		.then(function(id_max) {
			max = id_max._id;
			//console.log('MAX: '+max);
		})
		//Haetaan pienimmän _id:n omaava tiedosto
		.then(function() {
			return Media.findOne().sort({_id: 'asc'}).exec();
		})
		//Talletetaan pienin _id
		.then(function(id_min) {
			min = id_min._id;
			//console.log('MIN: '+min);
		})
		//Kun tiedetään suurin ja pienin :id voidaan tietää, ollaanko ensimmäisessä tai viimeisessä tiedostossa
		//Haetaan tiedostot, joilla on seuraavan tai edellisen tiedoston _id
		.then(function() {
			return Media.find({$or: [{_id : prev},{_id : next}]}).exec();
		})
		//Kaikki oleelliset tiedot edellisestä ja seuraavasta tiedostosta on kasattu
		.then(function(neighbors) {
			//Jos tiedosto on sekä suurin ja pienin eli ainoa, ei tarvitse asettaa naapuroivia tiedostoja
			if ((detailmedia._id != min) || (detailmedia._id != max)) {
				//Tarkastetaan onko tiedosto ensimmäinen tai viimeinen
				if (detailmedia._id != min && detailmedia._id != max) {		//Jos tiedosto ei ole ensimmäinen tai viimeinen saa se sekä edellisen että seuraavan tiedoston
					previous_file = neighbors[0];
					next_file = neighbors[1];
				}
				//Jos tiedosto on ensimmäinen, ei sillä voi olla edellistä tiedostoa
				if (detailmedia._id == min) next_file = neighbors[0];
				//Jos tiedosto on viimeinen, ei sillä voi olla seuraavaa tiedostoa
				if (detailmedia._id == max) previous_file = neighbors[0];
			}
			//Näytetään yksittäisen tiedoston oma näkymä
			res.render('media/detail', {
				title: detailmedia.name,
				user: req.user,
				url: req.originalUrl,
				file: detailmedia,
				//Edellinen tiedosto
				prev: previous_file,
				//Seuraava tiedosto
				next: next_file
			});
		})
		.catch(function(err){
			//console.log('error:', err);
			req.flash('error', 'Pyydettyä mediaa ei ole olemassa.');
			res.redirect('../media');
		});
	}
});



/*
 *	/MEDIA/IMAGE		GET
 *
 * Mediagallerian kuvakategorian etusivu
 * -Näyttää kaikki kuvatiedostot
 * -Toimii, kuten /media, mutta ei vastaanota parametreja
 */
router.route('/image').get(function(req, res, next) {
	var title = 'Kuvat';	//Sivun otsikko
	var path = '/image';	//Polku johon palataan, jos virhe tapahtuu
	//Haetaan vain kuvatiedostot
	var image_query = Media.find( { filetype: 'image' } ).exec();
	image_query.then(function(image) {
		//Kutsutaan apufunktiota, joka vastaa tiedostojen näyttämisestä
		serve(image,req,res,title,path);
	})
	.catch(function(err){
		console.log('error:', err);
	});
});



/*
 *	/MEDIA/VIDEO		GET
 *
 * Mediagallerian videokategorian etusivu
 * -Näyttää kaikki videotiedostot
 */
router.route('/video').get(function(req, res, next) {
	var title = 'Videot';	//Sivun otsikko
	var path = '/video';	//Polku johon palataan, jos virhe tapahtuu
	//Haetaan vain videotiedostot
	var video_query = Media.find( { filetype: 'video' } ).exec();
	video_query.then(function(videos) {
		//Kutsutaan apufunktiota, joka vastaa tiedostojen näyttämisestä
		serve(videos,req,res,title,path);
	})
	.catch(function(err){
		console.log('error:', err);
	});
});



/*
 *	/MEDIA/AUDIO		GET
 *
 * Mediagallerian audiokategorian etusivu
 * -Näyttää kaikki äänitiedostot
 * -Toimii, kuten /media, mutta ei vastaanota parametreja
 */
router.route('/audio').get(function(req, res, next) {
	var title = 'Äänet';	//Sivun otsikko
	var path = '/audio';	//Polku johon palataan, jos virhe tapahtuu
	//Haetaan vain äänitiedostot
	var audio_query = Media.find( { filetype: 'audio' } ).exec();
	audio_query.then(function(audio) {
		//Kutsutaan apufunktiota, joka vastaa tiedostojen näyttämisestä
		serve(audio,req,res,title,path);
	})
	.catch(function(err){
		console.log('error:', err);
	});
});



/*
 *	/MEDIA/SEARCH		GET
 *
 * Mediagallerian hakusivu
 * -Erillinen hakusivu ei ole käytössä
 * - Kaikki haut tapahtuvat POST-pyynnöillä, ilman erillistä hakusivua
 * -Jos kuitenkin saadaan GET-pyyntö ohjataan käyttäjä media etusivulle
 */
router.get('/search', function(req, res) {
	req.flash('error','Pyytämääsi mediasivua ei ole olemassa.');
    res.redirect('/galleria/media');
});



/*
 * /MEDIA/SEARCH		POST
 *
 * Mediagallerian hakutulokset
 *
 *
 */
router.post('/search', function(req, res) {
	var title = 'Haku';		//Sivun otsikko
	var path = '/search';	//Polku johon palataan, jos virhe tapahtuu
	var filetype = req.body.filetype;		//voi rajoittaa tiedostotyyppiä, eli: kuva, video tai ääni
	var attribute = req.body.attribute;		//voi rajoittaa hakukohdetta, eli: nimi tai kuvaus
	var search = req.body.query;			//hakusana
	var filtered = [];
	//Tarkkistetaan onko hakukohdetta rajoitettu
	//Jos attribute on object on kyseessä taulu ja on valittu molemmat vaihtoehdot, eli rajoitusta ei ole.
	//Ratkaisua pitäisi muokata, jos kenttiä olisi enemmän.
	//Haetaan siis molemmista kentistä
	if ( typeof (req.body.attribute) == 'object') {
		//Haetaan molemmista kentistä (nimi ja kuvaus) hakusanan esiintymisiä
		mongoose.model('Media').find( { $or: [{ name: new RegExp( search, 'i') }, { desription: new RegExp( search, 'i') } ] }, function (err, mediafiles) {
			if (err) {
				return console.error(err);
			} else {
				//Kutsutaan apufunktiota, joka karsii tiedostotyyppien perusteella
				filtered = filter(filetype,mediafiles,req);
				//Kutsutaan apufunktiota, joka vastaa tiedostojen näyttämisestä
				serve(filtered,req,res,title,path);
			}
		});
	}
	//Jos attribute ei ollut taulu, on toinen kenttä suljettu hausta pois
	//attribute saadaan suoraan stringinä
	else {
		if (attribute == 'name') {
			//Haetaan nimi-kentästä hakusanan esiintymisiä
			mongoose.model('Media').find( { name: new RegExp( search, 'i') }, function (err, mediafiles) {
				if (err) {
					return console.error(err);
				} else {
					//Kutsutaan apufunktiota, joka karsii tiedostotyyppien perusteella
					filtered = filter(filetype,mediafiles,req);
					//Kutsutaan apufunktiota, joka vastaa tiedostojen näyttämisestä
					serve(filtered,req,res,title,path);
				}
			});
		}
		else {
			//Haetaan kuvaus-kentästä hakusanan esiintymisiä
			mongoose.model('Media').find( { description: new RegExp( search, 'i') }, function (err, mediafiles) {
				if (err) {
					return console.error(err);
				} else {
					//Kutsutaan apufunktiota, joka karsii tiedostotyyppien perusteella
					filtered = filter(filetype,mediafiles,req);
					//Kutsutaan apufunktiota, joka vastaa tiedostojen näyttämisestä
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
 */
router.get('/submit', function(req, res) {
	//Näytetään median lähetyssivu
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
 *	-Lähetetyn median tiedot talletetaan tietokantaan ja mediatiedosto talletetaan palvelimelle.
 */
router.post('/submit', upload.single('submission'), function(req, res) {
	//console.log("UPLOADING:    "+req.file.filename);
	if (req.fileValidationError != null) {																										//Vääränlainen tiedostotyyppi
		//Ohjataan käyttäjä takaisin median lähetyssivulle
		req.flash('error','Tiedoston tyyppi ei ollut oikeanlainen.\nSallitut tiedostotyypit: .png .jpg .jpeg .bmp .gif .webm .mp3 .mp4');
		res.redirect('/galleria/media/submit');
	}
	else {																																		//Hyväksytty tiedostotyyppi
		var newMedia = new Media();
		//Otetaan tiedostopääte mimetypen avulla
		var ext = req.file.mimetype;
		ext = ext.substring(0, ext.indexOf("/"));
		//Otetaan tiedoston "id", eli sen nimeksi asetettu numerosarja(sen luomisaika) ilman tiedostopäätettä
		var file_id = req.file.filename;
		file_id = file_id.substring(0, file_id.indexOf("."));
		//Luodaan media mallin mukainen olio
		newMedia.filename = req.file.filename;
		newMedia.file = file_id;
		newMedia.name = req.body.name;
		newMedia.desc = req.body.description;
		newMedia.filetype = ext;
		newMedia.approved = false;
		//Talletetaan median tiedot tietokantaan
		newMedia.save(function(err) {
			if (err){
				console.log('Error in saving media: '+err);  
				throw err;  
			}
			//console.log('Media saving successful');    
			//return done(null, newMedia);
		});
		//Ohjataan käyttäjä media sivulle onnistuneen lisäyksen jälkeen.
		req.flash('success','Tiedosto lähetetty onnistuneesti');
		res.redirect('../media');
	}
});


module.exports = router;