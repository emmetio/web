(function() {
	// detect SVG support
	var svgNS = 'http://www.w3.org/2000/svg';
	var hasSVG = !!document.createElementNS && !!document.createElementNS(svgNS, 'svg').createSVGRect;
	$(document.documentElement).addClass(hasSVG ? 'svg' : 'no-svg');
})();

// A super-hacky way to to change the way how Disqus
// outputs comments count labels
$(function() {
	function callback(evt) {
		this.removeEventListener(callback);
		this.innerHTML = this.innerHTML
			.replace(/\s+and\s+.+$/, '')
			.toLowerCase();
	}

	if (document.addEventListener) {
		$('a').each(function(i, el) {
			if (~el.href.indexOf('#disqus_thread')) {
				el.addEventListener('DOMSubtreeModified', callback);
			}
		});
	}
});