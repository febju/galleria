var LocalStrategy   = require('passport-local').Strategy;
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){

	passport.use('login', new LocalStrategy({
			passReqToCallback : true
		},
        function(req, username, password, done) { 
            //Tarkistetaan onko k‰ytt‰j‰‰ olemassa
            User.findOne({ 'username' :  username }, 
                function(err, user) {
                    if (err)
                        return done(err);
                    //K‰ytt‰j‰‰ ei ole olemassa
                    if (!user){
                        //console.log('User Not Found with username '+username);
                        return done(null, false, req.flash('error', 'K‰ytt‰j‰tili‰ ei ole olemassa.'));                 
                    }
                    //K‰ytt‰j‰ lˆytyi, mutta salasana on v‰‰r‰
                    if (!isValidPassword(user, password)){
                        //console.log('Invalid Password');
                        return done(null, false, req.flash('error', 'V‰‰r‰ salasana.'));
                    }
                    // K‰ytt‰j‰ lˆytyi ja salasana t‰sm‰‰
                    return done(null, user, req.flash('success', 'Sis‰‰nkirjautuminen onnistui.'));
                }
            );
        }
    ));

	//Verrataan annettua salasanaa talletettuun hashiin
    var isValidPassword = function(user, password){
        return bCrypt.compareSync(password, user.password);
    }
    
}