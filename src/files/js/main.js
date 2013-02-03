// A super-hacky way to to change the way how Disqus
// outputs comments count labels
$(function() {
	function callback(evt) {
		this.removeEventListener(callback);
		this.innerHTML = this.innerHTML
			.replace(/\s+and\s+.+$/, '')
			.toLowerCase();
	}

	$('a').each(function(i, el) {
		if (~el.href.indexOf('#disqus_thread')) {
			el.addEventListener('DOMSubtreeModified', callback);
		}
	});
});