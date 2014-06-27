module.exports = function(grunt) {
	"use strict";

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-blanket');
	grunt.loadNpmTasks('grunt-coveralls');

	grunt.initConfig({
		clean: {
			coverage: {
				src: ['coverage/']
			},
			reports: {
				src: ['reports/']
			}
		},

		copy: {
			coverage: {
				src: ['test/**', 'data/**'],
				dest: 'coverage/'
			}
		},

		blanket: {
			coverage: {
				src: ['src/'],
        		dest: 'coverage/src/'
			}
		},

		mochaTest: {
			'spec': {
				options: {
					reporter: 'spec'
				},
				src: ["coverage/test/**/*Test.js"]
			},
			'html-cov': {
				options: {
					reporter: 'html-cov',
					quiet: true,
					captureFile: 'reports/coverage.html'
				},
				src: ["coverage/test/**/*Test.js"]
			},
			'mocha-lcov-reporter': {
				options: {
					reporter: 'mocha-lcov-reporter',
					quiet: true,
					captureFile: 'reports/lcov.info'
				},
				src: ["coverage/test/**/*Test.js"]
			},
		},

		coveralls: {
			options: {
				// Don't fail a build if coveralls fails
				force: true
			},
				all: {
				src: 'reports/lcov.info'
			}
		},

		jshint: {
			src: [
				// Files to hint
				"src/**/*.js",
				"test/**/*.js"
			],
			options: {
				jshintrc: '.jshintrc'
			}
		},


	});


	grunt.registerTask('default', ['jshint', 'clean', 'blanket', 'copy', 'mochaTest']);
	grunt.registerTask('travis', ['default', 'coveralls']);
};
