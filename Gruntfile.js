// jshint node:true

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    // Define the configuration for all the tasks
    grunt.initConfig({
        // Project settings
        config: {
            // Configurable paths
            app: 'app'
        },
        // Watches files for changes and runs tasks based on the changed files
        watch: {
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= config.app %>/{,*/}*.html',
                    '.tmp/styles/{,*/}*.css',
                    '<%= config.app %>/images/{,*/}*'
                ]
            }
        },
        // The actual grunt server settings
        connect: {
            options: {
                port: 8000,
                livereload: 35729,
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    open: true,
                    base: [
                        '.tmp',
                        '<%= config.app %>'
                    ]
                }
            },
        },
    });
    grunt.registerTask('serve', function (target) {
        grunt.task.run([
            'connect:livereload',
            'watch'
        ]);
    });
};
