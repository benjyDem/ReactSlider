let compass = require('./compass.js');
let babelify = require('./babelify.js');
module.exports = (cb) => {
    compass( 0, 'watch');
    babelify( 0, 'watch');
    cb();
};