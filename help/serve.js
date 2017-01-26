module.exports = function(mediafiles,req,res,title,path){
	var totalFiles = (mediafiles.length),
	pageSize = 20,
	pageCount = Math.ceil(totalFiles/pageSize),
	currentPage = 1,
	files = [],
	filesArrays = [],
	filesList = [];
	//genreate list of students
	mediafiles.forEach(function(mediafile){
		files.push({
			filename:mediafile.filename,
			file:mediafile.file,
			filetype: mediafile.filetype,
			name:mediafile.name,
		});
	});
	//split list into groups
	while (files.length > 0) {
		filesArrays.push(files.splice(0, pageSize));
	}
	//split list into groups
	while (files.length > 0) {
		filesArrays.push(files.splice(0, pageSize));
	}
	//
	if (typeof req.query.page !== 'undefined') {
		currentPage = +req.query.page;
	}
	
	if (currentPage > pageCount && totalFiles > 0) {
		var back = '/galleria/media'+path;
		req.flash('error','Pyytämääsi mediasivua ei ole olemassa.');
		res.redirect(back);
	}

	filesList = filesArrays[+currentPage - 1];
	
	var forms = populate_search_form(req);
	
	res.render('media/index', {
		title: title,
		user: req.user,
		url: req.originalUrl,
		messages: req.flash(),
		files: filesList,
		pageSize: pageSize,
		totalFiles: totalFiles,
		pageCount: pageCount,
		currentPage: currentPage,
		path: path,
		populate_query: forms['query_text'],
		populate_checkbox_image: forms['checkbox_image'],
		populate_checkbox_video: forms['checkbox_video'],
		populate_checkbox_audio: forms['checkbox_audio'],
		populate_checkbox_name: forms['checkbox_name'],
		populate_checkbox_description: forms['checkbox_description'],
		no_query: forms['no_query']
	});
	
	function populate_search_form() {
		
		var populate = [];
		
		var query_text = '';
		
		if (req.body.query == undefined) query_text = '';
		else query_text = req.body.query;
		
		var checkbox_image = false;
		var checkbox_video = false;
		var checkbox_audio = false;
		
		if ( typeof (req.body.filetype) == 'object') {
			if(req.body.filetype.indexOf('image') != -1) checkbox_image = true;
			if(req.body.filetype.indexOf('video') != -1) checkbox_video = true;
			if(req.body.filetype.indexOf('audio') != -1) checkbox_audio = true;
		}
		else if (req.body.filetype == 'image') {
			checkbox_image = true;
		}
		else if (req.body.filetype == 'video') {
			checkbox_video = true;
		}
		else if (req.body.filetype == 'audio') {
			checkbox_audio = true;
		}
		
		var checkbox_name = false;
		var checkbox_description = false;
		
		if ( typeof (req.body.attribute) == 'object') {
			checkbox_name = true;
			checkbox_description = true;
		}
		else if (req.body.attribute == 'name') {
			checkbox_name = true;
		}
		else if (req.body.attribute == 'description') {
			checkbox_description = true;
		}
		
		var no_query = false;

		if (typeof (req.body.filetype) == 'undefined') no_query = true;
		
		populate['query_text'] = query_text;
		populate['checkbox_image'] = checkbox_image;
		populate['checkbox_video'] = checkbox_video;
		populate['checkbox_audio'] = checkbox_audio;
		populate['checkbox_name'] = checkbox_name;
		populate['checkbox_description'] = checkbox_description;
		populate['no_query'] = no_query;
		//console.log(populate);
		return populate
	}
}