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
                //Tarkistetaan onko s�hk�postiosoite jo k�yt�ss�
                User.findOne({ 'email' :  email }, function(err, user) {
                    if (err){
                        //console.log('Error in SignUp: '+err);
                        return done(err);
                    }
                    //S�hk�postiosoite on jo k�yt�ss�
                    if (user) {
                        //console.log('User already exists with email: '+ email);
                        return done(null, false, req.flash('error','S�hk�postiosoite on jo k�yt�ss�.'));
                    }
					//S�hk�postiosoite ei ole k�yt�ss�
					else {
						//Tarkistetaan onko k�ytt�j�nimi jo k�yt�ss�
                        User.findOne({ 'username' :  username }, function(err, user) {
							if (err){
								//console.log('Error in SignUp: '+err);
								return done(err);
							}
							//K�ytt�j�nimi on jo k�yt�ss�
							if (user) {
								//console.log('Username ' + username + ' is taken.');
								return done(null, false, req.flash('error','K�ytt�j�nimi on jo k�yt�ss�.'));
							}
							//K�ytt�j�nimi ei ole k�yt�ss�
							else {
								//Luodaan uusi k�ytt�j�
								var newUser = new User();
								//Asetetaan k�ytt�j�n tiedot
								newUser.username = username;
								newUser.password = createHash(password);
								newUser.email = email;
								//Tallennetaan uusi k�ytt�j�
								newUser.save(function(err) {
									if (err){
										//console.log('Error in Saving user: '+err);  
										throw err;  
									}
									//console.log('User Registration succesful');    
									return done(null, newUser, req.flash('success','Uusi k�ytt�j� rekister�ity onnistuneesti.'));
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