let gulp        = require('gulp');
let watch       = require('gulp-watch');
let compass     = require('gulp-compass');
let cssbeautify = require('gulp-cssbeautify');
let plumber     = require('gulp-plumber');
let config      =  require('./config.js');


let cssErrors;
function onError(error) {
    cssErrors++;
    console.log('Compass -> Error', error);
}

function compile(css, scss, cb) {
    cssErrors = 0;
    gulp.src([
        scss
    ])
        .pipe(plumber(onError))
        .pipe(compass({
            config_file: './config.rb',
            css: css,
            sass: scss
        }))
        //.pipe(cssbeautify())
        .pipe(gulp.dest(css))
        .on('error', () => { cssErrors++; })
        .on('end', () => {
            if (!cssErrors) console.log('Successful compilation');
            else console.log('Compilation failed');
            if (cb) cb();
        });
}


module.exports = function(cb, watching) {

    if (watching) {

        watch(config.paths.scss+'/**/*.scss', () => {
            console.log('Change');
            compile(config.paths.css, config.paths.scss, cb);
        })
        .on('change', function(event) {
            console.log('Compass -> File ' + event + ' was changed');
        }).on('error', onError);

        console.log('Watch[SCSS] -> Awaiting changes')

    } else {
        compile( config.paths.css, config.paths.scss, cb );
    }

};