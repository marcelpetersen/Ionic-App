var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var ngAnnotate = require('gulp-ng-annotate');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var iife = require("gulp-iife");
var sh = require('shelljs');

var paths = {
    sass: ['./scss/**/*.scss']
};

gulp.task('default', ['sass', 'scripts', 'watch']);

gulp.task('sass', function(done) {
    gulp.src('./scss/ionic.app.scss')
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(gulp.dest('./www/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest('./www/css/'));
});

// Concat & Minify App JS
gulp.task('scripts', function() {
    return gulp.src('./www/module/**/*.js')
        .pipe(iife())
        .pipe(ngAnnotate())
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest('./www/js'));
    // .pipe(rename('scripts.min.js'));
    // .pipe(uglify())
    // .pipe(gulp.dest('app/dist'));
});

gulp.task('watch', function() {
    gulp.watch('./scss/**/*.scss', ['sass']);
    gulp.watch('www/module/**/*.js', ['scripts']);
});
