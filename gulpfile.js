/// <binding BeforeBuild='clean' Clean='clean' ProjectOpened='watch, default' />
"use strict";

//var catalogData = require("./catalog.json");
//console.log(catalogData.catalog[0].desc);

var gulp = require("gulp"),
  rimraf = require("rimraf"),
  concat = require("gulp-concat"),
  cssmin = require("gulp-cssmin"),
  uglify = require("gulp-uglify"),
  sass = require("gulp-sass"),
  connect = require('gulp-connect'),
  sort = require('gulp-sort'),
  hb = require('gulp-hb'),
  rename = require('gulp-rename'),
  yaml = require('js-yaml'),
  fs   = require('fs'),
  imageResize = require('gulp-image-resize'),
  imagemin = require('gulp-imagemin');

var catalogData = yaml.safeLoad(fs.readFileSync('./catalog.yaml', 'utf8'));

var paths = {
  webroot: "./"
};

paths.html = paths.webroot + "*.tpl.html";
paths.catalog = paths.webroot + "img/catalog/*.jpg";
paths.js = paths.webroot + "js/**/*.js";
paths.minJs = paths.webroot + "js/**/*.min.js";
paths.css = paths.webroot + "css/*.css";
paths.scss = paths.webroot + "scss/*.scss";
paths.minCss = paths.webroot + "css/*.min.css";
paths.concatJsDest = paths.webroot + "js/site.min.js";
paths.concatCssDest = paths.webroot + "css/site.min.css";

gulp.task("clean:js", function (cb) {
  rimraf(paths.concatJsDest, cb);
});

gulp.task("clean:css", function (cb) {
  rimraf(paths.concatCssDest, cb);
});

gulp.task('sass', function () {
    return gulp.src(paths.scss)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest("./css"))
        .pipe(connect.reload());
});

gulp.task('watch', function () {
    gulp.watch(paths.scss, ['sass']);
    gulp.watch([paths.html, "./catalog.yaml"], ['hb', ]);
    gulp.watch(paths.js, ['min:js']);
});

gulp.task("clean", ["clean:js", "clean:css"]);

gulp.task("min:js", function () {
  return gulp.src([paths.js, "!" + paths.minJs], { base: "." })
    .pipe(sort({asc: false}))
    .pipe(concat(paths.concatJsDest))
    //.pipe(uglify())
    .pipe(gulp.dest("."));
});

gulp.task("min:css", function () {
  return gulp.src([paths.css, "!" + paths.minCss])
    .pipe(concat(paths.concatCssDest))
    .pipe(cssmin())
    .pipe(gulp.dest("."));
});

gulp.task("min:img", function() {
  return gulp.src([paths.catalog])
    .pipe(imageResize({ width: 600 }))
    // .pipe(imagemin({
    //   progressive: true
    // }))
    .pipe(rename(function (path) {
      console.log(path.dirname);
      path.dirname += "/sm";
    }))
    .pipe(gulp.dest("./img/catalog"));
});


gulp.task("min", ["min:js", "min:css"]);

gulp.task('hb', function () {
    var hbStream = hb()
      //.helpers(require('handlebars-helper-svg'))
      .data(catalogData);

    return gulp
        .src('./*.tpl.html')
        .pipe(hbStream)
        .pipe(rename(function (path) {
          path.basename = path.basename.replace('.tpl', '');
        }))
        .pipe(gulp.dest('.'));
});

gulp.task('connect', function() {
  connect.server({
    root: '.',
    livereload: true
  });
});

gulp.task('default', ['connect']);