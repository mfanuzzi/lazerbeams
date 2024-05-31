/// <binding BeforeBuild='clean' Clean='clean' ProjectOpened='watch, default' />
"use strict";

//var catalogData = require("./catalog.json");
//console.log(catalogData.catalog[0].desc);

const gulp = require("gulp"),
  rimraf = require("rimraf"),
  concat = require("gulp-concat"),
  cssmin = require("gulp-cssmin"),
  uglify = import("gulp-uglify"),
  sass = require("gulp-sass")(require("sass")),
  connect = require("gulp-connect"),
  sort = require("gulp-sort"),
  hb = require("gulp-hb"),
  rename = require("gulp-rename"),
  yaml = require("js-yaml"),
  fs = require("fs"),
  imageResize = import("gulp-image-resize"),
  imagemin = import("gulp-imagemin"),
  path = require("path");

const d = fs.readFileSync("./catalog.yaml", "utf8");
var catalogData = yaml.load(d);
catalogData.version = +new Date();

var paths = {
  webroot: "./",
  pub: "./public/",
};

paths.static = [
  paths.webroot + "img/**",
  paths.webroot + "fonts/**",
  paths.webroot + "letter/**",
];

paths.html = paths.webroot + "*.tpl.html";
paths.catalog = paths.webroot + "img/catalog/*.jpg";
paths.js = paths.webroot + "js/**/*.js";
paths.minJs = paths.webroot + "js/**/*.min.js";
paths.css = paths.webroot + "css/*.css";
paths.scss = paths.webroot + "scss/*.scss";
paths.minCss = paths.webroot + "css/*.min.css";

paths.concatJsDest = paths.pub + "js/site.min.js";
paths.concatCssDest = paths.pub + "css/site.min.css";

gulp.task("clean:js", function (cb) {
  rimraf(paths.concatJsDest, cb);
});

gulp.task("clean:css", function (cb) {
  rimraf(paths.concatCssDest, cb);
});

gulp.task("sass", function () {
  return gulp
    .src(paths.scss)
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest("./css"))
    .pipe(connect.reload());
});

gulp.task("watch", function () {
  gulp.watch(paths.scss, ["sass"]);
  gulp.watch([paths.html, "./catalog.yaml"], ["hb"]);
  gulp.watch(paths.js, ["min:js"]);
});

gulp.task("clean", gulp.parallel("clean:js", "clean:css"));

gulp.task("min:js", function () {
  return (
    gulp
      .src([paths.js, "!" + paths.minJs], { base: "." })
      .pipe(sort({ asc: false }))
      .pipe(concat(paths.concatJsDest))
      //.pipe(uglify())
      .pipe(gulp.dest("."))
  );
});

gulp.task("min:css", function () {
  return gulp
    .src([paths.css, "!" + paths.minCss])
    .pipe(concat(paths.concatCssDest))
    .pipe(cssmin())
    .pipe(gulp.dest("."));
});

gulp.task("min:img", function () {
  return (
    gulp
      .src([paths.catalog])
      .pipe(imageResize({ width: 800 }))
      // .pipe(imagemin({
      //   progressive: true
      // }))
      .pipe(
        rename(function (path) {
          console.log(path.dirname);
          path.dirname += "/sm";
        })
      )
      .pipe(gulp.dest(paths.pub + "/img/catalog"))
  );
});

gulp.task("min", gulp.parallel("min:js", "min:css"));

gulp.task("hb", function () {
  var hbStream = hb()
    //.helpers(require('handlebars-helper-svg'))
    .data(catalogData);

  return gulp
    .src("./index.tpl.html")
    .pipe(hbStream)
    .pipe(
      rename(function (path) {
        path.basename = path.basename.replace(".tpl", "");
      })
    )
    .pipe(gulp.dest(paths.pub));
});

gulp.task("shares", function (taskcomplete) {
  // For each catalog item, create a share page for each available href
  catalogData.catalog
    .filter((i) => i.no !== "lb011")
    .forEach(function (i) {
      i.avails.forEach(function (a) {
        Object.assign(a, i);
        a.artist = a.artist.replace(/(<([^>]+)>)/gi, "");

        var hbStream = hb()
          //.helpers(require('handlebars-helper-svg'))
          .data(a);

        gulp
          .src("./share.tpl.html")
          .pipe(hbStream)
          .pipe(
            rename(function (path) {
              path.basename = "index";
            })
          )
          .pipe(
            gulp.dest(
              path.join(paths.pub, path.join(i.no, a.name.toLowerCase()))
            )
          );
      });

      var hbStream = hb()
        //.helpers(require('handlebars-helper-svg'))
        .data(i);

      gulp
        .src("./item.tpl.html")
        .pipe(hbStream)
        .pipe(
          rename(function (path) {
            path.basename = "index";
          })
        )
        .pipe(gulp.dest(path.join(paths.pub, i.no)));
    });

  taskcomplete();
});

gulp.task("static", function () {
  return gulp
    .src(paths.static, { base: paths.webroot })
    .pipe(gulp.dest(paths.pub));
});

gulp.task("connect", function () {
  connect.server({
    root: paths.pub,
    livereload: true,
  });
});

gulp.task(
  "publish",
  gulp.series("sass", "hb", "shares", "min", "min:img", "static")
);

gulp.task("default", gulp.series("connect"));
