var mongoose = require('mongoose');

var tokenSchema = new mongoose.Schema({  
	type: String,
    token: String,
	owner: String,
	created: Date
});

var Token = mongoose.model('Token', tokenSchema);

module.exports = Token;