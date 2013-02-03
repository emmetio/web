module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		frontendConfig: {
			srcWebroot: './src/files',
			webroot: './out'
		},

		copy: {
			'./out/j/': [
				'./src/files/js/jquery-*.js', 
				'./src/files/js/zepto.min.js'
			],
			'./out/c/entypo/': [
				'./src/files/css/entypo/*.*'
			]
		},

		frontend: {
			main: {
				css: {
					src: './src/files/css',
					dest: './out/c'
				},
				js: {
					'./out/j/main.js': [
						'./src/files/js/main.js',
						'./src/files/js/movie-definition.js'
					]
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-frontend');


	// Default task.
	grunt.registerTask('default', 'copy frontend');
};