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
				filename:mediafile.filename,		//tiedoston tallennusnimi tiedostopäätteellä
				file:mediafile.file,				//tiedoston tallennusnimi, ilman tiedostopäätettä
				filetype: mediafile.filetype,		//tiedoston mediatyyppi
				name:mediafile.name,				//tiedoston nimi, jolla se on tallennettu
			});
		}
	});
	//Palautetaan näytettävät tiedostot
	return filtered

}