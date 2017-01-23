module.exports = function(mediafiles,req,res,title){

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
			filetype: mediafile.filetype,
			name:mediafile.name	
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

	//EI TOIMI ?
	if (typeof req.query.page !== 'undefined') {
		currentPage = +req.query.page;
	}
	
	filesList = filesArrays[+currentPage - 1];

	res.format({
		html: function(){
			res.render('media/index', {
				title: title,
				user: req.user,
				url: req.originalUrl,
				messages: req.flash(),
				files: filesList,
				pageSize: pageSize,
				totalFiles: totalFiles,
				pageCount: pageCount,
				currentPage: currentPage
			});
		},
	});

}