var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

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

/*
 *	/USER/REGISTER	GET
 *	
 *
 *
 *
 */
router.get('/register', function(req, res) {
	if (req.session.user != null) {				//Ei näytetä rekisteröintiä, koska käyttäjä on jo kirjautunut
		res.redirect('/galleria');
	}
	else {
		res.render('user/register', {			//Näytetään rekisteröitymissivu
			title: 'Rekisteröityminen',
			url: req.originalUrl,
			messages: req.flash()
		});
	}
});



/*
 *	/USER/REGISTER	POST
 *
 *
 *
 *
 */
router.post('/register', function(req, res) {

	var username = req.body.username;
	var userpassword = req.body.password;
	var email = req.body.email;

	var salt = bcrypt.genSaltSync(16);
	var password = bcrypt.hashSync(userpassword,salt);
	console.log('Creating new user: ' + username + ' with password: ' + password);
    mongoose.model('User').create({						//Lisätään käyttäjä tietokantaan
		username: username,
		email: email,
		password: password,
	},function (err, user) {
		if (err) {										//Käyttäjän lisäyksessä tietokantaan tapahtui virhe
			//console.log(err);
			if (err.code == 11000) {
				//message(duplikaatti käyttäjä)
			}
			else {
				res.send(err);
			}	
		}
		else {											//Käyttäjä lisättiin tietokantaan onnistuneesti
			req.session.user = username;
			console.log('User ' + username + ' created succesfully');
			req.flash('success','Uusi käyttäjä luotu onnistuneesti');
			res.render('index', {
				title : 'Tervetuloa galleriaan',
				user: req.session.user,
				url: req.originalUrl,
				messages: req.flash()
			});
		}
	})
});



/*
 *	/USER/LOGIN		GET
 *
 *
 *
 *
 */
router.get('/login', function(req, res) {
	if (req.session.user != null) {				//Ei näytetä kirjautumissivua, koska käyttäjä on jo kirjautunut
		res.redirect('/galleria');
	}
	else {										//Näytetään kirjautumissivu käyttäjälle
		res.render('user/login', {
			title : 'Sisäänkirjautuminen',
			url: req.originalUrl,
			messages: req.flash()
		});
	}
});



/*
 *	/USER/LOGIN		POST
 *
 *
 *
 *
 */
router.post('/login', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	console.log("Login for: "+username);
	mongoose.model('User').findOne({
		username: username
	},function (err, user) {
		if (err) {													//Käyttäjää ei löytynyt tietokannasta
			//console.log(err);
			res.send(err);
		}
		else {														//Käyttäjä löytyi tietokannasta, joten verrataan syötettyä salasanaa tallennettuun salasanaan
			if(user == null) {
				console.log('User: ' + username + ' does not exist');
				req.flash('error','Sisäänkirjatuminen epäonnistui. Tarkista tunnuksesi.');
				res.redirect('/galleria/user/login');
			}
			else {
				var hash = user.password;
				console.log('User ' + username + ' found. Comparing password to hash.');
				var login = bcrypt.compareSync(password, hash);
				if (login == true) {									//Salasanat vastasivat toisiaan
					console.log('User: ' + username + ' logged in succesfully');
					req.session.user = username;
					req.flash('success','Sisäänkirjautuminen onnistui');
					res.redirect(req.get('referer'));
				}
				else {													//Salasanat eivät vastanneet toisiaan
					console.log('Wrong password for: ' + username);
					req.flash('error','Sisäänkirjatuminen epäonnistui. Tarkista tunnuksesi.');
					res.redirect('/galleria/user/login');
				}
			}
		}
	});
});



/*
 *	/USER/FORGOT	GET
 *
 *
 *
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
			messages: req.flash()
		});
	}
});



/*
 *	/USER/FORGOT	POST
 *
 *
 *
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
				console.log('User: ' + username + ' does not exist');
				req.flash('error',"Käyttäjää '"+username+"' ei ole olemassa.");
				res.redirect('/galleria/user/forgot');
			}
			else {
				var email = user.email;
				var nodemailer = require('nodemailer');
				var smtpTransport = require('nodemailer-smtp-transport');
				
				var post_user = require('../public/redact/user');
				var post_pass = require('../public/redact/pass');
				console.log('Sending email as: ' + post_user + ' --- ' + post_pass);

				var transporter = nodemailer.createTransport(smtpTransport({
					service: 'Gmail',
					auth: {
						user: post_user,
						pass: post_pass
					}
				}));
				var randomstring = require('randomstring');															//Luodaan avain linkkiä varten, jotta käyttäjä voidaan tunnistaa linkin perusteella
				var token = randomstring.generate(12);
				console.log('Generating password reset token: ' + token + ' for user: ' + user.username);
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
						console.log('Sending link: ' + reset_link + ' to ' + email);
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
								console.log('Email to ' + email + ' sent succesfully')
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
 *
 *
 *
 */
router.get('/reset', function(req, res) {
	if (req.session.user != null) {								//Ei näytetä salasanan resetointi sivua, koska käyttäjä on jo kirjautunut
		res.redirect('/galleria');
	}
	else {														//Jos käyttäjä ei ole kirjautunut etsitään tietokannasta linkkiä vastaavaa avainta
		var token_id = req.query.token;
		console.log('Looking for token: ' + token_id);
		mongoose.model('Token').findOne({						//Etsitään tietokannasta salasanatyypin ja linkin perusteella 
			type: 'password',
			token: token_id
		},function (err, token) {								//Avainta ei löytynyt tietokannasta
			if (err) {
				//console.log(err);
				res.send(err);	
			}
			else {												//Avain löytyi
				if (token == null) {
					console.log('Token: ' + token_id + ' does not exist');
					req.flash('error','Resetointi linkki on vanhentunut.');
					res.redirect('/galleria/user/forgot');		//Ohjataan käyttäjä uuden linkin tilaussivulle
				}
				else {
					console.log('Found token: ' + token_id);
					req.session.token = token;			
					res.render('user/reset', {					//Näytetään resetointi sivu
						title : 'Salasanan resetointi',
						url: (req.originalUrl).split("?")[0],
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
 *
 *
 *
 */
router.post('/reset', function(req, res) {
	var token = req.session.token;
	console.log('Search users for: ' + token.owner);
	mongoose.model('User').findOne({
		username: token.owner
	},function (err, user) {
		if (err) {
			//console.log(err);
			res.send(err);
		}
		else {
			if (user == null) {
				console.log('Did not find owner of token');
				//message(Avaimen omistaja ei löytynyt) ???
			}
			else {
				console.log('Found owner of token: ' + user.username);
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
						console.log('Password for user: ' + modified_user + ' updated');
						mongoose.model('Token').find({ token: token.token,type: token.type }).remove().exec();
						console.log('Token: ' + token.token + ' deleted');
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