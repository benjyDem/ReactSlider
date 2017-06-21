let gulp = require('gulp');
let compass = require('./gulp-tasks/compass.js');
let babelify = require('./gulp-tasks/babelify.js');
let watch = require('./gulp-tasks/watch.js');
let release = require('./gulp-tasks/release.js');

gulp.task('compass',  compass);
gulp.task('babelify',  babelify);
gulp.task('watch',  watch);
gulp.task('release',  release);