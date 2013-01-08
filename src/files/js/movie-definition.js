$(function() {
	$('.movie-def').each(function(i) {
		var scenario = CodeMirror.movie(this, null, {
			lineNumbers: false,
			height: 315
		});
		
		var cl = 'CodeMirror-movie__splash_playing';

		// create UI controls for movie
		
		// add splash screen
		var splash = $('<div class="CodeMirror-movie__splash">' + 
			'<div class="CodeMirror-movie__splash-text"><span class="CodeMirror-movie__splash-play-btn">▶</span> Watch demo</div>'  + 
			'</div>')
			.click(function() {
				if (splash.hasClass(cl)) {
					scenario.pause();
				} else {
					scenario.play();
				}
			})
			.appendTo(scenario._editor.getWrapperElement());
		
		scenario
			.on('stop pause', function() {
				splash.removeClass(cl);
			})
			.on('play resume', function() {
				splash.addClass(cl);
			});
	});
});
