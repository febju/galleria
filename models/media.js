var mongoose = require('mongoose');

var mediaSchema = new mongoose.Schema({
	file: { type: String, required: true, unique: true },
	name: { type: String, required: true },
    desc: { type: String, required: false },
	filetype : { type: String, required: true}
});

var Media = mongoose.model('Media', mediaSchema);

module.exports = Media;