var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');

gulp.task('build', function () {
  return browserify({ entries: './index.js', extensions: ['.js'], debug: false })
    .transform(babelify)
    .bundle()
    .pipe(source('edifact.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['build'], function () {
  gulp.watch('./*.js', ['build']);
});

gulp.task('default', ['watch']);
