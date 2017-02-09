module.exports = function(filetype,mediafiles,req){
	var filtered = [];
	//Käydään läpi kaikki tiedostot
	mediafiles.forEach(function(mediafile){
		/*Tarkistetaan löytyykö tiedoston mediatyyppi haettujen mediatyyppien listalta
		  Oletuksena on että useampi kaikki tyypit sallitaan, joten haetaan taulusta(indexOf)
		  Jos vain yksi mediatyyppi sallitaan on toinen ehto tarpeen (string ei taulu)
		  filetype on siis sallitut mediatyypit (taulu tai string, riippuen määrästä)
		  mediafile.filetype käsiteltävän tiedoston mediatyyppien
		*/
		if ((filetype.indexOf(mediafile.filetype) != -1) || filetype == mediafile.filetype) {
			//Jos mediatyypit täsmäävät talletetaan tiedosto näytettävien tiedostojen listaan
			filtered.push({
				filename:mediafile.filename,
				filetype: mediafile.filetype,
				name:mediafile.name	
			});
		}
	});
	//Palautetaan näytettävät tiedostot
	return filtered

}