'use strict';

module.exports = function (grunt) {


    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-run');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-injector');
    grunt.loadNpmTasks('grunt-wiredep');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
        concat: {
            options: {
                separator: ''
            },
            server: {
                src: ['server/app.js', 'common/**/*.js', 'server/utils/**/*.js', 'server/dao/**/*.js', 'server/model/**/*.js', 'server/controller/**/*.js', 'server/service/**/*.js', 'server/modules/**/*.js', 'server/main.js'],
                dest: 'server.js'
            }
        },
        clean:{
            options: {
                force: true
            },
            client: 'dist/',
            cordova: 'cordovaLiya/www/'
        },
        copy:{
            html:{
                src: ['client/index.html'],
                dest: 'dist/index.html'
            },
            js:{
                expand: true,
                cwd: '',
                dest: 'dist/',
                src: ['client/js/**/*', 'common/**/*']
            },
            assets:{
                expand: true,
                cwd: 'client/',
                dest: 'dist/',
                src: ['assets/**/*']
            },
            bower:{
                expand: true,
                cwd: '',
                dest: 'dist/',
                src: ['bower_components/**/*']
            },
            cordova:{
                expand: true,
                cwd: 'dist',
                dest: 'cordovaLiya/www/',
                src: ['**/*']
            }
        },
        injector: {
            options: {
                addRootSlash : false,
                relative: true
            },
            local_dependencies: {
                files: {
                    'client/index.html': ['client/js/app.js',
                        'common/constants/EVENT.js',
                        'common/constants/SOCKET_MESSAGE.js',
                        'client/js/vendor/**/*.js',
                        'common/service/**/*.js',
                        'client/js/controller/**/*.js',
                        'client/js/dal/**/*.js',
                        'client/js/views/**/*.js',
                        'client/js/main.js',
                        '!client/js/**/*Test.js']
                }
            }
        },
        sass: {
            dist: {
                options: {
                    style: 'expanded'
                },
                files: {
                    'dist/css/main.css': 'client/sass/imports.scss'
                }
            }
        },
        wiredep: {
            app: {
                src: ['client/index.html'],
                ignorePath:  /\.\.\//
            },
            sass: {
                src: ['client/sass/{,*/}*.{scss,sass}'],
                ignorePath: /(\.\.\/){1,2}bower_components\//
            }
        },
        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: 'client/index.html',
            options: {
                dest: 'dist',
                flow: {
                    html: {
                        steps: {
                            js: ['concat'],
                            css: ['concat']
                        },
                        post: {}
                    }
                }
            }
        },
        usemin: {
            html: ['dist/index.html'],
            css: ['dist/css/{,*/}*.css'],
            options: {
                assetsDirs: ['dist','dist/assets']
            }
        },
        run: {
            options: {
                // Task-specific options go here.
            },
            node: {
                cmd: 'node',
                args: [
                    'server.js'
                ]
            },
            cordovaAndroid: {
                options: {
                    cwd: 'cordovaLiya'
                },
                cmd: 'cordova',
                args: [
                    'build android'
                ]
            }
        },
        watch: {
            js: {
                files: ['client/script/**/*.js'],
                tasks: ['copy:js']
            },
            html: {
                files: ['client/**/*.html'],
                tasks: ['injector', 'wiredep','copy:html']
            },
            sass: {
                files: ['client/styles/**/*.scss'],
                tasks: ['sass']
            },
            assets: {
                files: ['client/assets/**'],
                tasks: ['copy:assets']
            }
        }
    });

    grunt.registerTask('build', [
        'clean:client',
        'clean:cordova',
        'injector',
        'sass',
        'wiredep',
        'copy:html',
        'copy:assets',
        'useminPrepare',
        'concat',
        'usemin',
        'copy:cordova'
    ]);

    grunt.registerTask('serve', [
        'clean:client',
        'clean:cordova',
        'injector',
        'sass',
        'wiredep',
        'copy:html',
        'copy:assets',
        'useminPrepare',
        'concat',
        'usemin',
        'copy:cordova'
    ]);

    grunt.registerTask('start', [
        'serve',
        'run:node'
    ]);

    grunt.registerTask('build-android', [
        'serve',
        'run:cordovaAndroid'
    ]);

};
