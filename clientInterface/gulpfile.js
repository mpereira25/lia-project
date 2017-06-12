'use strict';

var gulp = require('gulp'),
    autoprefixer = require('autoprefixer'),
    postcss = require('gulp-postcss'),
    cleanCss = require('gulp-clean-css'),
    usemin = require('gulp-usemin'),
    uglify = require('gulp-uglify'),
    es = require('event-stream'),
    del = require('del'),
    fs = require('fs'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    scsslint = require('gulp-scss-lint'),
    eslint = require('gulp-eslint'),
    replace = require('gulp-replace'),
    webpack = require("webpack"),
    gutil = require("gulp-util"),
    exec = require('child_process').exec;

var webpackConfig = require("./webpack.config.js");


var yeoman = {
    app: 'src/',
    dist: 'dist/',
    test: 'src/test/',
    tmp: '.tmp/',
    port: 9000,
    apiPort: 8080,
    liveReloadPort: 35729
};
var isMockHtml = false;


gulp.task('clean', function (cb) {
  del([yeoman.dist], cb);
});

gulp.task('clean:css', function(cb) {

    var delTab = [];
    delTab.push(yeoman.dist + 'css/');
    del(delTab, cb);


});
gulp.task('clean:tmp', function(cb) {
    del([yeoman.tmp], cb);
});
gulp.task('clean:html', function(cb) {
    del([yeoman.dist + '*.html'], cb);
});

gulp.task('copy:html', function() {

    return gulp.src(yeoman.app + '**/*.html').
        pipe(gulp.dest(yeoman.dist));
});
gulp.task('copy:assets', function() {

    return es.merge(gulp.src(yeoman.app + 'assets/**').
              pipe(gulp.dest(yeoman.dist + 'assets/')));
});

gulp.task('scss-lint', function() {
    return gulp.src(yeoman.app + 'view/sass/**/*.scss')
        .pipe(scsslint({
            'config': '.scss-lint.yml'
        }));
});

gulp.task('sass', function () {
    gulp.src([yeoman.app + 'view/sass/main.scss'])
        .pipe(sass({includePaths: yeoman.app + 'view/sass'}).on('error', sass.logError))
        .pipe(gulp.dest(yeoman.tmp))
        .pipe(concat('main.css'))
        .pipe(postcss([autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
            })]))
        .pipe(gulp.dest(yeoman.dist + 'css/'));


});


gulp.task('cleanCSS', function() {

    return gulp.src([yeoman.dist + 'css/*.css']).
        pipe(cleanCss()).
        pipe(gulp.dest(yeoman.dist + 'css/'));
});
gulp.task('watch', function() {

    gulp.watch(yeoman.app + '**/*.html', ['copy:html', 'browserSyncReload']);
    gulp.watch(yeoman.app + '**/*.scss', ['clean:css', 'scss-lint', 'sass', 'cleanCSS', 'browserSyncReload']);
});
gulp.task('browserSyncReload', function() {
    browserSync.reload();
});
gulp.task("webpack:serve", function() {
    var myConfig = Object.create(webpackConfig);
    myConfig.watch = true;

    myConfig.plugins = [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: JSON.stringify('dev')
          }
        }),
        new webpack.optimize.UglifyJsPlugin({
            mangle: {
                except: ['$super', '$', 'exports', 'require']
            }
        })
    ];
    // run webpack
    webpack(myConfig, function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            // output options
        }));
        //callback();
    });
});

gulp.task("webpack:build", function() {
    var myConfig = Object.create(webpackConfig);

    myConfig.plugins = [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: JSON.stringify('production')
          }
        }),
        new webpack.optimize.UglifyJsPlugin({
            mangle: {
                except: ['$super', '$', 'exports', 'require']
            }
        })
    ];
    // run webpack
    webpack(myConfig, function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            // output options
        }));
        //callback();
    });
});
gulp.task('default', function() {
    runSequence('build');
});
gulp.task('serve:build', function() {
    runSequence('build', function () {

        browserSync({
            open: false,
            port: yeoman.port,
            server: {
                baseDir: yeoman.dist
            }
        });

        runSequence('watch');
    });
});

gulp.task('serve', function() {
    isMockHtml = false;
    runSequence('clean', 'copy:html', 'copy:assets', 'sass', 'cleanCSS', 'webpack:serve', function () {

        browserSync({
            open: false,
            port: yeoman.port,
            server: {
                baseDir: yeoman.dist
            }
        });

        runSequence('watch');
    });
});

gulp.task('build', function () {
    isMockHtml = false;
    runSequence('clean', 'copy:html', 'copy:assets', 'sass', 'cleanCSS', 'webpack:build');
});

gulp.task('server-side', function () {
    isMockHtml = false;
    runSequence('clean', 'copy:html', 'copy:assets', 'sass', 'cleanCSS', function() {

        exec("babel-node src/server.js", function callback(error, stdout, stderr){
            if(error) {
                console.log(error);
            }
            console.log(stdout);

        });

        runSequence('watch', 'webpack:serve');
    });

});
