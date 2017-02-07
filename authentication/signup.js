var LocalStrategy   = require('passport-local').Strategy;
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){

	passport.use('signup', new LocalStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
			
			var email = req.body.email;
			
            findOrCreateUser = function(){
                // find a user in Mongo with provided email
                User.findOne({ 'email' :  email }, function(err, user) {
                    // In case of any error, return using the done method
                    if (err){
                        console.log('Error in SignUp: '+err);
                        return done(err);
                    }
                    // already exists
                    if (user) {
                        console.log('User already exists with email: '+ email);
                        return done(null, false, req.flash('error','Sähköpostiosoite on jo käytössä.'));
                    } else {
                        User.findOne({ 'username' :  username }, function(err, user) {
							// In case of any error, return using the done method
							if (err){
								console.log('Error in SignUp: '+err);
								return done(err);
							}
							// already exists
							if (user) {
								console.log('Username ' + username + ' is taken.');
								return done(null, false, req.flash('error','Nimimerkki on jo käytössä.'));
							} else {
								// if there is no user with that email
								// create the user
								var newUser = new User();

								// set the user's local credentials
								newUser.username = username;
								newUser.password = createHash(password);
								newUser.email = email;

								// save the user
								newUser.save(function(err) {
									if (err){
										console.log('Error in Saving user: '+err);  
										throw err;  
									}
									console.log('User Registration succesful');    
									return done(null, newUser, req.flash('success','Uusi käyttäjä rekisteröity onnistuneesti.'));
								});
							}
						});
                    }
                });
            };
            // Delay the execution of findOrCreateUser and execute the method
            // in the next tick of the event loop
            process.nextTick(findOrCreateUser);
        })
    );

    // Generates hash using bCrypt
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    }

}