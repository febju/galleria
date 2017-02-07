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

var mediaSchema = new mongoose.Schema({
	filename: { type: String, required: true, unique: true },
	file: { type: String, required: true },
	name: { type: String, required: true },
    desc: { type: String, required: false },
	filetype: { type: String, required: true},
	approved: { type: Boolean, required: true},
});

mediaSchema.plugin(autoIncrement.plugin, 'Media');

var Media = mongoose.model('Media', mediaSchema);

module.exports = Media;