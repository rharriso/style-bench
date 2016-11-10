'use strict';

const fs = require('fs');
const gulp = require('gulp');
const gulpUtil = require('gulp-util');
const mocha = require('gulp-mocha');
const babel = require('gulp-babel');
const exec = require('child_process').exec;
const runSequence = require('run-sequence');
const sourcemaps = require('gulp-sourcemaps');



// Start server with nodemon
gulp.task('transpile', function (){
  gulp.src('src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015', 'react']
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('lib'));
});

gulp.task('run', ['transpile'], function (cb) {
  exec('node lib/app.js', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

// Watch for changes in server files
gulp.task('server-watch', ['run'], function () {
  gulp.watch(['src/**/*'], ['run']);
});


/**
* Mocha watch
*/
/**
* execute mocha test for passed file
* @param {String} testFile - test file glob to run
* @returns {undefined}
*/
function runMochaTest(testFile) {
  if (!fs.existsSync(testFile)){
    console.error(testFile + ' Doesn\'t exist');
  }
  return gulp.src(testFile)
  .pipe(mocha({debug: true}))
  .on('error', function (error) {
    gulpUtil.log(error.message);
    if (error.stack) {
      gulpUtil.log(error.stack.replace(/\\n/ig, '\n'));
    }
  });
}

// mocha testing
gulp.task('mocha', function (){
  require('./test/.config'); // load mocha config, (is not in this file)
  runMochaTest('./test/**/*.mocha.spec.js');
});

gulp.task('mocha-watch', ['mocha'], function (){
  gulpUtil.log('watching for changes');

  gulp.watch(['./test/**/*.mocha.spec.js'], function (file){
    const testFile = file.path.replace(__dirname, '.');
    gulpUtil.log('Running: ' + testFile);
    runMochaTest(testFile);
  });

  gulp.watch(['./src/**/*.js', './src/**/*.jsx'], function (file){
    const testFile = file.path.replace(__dirname, '.')
    .replace('/src/', '/test/client/src/')
    .replace(/\.jsx?$/, '.mocha.spec.js');
    gulpUtil.log('Running: ' + testFile);
    runMochaTest(testFile);
  });
});
