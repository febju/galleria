var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var config = require('config');

var connection;

var env = config.util.getEnv('NODE_ENV');

if (env === 'development') {
	connection = mongoose.createConnection('mongodb://localhost/galleria');
}
if (env === 'test') {
	connection = mongoose.createConnection('mongodb://localhost/galleria_test');
}
if (env === 'production') {
	connection = mongoose.createConnection('mongodb://localhost/galleria_production');
}

autoIncrement.initialize(connection);

var userSchema = new mongoose.Schema({  
    username: { type: String, required: true, unique: true },
	email: { type: String, required: true },
    password: { type: String, required: true },
	role: { type: String, default: 'user'}
	
});

userSchema.plugin(autoIncrement.plugin, 'User');

var User = mongoose.model('User', userSchema);

module.exports = User;