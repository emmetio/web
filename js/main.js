import CodeMirror from 'codemirror';
import CodeMirrorMovie from 'codemirror-movie';
import EmmetCodemirror from 'emmet-codemirror';

import 'codemirror/mode/xml/xml.js';

function $(sel, context=document) {
	return toArray(context.querySelectorAll(sel));
}

function toArray(obj, ix=0) {
	return Array.prototype.slice.call(obj, ix);
}

function toDom(html) {
	var div = document.createElement('div');
	div.innerHTML = html;

	var df = document.createDocumentFragment();
	while (div.firstChild) {
		df.appendChild(div.firstChild);
	}

	return df.childNodes.length > 1 ? df : df.removeChild(df.firstChild);
}

// A super-hacky way to to change the way how Disqus
// outputs comments count labels
function handleDiqusLabelUpdate() {
	this.removeEventListener('DOMSubtreeModified', handleDiqusLabelUpdate);
	this.innerHTML = this.innerHTML
		.replace(/\s+and\s+.+$/, '')
		.toLowerCase();
}

window.CodeMirror = CodeMirror;
EmmetCodemirror.setup(CodeMirror);
CodeMirror.commands.revert = function(editor) {
	if (editor.__initial) {
		editor.setValue(editor.__initial.content);
		editor.setCursor(editor.__initial.pos);
	}
};

$('a').forEach(link => {
	if (link.href.indexOf('#disqus_thread')) {
		link.addEventListener('DOMSubtreeModified', handleDiqusLabelUpdate);
	}
});

$('.movie-def').forEach(elem => {
	var movie = CodeMirrorMovie(elem, {}, {
		theme: 'espresso',
		indentWithTabs: true,
		tabSize: 4,
		indentUnit: 4,
		lineNumbers: false,
		height: 315
	});

	var cl = 'CodeMirror-movie__splash_playing';
	// create UI controls for movie
	
	// add splash screen
	var splash = toDom(`<div class="CodeMirror-movie__splash">
		<div class="CodeMirror-movie__splash-text">
			<span class="CodeMirror-movie__splash-play-btn">▶</span> Watch demo</div>
		</div>`);

	splash.addEventListener('click', evt => {
		if (splash.classList.contains(cl)) {
			movie.pause();
		} else {
			movie.play();
		}
	});

	movie._editor.getWrapperElement().appendChild(splash);
	movie
	.on('stop pause', function() {
		splash.classList.remove(cl);
	})
	.on('play resume', function() {
		splash.classList.add(cl);
	});
});