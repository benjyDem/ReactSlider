let gulp   = require('gulp');
let uglify = require('gulp-uglify');
let rename     = require('gulp-rename');
let cssmin = require('gulp-cssmin');
let config =  require('./config.js');
let babelify = require('./babelify');
let compass = require('./compass');



module.exports = function(cb) {

    process.env.NODE_ENV = 'production';
    babelify(function() {

        gulp.src(config.paths.js+"/example.build.js")
            .pipe( uglify() )
            .pipe( rename({suffix: '.min'}) )
            .pipe( gulp.dest(config.paths.js) );

        compass(function() {
            gulp.src(config.paths.css.main + "/ReactSlider.css")
                .pipe(cssmin())
                .pipe(rename({suffix: '.min'}))
                .pipe(gulp.dest(config.paths.css));
            cb();
        });
    });
};