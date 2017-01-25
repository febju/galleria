module.exports = function(filetype,mediafiles,req){
	var filtered = [];
	mediafiles.forEach(function(mediafile){
		if ((filetype.indexOf(mediafile.filetype) != -1) || filetype == mediafile.filetype) {
			filtered.push({
				filename:mediafile.filename,
				filetype: mediafile.filetype,
				name:mediafile.name	
			});
		}
	});
	return filtered

}