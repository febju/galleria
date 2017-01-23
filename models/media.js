var mongoose = require('mongoose');

var mediaSchema = new mongoose.Schema({
	filename: { type: String, required: true, unique: true },
	file: { type: String, required: true },
	name: { type: String, required: true },
    desc: { type: String, required: false },
	filetype : { type: String, required: true},
	approved : { type: Boolean, required: true},
});

var Media = mongoose.model('Media', mediaSchema);

module.exports = Media;