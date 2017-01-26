var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection("mongodb://localhost/galleria");
autoIncrement.initialize(connection);

var userSchema = new mongoose.Schema({  
    username: { type: String, required: true, unique: true },
	email: { type: String, required: true },
    password: { type: String, required: true }
	
});

userSchema.plugin(autoIncrement.plugin, 'User');

var User = mongoose.model('User', userSchema);

module.exports = User;