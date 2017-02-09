var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var	bodyParser = require('body-parser'); //parses information from POST
var	methodOverride = require('method-override'); //used to manipulate POST
	
router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
	if (req.body && typeof req.body === 'object' && '_method' in req.body) {
		var method = req.body._method
		delete req.body._method
		return method
	}
}))

/*
 *	/USER/LOGIN		GET
 *
 *	Sisäänkirjautumissivu
 *	-Käyttäjä voi halutessaan kirjautua sisään tältä sivulta.
 *	-Sisältää linkit rekisteröitymiseen ja salasanan resetoimiseen.
 *
 */
router.get('/login', function(req, res) {
	res.render('user/login', {
		title : 'Sisäänkirjautuminen',
		url: req.originalUrl,
		user: req.user,
		messages: req.flash()
	});
});



/*
 *	/USER/REGISTER		GET
 *
 *	Rekisteröitymissivu
 *	-Uuden käyttäjän on mahdollista rekisteröityä tällä sivulla.
 *
 */
router.get('/register', function(req, res) {
	res.render('user/register', {
		title : 'Rekisteröityminen',
		url: req.originalUrl,
		user: req.user,
		messages: req.flash()
	});
});



/*
 *	/USER/FORGOT	GET
 *
 *	Salasananpyyntösivu
 *	-Käyttäjä voi palauttaa salasanansa tätä kautta.
 *
 */
router.get('/forgot', function(req, res) {
	if (req.session.user != null) {					//Ei näytetä salasanan resetointilinkin tilaussivua, koska käyttäjä on jo kirjautunut
		res.redirect('/galleria');
	}
	else {											//Näytetään salasanan resetointilinkin tilaussivu
		res.render('user/forgot', {
			title : 'Unohdin salasanani',
			url: req.originalUrl,
			user: req.user,
			messages: req.flash()
		});
	}
});



/*
 *	/USER/FORGOT	POST
 *
 *	Salasananpyyntösivu
 *	-Jos käyttäjän syöttämät tilitiedot täsmäävät, luodaan resetointi koodi jolla pääsee resetoimaan salasanansa.
 *	-Linkki resetointisivulle lähetetään käyttäjälle sähköpostitse.
 *	-Resetointi pyyntö on voimassa vain rajatun ajan, kunnes annettu koodi ei enää toimi.
 *
 */
router.post('/forgot', function(req, res) {

	var username = req.body.username;
	
	console.log('User: ' + username + ' forgot their password');

	mongoose.model('User').findOne({																			//Etsitään tietokannasta käyttäjä, joka vastaa syötettyä käyttäjänimeä ja sähköpostia
		username: username,
	},function (err, user) {
		if (err) {																								//Tietoja vastaavaa käyttäjää ei löytynyt
			//console.log(err);
			res.send(err);
		}
		else {																									//Käyttäjä löytyi, joten valmistellaan sähköpostin lähetys ja luodaan linkki resetointisivua varten
			if (user == null) {
				//console.log('User: ' + username + ' does not exist');
				req.flash('error',"Käyttäjää '"+username+"' ei ole olemassa.");
				res.redirect('/galleria/user/forgot');
			}
			else {
				var email = user.email;
				var nodemailer = require('nodemailer');
				var smtpTransport = require('nodemailer-smtp-transport');
				var post_user = require('../public/redact/user');
				var post_pass = require('../public/redact/pass');
				//console.log('Sending email as: ' + post_user + ' --- ' + post_pass);
				var transporter = nodemailer.createTransport(smtpTransport({
					service: 'Gmail',
					auth: {
						user: post_user,
						pass: post_pass
					}
				}));
				//Luodaan avain linkkiä varten, jotta käyttäjä voidaan tunnistaa linkin perusteella
				var randomstring = require('randomstring');
				//Luodaan linkin tunniste
				var token = randomstring.generate(12);
				//console.log('Generating password reset token: ' + token + ' for user: ' + user.username);
				//Luodaan yksilöity token käyttäjälle, joka lähetetään sähköpostitse
				mongoose.model('Token').create({																	//Talletetaan linkin avain tietokantaan
					type: 'password',
					token: token,
					owner: username
				},function (err, token) {
					if (err) {																						//Avaimen talletus tietokantaan epäonnistui
						//console.log(err);
						res.send(err);	
					}
					else {																							//Avaimen tallennus tietokantaan onnistui, joten lähetetään sähköposti käyttäjälle
						var reset_link = 'http://projektit.febju.dy.fi/galleria/user/reset?token='+token.token;
						//console.log('Sending link: ' + reset_link + ' to ' + email);
						transporter.sendMail({
							from: 'Galleria <febju.system@gmail.com>',
							to: email,
							subject: 'Salasanan resetointi',
							text: reset_link + '\n\nLinkki on voimassa 3 tuntia ja on kertakäyttöinen',
						}, function (error, response) {																//Sähköpostin lähetys epäonnistui
							if (error) {
								//console.log(err);
								res.send(err);	
							}
							else {																					//Sähköposti lähetettiin onnistuneesti
								//console.log('Email to ' + email + ' sent succesfully')
								req.flash('success','Salasanan resetointi linkki on lähetetty sähköpostiisi. Käy tarkistamassa sähköpostisi.');
								res.redirect('/galleria');
							}
						});
					}
				});
			}
		}
	});
});



