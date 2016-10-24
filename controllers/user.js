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

router.get('/register', function(req, res) {
	if (req.session.user != null) {
		res.redirect('/galleria');
	}
	else {
		res.render('user/register', {
			title: 'Rekisteröityminen',
			url: req.originalUrl
		});
	}
});

router.post('/register', function(req, res) {

	var username = req.body.username;
	var userpassword = req.body.password;
	var email = req.body.email;

	//var getSalt = require('../public/helpers/getSalt');
	//var salt = getSalt(16);
	//var sha512 = require('../public/helpers/sha512');
	//var password = sha512(salt,userpassword);
	var salt = bcrypt.genSaltSync(16);
	var password = bcrypt.hashSync(userpassword,salt);
	console.log(password);
    mongoose.model('User').create({
		username: username,
		email: email,
		password: password,
		//salt: salt
	},function (err, user) {
		if (err) {
			res.send("There was a problem adding the information to the database.");
		}
	})
	req.session.user = username;
	res.render('index', {
		title : 'Tervetuloa galleriaan',
		user: req.session.user,
		url: req.originalUrl
	});
});

router.get('/login', function(req, res) {
	if (req.session.user != null) {
		res.redirect('/galleria');
	}
	else {
		res.render('user/login', {
			title : 'Sisäänkirjautuminen',
			//user: req.session.user,
			url: req.originalUrl
		});
	}
});

router.post('/login', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	console.log("Search for: "+username);
	mongoose.model('User').findOne({
		username: username
	},function (err, user) {
		if (err) {
			
		}
		else {
			var hash = user.password;
			//console.log(password+' ---- '+hash);
			var login = bcrypt.compareSync(password, hash);
			console.log(login);
			if (login == true) {
				req.session.user = username;
				res.redirect(req.get('referer'));
			}
			else {
				res.redirect('/galleria/user/login');
			}
		}
	});
});

router.get('/forgot', function(req, res) {
	if (req.session.user != null) {
		res.redirect('/galleria');
	}
	else {
		res.render('user/forgot', {
			title : 'Unohdin salasanani',
			//user: req.session.user,
			url: req.originalUrl
		});
	}
});

router.post('/forgot', function(req, res) {

	var username = req.body.username;
	var useremail = req.body.email;

	mongoose.model('User').findOne({
		username: username,
		email: useremail
	},function (err, user) {
		if (err) {
			
		}
		else {
			var email = user.email;
			var nodemailer = require('nodemailer');
			var smtpTransport = require('nodemailer-smtp-transport');
			
			var post_user = require('../public/redact/user');
			var post_pass = require('../public/redact/pass');
			console.log(post_user + ' --- ' + post_pass);

			var transporter = nodemailer.createTransport(smtpTransport({
				service: 'Gmail',
				auth: {
					user: post_user,
					pass: post_pass
				}
			}));
			var randomstring = require('randomstring');
			var token = randomstring.generate(12);
			mongoose.model('Token').create({
				type: 'password',
				token: token,
				owner: username,
				created: Date()
			},function (err, user) {
				if (err) {
					
				}
				else {
					var reset_link = 'http://projektit.febju.dy.fi/galleria/user/reset?token='+token;
					transporter.sendMail({
						from: 'Galleria <febju.system@gmail.com>',
						to: email,
						subject: 'Salasanan resetointi',
						text: reset_link,
					}, function (error, response) {
						if (error) {
							console.log(error);
							res.end("Email send failed");
						}
						//email send sucessfully
						else {
							console.log(response);
							//message
							res.redirect('/galleria');
						}
					});
				}
			});
		}
	});
});

router.get('/reset', function(req, res) {
	if (req.session.user != null) {
		res.redirect('/galleria');
	}
	else {
		var token_id = req.query.token;
		console.log(token_id);
		mongoose.model('Token').findOne({
			type: 'password',
			token: token_id
		},function (err, token) {
			if (err) {
				
			}
			else {
				//console.log(token);
				var created = (token.created).getTime();
				var now = new Date();
				now = now.getTime();
				if ((now-created) <= (1000*60*60*3)) {
					console.log('Token ' + token.token +' approved');
					req.session.token = token.token;
					res.render('user/reset', {
						title : 'Salasanan resetointi',
						url: req.originalUrl,
					});
				}
				else {
					console.log('Token expired');
					//message about expired token
					//redirect somewhere
				}
			}
		});
	}
});

router.post('/reset', function(req, res) {
	var token_id = req.session.token;
	console.log('Search for: '+token_id);
	mongoose.model('Token').findOne({
			type: 'password',
			token: token_id
	},function (err, token) {
		if (err) {
			console.log('Did not find token');
		}
		else {
			console.log('Found token');
			mongoose.model('User').findOne({
				username: token.owner
			},function (err, user) {
				if (err) {
					console.log('Did not find user for token');
				}
				else {
					console.log('Found owner of token: '+ user.username);
					var modified_user = user.username;
					var new_password = req.body.password;
					var salt = bcrypt.genSaltSync(16);
					var password = bcrypt.hashSync(new_password,salt);
					mongoose.model('User').update({username: modified_user}, {
						password: password
					}, function(err,user) {
						if (err) {
							console.log('Update failed');
						}
						else {
							console.log('Password updated');
							req.session.destroy();
							res.redirect('/galleria/user/login');
						}
					});
				}
			});
		}
	});
});

module.exports = router;