module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		copy: {
			main: {
				files: [
					{
						expand: true,
						flatten: true,
						src: ['./src/files/js/jquery-*.js', './src/files/js/zepto.min.js'], 
						dest: './out/j/'
					},
					{
						expand: true,
						flatten: true,
						src: ['./src/files/css/entypo/*.*'],
						dest: './out/c/entypo/'
					}
				]
			}
		},

		frontend: {
			main: {
				options: {
					srcWebroot: './src/files',
					webroot: './out'
				},
				css: {
					src: './src/files/css',
					dest: './out/c'
				},
				js: {
					files: {
						'./out/j/main.js': [
							'./src/files/js/main.js',
							'./src/files/js/movie-definition.js'
						]
					}
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-frontend');


	// Default task.
	grunt.registerTask('default', ['copy', 'frontend']);
};