/*
 *	/USER/RESET		GET
 *
 *	Salasananresetointisivu
 *	-Jos avain täsmää käyttäjätilille annettuun resetointiavaimeen, pääsee käyttäjä vaihtamaan itselleen uuden salasanan.
 *
 */
router.get('/reset', function(req, res) {
	if (req.session.user != null) {								//Ei näytetä salasanan resetointi sivua, koska käyttäjä on jo kirjautunut
		res.redirect('/galleria');
	}
	else {														//Jos käyttäjä ei ole kirjautunut etsitään tietokannasta linkkiä vastaavaa tokenia
		var token_id = req.query.token;
		//console.log('Looking for token: ' + token_id);
		mongoose.model('Token').findOne({						//Etsitään tietokannasta salasanatyypin ja tokenin perusteella 
			type: 'password',
			token: token_id
		},function (err, token) {
			if (err) {
				//console.log(err);
				res.send(err);	
			}
			else {
				if (token == null) {											//Tokenia ei ole olemassa
					//Käyttäjä ohjataan tilaamaan uusi linkki
					//console.log('Token: ' + token_id + ' does not exist');
					req.flash('error','Resetointi linkki on vanhentunut.');
					res.redirect('/galleria/user/forgot');
				}
				else {															//Etsitty token löytyi
					console.log('Found token: ' + token_id);
					req.session.token = token;
					//Näytetään resetointi sivu käyttäjälle
					res.render('user/reset', {
						title : 'Salasanan resetointi',
						url: (req.originalUrl).split("?")[0],
						user: req.user,
						messages: req.flash()
					});
				}
			}
		});
	}
});



/*
 *	/USER/RESET		POST
 *
 *	Salasananresetointisivu
 *	-Salasanan syötettyä tallenetaan uusi salasana tietokantaan ja ohjataan käyttäjä kirjautumaan.
 *
 */
router.post('/reset', function(req, res) {
	var token = req.session.token;
	//console.log('Search users for: ' + token.owner);
	mongoose.model('User').findOne({
		username: token.owner
	},function (err, user) {
		if (err) {
			//console.log(err);
			res.send(err);
		}
		else {
			if (user == null) {
				//console.log('Did not find owner of token');
				//message(Avaimen omistaja ei löytynyt) ???
			}
			else {
				//console.log('Found owner of token: ' + user.username);
				var modified_user = user.username;
				var new_password = req.body.password;
				var salt = bcrypt.genSaltSync(16);
				var password = bcrypt.hashSync(new_password,salt);
				mongoose.model('User').update({username: modified_user}, {
					password: password
				}, function(err,user) {
					if (err) {
						//console.log(err);
						res.send(err);
					}
					else {
						//console.log('Password for user: ' + modified_user + ' updated');
						mongoose.model('Token').find({ token: token.token,type: token.type }).remove().exec();
						//console.log('Token: ' + token.token + ' deleted');
						req.session.destroy();
						req.flash('success','Salasana resetoitu onnistuneesti.');
						res.redirect('/galleria/user/login');
					}
				});
			}
		}
	});
});

module.exports = router;