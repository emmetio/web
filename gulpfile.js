var path = require('path');
var gulp = require('gulp');
var jsBundler = require('js-bundler');
var minifyCSS = require('gulp-minify-css');
var gzip = require('gulp-gzip');
var htmlTransform = require('html-transform');
var through = require('through2');

var srcOptions = {base: './'};
var outPath = './out';
var production = process.argv.indexOf('--production') !== -1;

function np(file) {
	return path.resolve(path.join('node_modules', file));
}

gulp.task('js', function() {
	return gulp.src('./js/*.js', srcOptions)
		.pipe(jsBundler({
			uglify: production,
			sourceMap: !production,
			noParse: [
				np('codemirror-movie/dist/movie.js'),
				np('emmet-codemirror/dist/emmet.js'),
				np('codemirror/lib/codemirror.js')
			]
		}))
		.pipe(gulp.dest(outPath));
});

gulp.task('css', function() {
	return gulp.src('./css/*.css', srcOptions)
		.pipe(minifyCSS({processImport: true}))
		.pipe(gulp.dest(outPath));
});

gulp.task('files', function() {
	return gulp.src('./css/entypo/**', srcOptions)
		.pipe(gulp.dest(outPath));
});

gulp.task('html', ['static'], function() {
	return gulp.src('./out/**/*.html')
		.pipe(htmlTransform.stream({
			transformUrl: function(url, file, ctx) {
				if (ctx.stats) {
					url = '/-/' + ctx.stats.hash + url;
				}
				return url;
			},
			mode: 'xhtml',
			transform: function() {
				return through.obj(function(file, enc, next) {
					findScripNodes(file.dom).forEach(function(node) {
						// replace &amp; with & since CarbonAds can’t handle entities
						node.attribs.src = node.attribs.src.replace(/&amp;/g, '&');
					});
					next(null, file);
				});
			}
		}))
		.pipe(gulp.dest('./out'));
});

gulp.task('full', ['html'], function() {
	return gulp.src('./out/**/*.{html,css,js,ico,xml}')
		.pipe(gzip({
			threshold: '1kb',
			gzipOptions: {level: 7}
		}))
		.pipe(gulp.dest(outPath));
});

gulp.task('watch', function() {
	gulp.watch('./css/**/*.css', ['css']);
	gulp.watch('./js/**/*.js', ['js']);
});

gulp.task('static', ['css', 'js', 'files']);
gulp.task('default', ['static']);

function findScripNodes(nodes, out) {
	out = out || [];
	nodes.forEach(function(node) {
		if (/^script$/i.test(node.name || '') && node.attribs.src) {
			out.push(node);
		}

		if (node.children) {
			findScripNodes(node.children, out);
		}
	});

	return out;
}