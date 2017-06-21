const gulp       = require('gulp');
const browserify = require('browserify');
const babelify   = require('babelify');
const rename     = require('gulp-rename');
const source     = require('vinyl-source-stream');
const watchify   = require('watchify');
const uglifyify  = require('uglifyify');
const collapse   = require('bundle-collapser/plugin');


let config      =  require('./config.js');

let bundler;
let bundleError;

function logAndReturnError() {

    if (!bundleError) console.log('Browserify -Successful build');
    else {
        console.warn('Browserify - Build failure');
        console.log(bundleError);
    }
    return bundleError;
}

function bundle(watching, cb) {

    bundleError = false;
    if (watching) console.warn('Watchify - Awaiting changes');
    bundler.bundle()
    // apparently error handling must be done here
        .on('error', function(err){

            bundleError = err;
            console.log(err.message);

            if (!watching)
                this.emit('end');
            else
                cb('Browserify -> Error' );

        })
        .pipe(source( config.paths.js + "/example.jsx" ))
        .pipe( rename( "example.build.js" ) )
        .pipe(gulp.dest( config.paths.js ))

        .on('end', () => {
            if (!watching)
                cb(logAndReturnError() ? 'Browserify -> Error'  : 0);
        });
}

module.exports = (cb, watching) => {
    let options = watching ? watchify.args : {};

    options.cache = {};
    options.packageCache= {};
    options.fullPaths = false;
    options.debug = true;
    options.entries = config.paths.js + "/example.jsx";

    if (process.env.NODE_ENV === 'production') {
        console.log('Production build -> in progress');
        options.plugins = [uglifyify,collapse];
    }

    if (!watching) {
        bundler = browserify(options);
    } else {
        bundler = watchify( browserify(options) , { poll: true } );
    }

    bundler.transform( babelify, {presets: ['es2015', 'react'], global: true});


    if (!watching) {


        bundle(0,function(error) {
            cb(error)
        });

    } else {

        bundler
            .on('update', function () {
                console.log('Babelify -> Bundled');
                bundle(1,logAndReturnError);
            });

        bundle(1,logAndReturnError);
    }
};
