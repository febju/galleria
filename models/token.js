var mongoose = require('mongoose');

var tokenSchema = new mongoose.Schema({  
	type: { type: String, required: true },
    token: { type: String, required: true },
	owner: { type: String, required: true },
	createdAt: { type: Date, expires: 3600, default: Date.now }
});

var Token = mongoose.model('Token', tokenSchema);

module.exports = Token;