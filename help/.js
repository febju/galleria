var Key = {
	LEFT:   37,
	UP:     38,
	RIGHT:  39,
	DOWN:   40
};

/* IE: attachEvent, Firefox & Chrome: addEventListener */
function _addEventListener(evt, element, fn) {
	if (window.addEventListener) {element.addEventListener(evt, fn, false);}
	else {element.attachEvent('on'+evt, fn);}
}

function onInputKeydown(evt) {
	if (!evt) {evt = window.event;} // for IE compatible
	var keycode = evt.keyCode || evt.which; // also for cross-browser compatible
	if (keycode == Key.LEFT) {console.log("LEFT");}
	else if (keycode == Key.UP) {console.log("UP");}
	else if (keycode == Key.RIGHT) {console.log("RIGHT");}
	else if (keycode == Key.DOWN) {console.log("DOWN");}
	else {console.log("SOME KEY");}
}

function addevt() {
	_addEventListener('keydown', document, onInputKeydown);
}