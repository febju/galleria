module.exports = function(mediafiles,req,res,title,path){
	var totalFiles = (mediafiles.length),			//Tiedostojen määrä
	pageSize = 20,									//Tiedostoja per sivu (4 per rivi)
	pageCount = Math.ceil(totalFiles/pageSize),		//Sivujen määrä
	currentPage = 1,								//Pyydetty sivu (oletuksena ensimmäinen)
	files = [],										//Tiedostot
	filesArrays = [],								//Tiedostot ryhmiteltynä
	filesList = [];									//Näytettävät tiedostot
	//Listataan kaikki tiedostot
	mediafiles.forEach(function(mediafile){
		//Asetetaan tiedostojen tiedot
		files.push({
			filename:mediafile.filename,		//tiedoston tallennusnimi tiedostopäätteellä
			file:mediafile.file,				//tiedoston tallennusnimi, ilman tiedostopäätettä
			filetype: mediafile.filetype,		//tiedoston mediatyyppi
			name:mediafile.name,				//tiedoston nimi, jolla se on tallennettu
		});
	});
	//Jaetaan lista ryhmiin
	while (files.length > 0) {
		filesArrays.push(files.splice(0, pageSize));
	}
	//Tarkistetaan haetaanko tiettyä sivua
	if (typeof req.query.page !== 'undefined') {
		currentPage = +req.query.page;
	}
	//Tarkistetaan onko haettua sivua olemassa
	if ( (currentPage > pageCount && totalFiles > 0) || (pageCount == 0 && currentPage > 1) ) {
		//Jos sivua ei ole olemassa ohjataan käyttäjä takaisin sivulle, miltä tuli
		var back = '../media'+path;
		req.flash('error','Pyytämääsi mediasivua ei ole olemassa.');
		res.redirect(back);
		return
	}

	//Valitaan se sivu jota on pyydetty
	filesList = filesArrays[+currentPage - 1];
	
	//Populoidaan lomakkeet hakutoimintoa varten
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
		populate_query: forms['query_text'],								//hakutekstin arvo
		populate_checkbox_image: forms['checkbox_image'],					//mediatyyppi: kuvat checkboxin arvo
		populate_checkbox_video: forms['checkbox_video'],					//mediatyyppi: videot checkboxin arvo
		populate_checkbox_audio: forms['checkbox_audio'],					//mediatyyppi: äänet checkboxin arvo
		populate_checkbox_name: forms['checkbox_name'],						//hakukohde: nimi checkboxin arvo
		populate_checkbox_description: forms['checkbox_description'],		//hakukohde: kuvaus checkboxin arvo
		no_query: forms['no_query']											//muuttuja kertoo onko haku jo tehty (eli ovatko tiedot saatavilla) vai onko kyseessä sivun ensimmäinen lataus
	});
	
	function populate_search_form() {
		
		var populate = [];
		var query_text = '';	//hakuteksti
		//Tarkistetaan onko hakutekstiä asetettu
		if (req.body.query == undefined) query_text = '';	//Jos tekstiä ei ole asetettu jätetään kenttä tyhjäksi
		else query_text = req.body.query;					//Muutoin annetaan hakutekstille aiemmin syötetty arvo
		//Mediatyyppien valintalaatikoiden status (kuva,video,ääni)
		var checkbox_image = false;
		var checkbox_video = false;
		var checkbox_audio = false;
		//Tarkistetaan onko useampi mediatyyppi hyväksytty vaiko ainoastaan yksittäinen (Jos useampi kuin yksi valittu on req.body.filetype tyypiltään object, muutoin string)
		if ( typeof (req.body.filetype) == 'object') {
			//Jos useampi vaihtoehto valittu, niin merkataan valitut katsomalla sisältääkö hyväksyttyjen mediatyyppien taulukko kyseisen mediatyypin
			if(req.body.filetype.indexOf('image') != -1) checkbox_image = true;
			if(req.body.filetype.indexOf('video') != -1) checkbox_video = true;
			if(req.body.filetype.indexOf('audio') != -1) checkbox_audio = true;
		}
		//Jos vain kuvat valittu
		else if (req.body.filetype == 'image') {
			checkbox_image = true;
		}
		//Jos vain videot valittu
		else if (req.body.filetype == 'video') {
			checkbox_video = true;
		}
		//Jos vain äänet valittu
		else if (req.body.filetype == 'audio') {
			checkbox_audio = true;
		}
		//Hakukohteiden valintalaatikoiden status (nimi,kuvaus)
		var checkbox_name = false;
		var checkbox_description = false;
		//Tarkistetaan onko molemmat vai vain toinen vaihtoehto valittu. Toimii samalla periaatteella kuin mediatyypin tunnistus.
		if ( typeof (req.body.attribute) == 'object') {
			checkbox_name = true;
			checkbox_description = true;
		}
		//Jos vain nimi valittu
		else if (req.body.attribute == 'name') {
			checkbox_name = true;
		}
		//Jos vain kuvaus valittu
		else if (req.body.attribute == 'description') {
			checkbox_description = true;
		}
		//Oletuksena hakua ei ole tehty
		var no_query = false;
		//Jos mitään laatikoista ei ole valittuna, tiedetään että sivu on vasta ladattu ja voidaan asettaa haku tekemättömäksi
		//Jos hakua ei ole tehty valitaan kaikki checkboxit oletuksena
		if (typeof (req.body.filetype) == 'undefined') no_query = true;
		//Asetetaan hakulomakkeen tiedot niistä vastaavaan taulukkoon
		populate['query_text'] = query_text;
		populate['checkbox_image'] = checkbox_image;
		populate['checkbox_video'] = checkbox_video;
		populate['checkbox_audio'] = checkbox_audio;
		populate['checkbox_name'] = checkbox_name;
		populate['checkbox_description'] = checkbox_description;
		populate['no_query'] = no_query;
		//console.log(populate);
		//Palautetaan hakulomakkeen tila
		return populate
	}
}