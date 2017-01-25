var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection("mongodb://localhost/galleria");
autoIncrement.initialize(connection);

var mediaSchema = new mongoose.Schema({
	filename: { type: String, required: true, unique: true },
	file: { type: String, required: true },
	name: { type: String, required: true },
    desc: { type: String, required: false },
	filetype : { type: String, required: true},
	approved : { type: Boolean, required: true},
});

mediaSchema.plugin(autoIncrement.plugin, 'Media');

var Media = mongoose.model('Media', mediaSchema);

module.exports = Media;