module.exports = function(grunt) {
  "use strict";

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      src: [
        // Files to hint
        "main.js", 
        "loader.js", 
        "Gruntfile.js", 
        "test/**/*.js", 
        "lib/**/*.js", 
        "modules/**/*.js"
      ],
      options: {
        jshintrc: '.jshintrc'
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('default', ['test']);
};
