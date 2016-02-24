var gulp = require('gulp');
var babelify = require('babelify');
var webpack = require('webpack-stream');
var uglify = require('gulp-uglify');

gulp.task('build', function() {
  return gulp.src(['index.js']).pipe(webpack({
    module: {
      loaders: [
        { loaders: ['uglify'] },
        { loaders: ['babel?presets[]=es2015'], exclude: /node_modules/ }
      ]
    },
    output: {
      filename: 'edifact.js',
      libraryTarget: 'commonjs2'
    }
  })).pipe(gulp.dest('dist/'));
});

gulp.task('watch', ['build'], function () {
  gulp.watch('./*.js', ['build']);
});

gulp.task('default', ['build']);
