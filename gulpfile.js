var gulp = require('gulp');
var runSequence = require('run-sequence');
var clean = require('gulp-clean');
var ts = require('gulp-typescript');
var concat = require('gulp-concat');
var embedTemplates = require('gulp-angular-embed-templates');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
var merge = require('merge2');
var sass = require('gulp-sass');
var ngmin = require('gulp-ngmin');
var addsrc = require('gulp-add-src');
var bowerMain = require('bower-main');

var gutil = require('gulp-util');
 
 
var bowerMainJS = bowerMain('js','min.js');
var bowerMainCSS = bowerMain('css','min.css');

gulp.task('scripts', function(callback) {
  runSequence('prebuild:clean',
               'build:ts',
               'build:js-libs',
               [
                 'build:js', 
                 'build:sass',
                 'build:html',
                 'build:images',
                 'build:manifest',
                 'build:chrome-js',
                 'build:font'
               ],
               'postbuild:clean',
              callback);
});


gulp.task('build:ts:js', function(callback) {
  runSequence('prebuild:clean',
               'build:ts',
              ['build:js','build:manifest'],
               'postbuild:clean',
              callback);
});


gulp.task('watch', function () {
  gulp.watch('./app/**/*.scss', ['sass']);
  gulp.watch('./app**/*.ts', ['build:ts:js']);
  gulp.watch('./app/**/*.html', ['scripts']);
});

gulp.task('prebuild:clean', function () {
    return gulp.src('./release/', {read: false})
        .pipe(clean());
});
 
gulp.task('build:ts', function () {
    return gulp.src(['app/**/*.ts','types/**/*.d.ts'])
        //.pipe(addsrc(['app/lib/**/*.js']))
        .pipe(ts({
            declarationFiles: false,
            noExternalResolve: true,
            noImplicitAny: false,
            noEmitOnError: true,
            target: 'ES5',
            out: 'app/_temp.js',
        }))
        .pipe(embedTemplates({
            basePath: __dirname
        }))
        //.pipe(stripDebug())
        .pipe(gulp.dest(''))
});

gulp.task('build:js-libs', function() {
    return gulp.src(['app/lib/**/*.js','app/_temp.js'])
        //min und ugly nur für echtes deployment...
        //.pipe(ngmin())
        //.pipe(uglify({ mangle: false }))
        .pipe(concat('__temp.js'))
        .pipe(gulp.dest('./app/'));
}); 

gulp.task('build:js', function() {
        //gutil.log('Hello world!');
        return gulp.src('')
        //.pipe(addsrc(bowerMainJS.normal))
        .pipe(addsrc(bowerMainJS.minified)).pipe(addsrc(bowerMainJS.minifiedNotFound))
        .pipe(addsrc('app/__temp.js'))
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./release/js/'));
});
  
gulp.task('build:images', function() {
    var imgSrc = './app/images/**/*', 
        imgDst = './release/images/'; 
    return gulp.src(imgSrc)
        .pipe(gulp.dest(imgDst));
});

gulp.task('build:manifest', function() {
    var src = './manifest.json',
        dst = './release/'; 
    return gulp.src(src)
        .pipe(gulp.dest(dst));
});
gulp.task('build:font', function() {
    var src = './app/css/fonts/**/*',
        dst = './release/css/fonts/'; 
    return gulp.src(src)
        .pipe(gulp.dest(dst));
});
gulp.task('build:chrome-js', function() {
    var src = './app/chrome/*',
        dst = './release/chrome/'; 
    return gulp.src(src)
        .pipe(gulp.dest(dst));
});

gulp.task('build:sass', function () {
  return gulp.src([
            './app/css/**/*.css',
            './app/css/**/*.scss'
        ])
        .pipe(addsrc(bowerMainCSS.minified)).pipe(addsrc(bowerMainCSS.minifiedNotFound))
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(concat('main.css'))
        .pipe(gulp.dest('./release/css'));
});

 
 gulp.task('build:html', function() {
    var imgSrc = './app/*.html',
        imgDst = './release/';
    return gulp.src(imgSrc)
        .pipe(gulp.dest(imgDst));
});


gulp.task('postbuild:clean', function () {
    return gulp.src(['app/_temp.js','app/__temp.js'])
        .pipe(clean({force: true}));
});
 
 

