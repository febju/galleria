var LocalStrategy   = require('passport-local').Strategy;
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){

	passport.use('signup', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) {
			var email = req.body.email;
            findOrCreateUser = function(){
                //Tarkistetaan onko sähköpostiosoite jo käytössä
                User.findOne({ 'email' :  email }, function(err, user) {
                    if (err){
                        //console.log('Error in SignUp: '+err);
                        return done(err);
                    }
                    //Sähköpostiosoite on jo käytössä
                    if (user) {
                        //console.log('User already exists with email: '+ email);
                        return done(null, false, req.flash('error','Sähköpostiosoite on jo käytössä.'));
                    }
					//Sähköpostiosoite ei ole käytössä
					else {
						//Tarkistetaan onko käyttäjänimi jo käytössä
                        User.findOne({ 'username' :  username }, function(err, user) {
							if (err){
								//console.log('Error in SignUp: '+err);
								return done(err);
							}
							//Käyttäjänimi on jo käytössä
							if (user) {
								//console.log('Username ' + username + ' is taken.');
								return done(null, false, req.flash('error','Käyttäjänimi on jo käytössä.'));
							}
							//Käyttäjänimi ei ole käytössä
							else {
								//Luodaan uusi käyttäjä
								var newUser = new User();
								//Asetetaan käyttäjän tiedot
								newUser.username = username;
								newUser.password = createHash(password);
								newUser.email = email;
								//Tallennetaan uusi käyttäjä
								newUser.save(function(err) {
									if (err){
										//console.log('Error in Saving user: '+err);  
										throw err;  
									}
									//console.log('User Registration succesful');    
									return done(null, newUser, req.flash('success','Uusi käyttäjä rekisteröity onnistuneesti.'));
								});
							}
						});
                    }
                });
            };
            process.nextTick(findOrCreateUser);
        })
    );

    //Luodaan hash
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    }

}