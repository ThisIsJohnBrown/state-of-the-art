module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),    
    execute: {
        target: {
            src: ['generate-index.js']
        }
    },
    watch: {
      scripts: {
        files: ['views/**/*.html'],
        tasks: ['execute'],
        options: {
          spawn: false
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-execute');

  
  grunt.registerTask('default', ['execute', 'watch']);
};
