/// <binding BeforeBuild='clean' Clean='clean' ProjectOpened='watch, default' />
"use strict";

//var catalogData = require("./catalog.json");
//console.log(catalogData.catalog[0].desc);

const gulp = require("gulp"),
  rimraf = require("rimraf"),
  concat = require("gulp-concat"),
  cssmin = require("gulp-cssmin"),
  uglify = require("gulp-uglify"),
  sass = require("gulp-sass")(require("sass")),
  connect = require("gulp-connect"),
  sort = require("gulp-sort"),
  hb = require("gulp-hb"),
  rename = require("gulp-rename"),
  yaml = require("js-yaml"),
  fs = require("fs"),
  imageResize = require("gulp-image-resize"),
  path = require("path");

// const imagemin = (await import("gulp-imagemin")).default;

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

gulp.task("clean:js", async function (cb) {
  rimraf(paths.concatJsDest, cb);
});

gulp.task("clean:css", async function (cb) {
  rimraf(paths.concatCssDest, cb);
});

gulp.task("sass", async () =>
  gulp
    .src(paths.scss)
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest("./css"))
    .pipe(connect.reload())
);

gulp.task("watch", function () {
  gulp.watch(paths.scss, ["sass"]);
  gulp.watch([paths.html, "./catalog.yaml"], ["hb"]);
  gulp.watch(paths.js, ["min:js"]);
});

gulp.task("clean", async () => gulp.parallel("clean:js", "clean:css"));

gulp.task("min:js", async function () {
  const debug = (await import("gulp-debug")).default;

  return (
    gulp
      .src([paths.js, "!" + paths.minJs], { base: "." })
      .pipe(debug({ title: "Files:" }))
      .pipe(sort({ asc: false }))
      .pipe(debug({ title: "Sorted Files:" }))
      .pipe(concat(paths.concatJsDest))
      .pipe(debug({ title: "Concatenated Files:" }))
      //.pipe(uglify())
      .pipe(gulp.dest("."))
      .pipe(debug({ title: "Output Files:" }))
  );
});

gulp.task("min:css", async () =>
  gulp
    .src([paths.css, "!" + paths.minCss])
    .pipe(concat(paths.concatCssDest))
    .pipe(cssmin())
    .pipe(gulp.dest("."))
);

gulp.task("min:img", async () =>
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

gulp.task("min", async () => gulp.parallel("min:js", "min:css"));

gulp.task("hb", async () => {
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

gulp.task("shares", async function (taskcomplete) {
  catalogData.catalog
    .filter((i) => i.no !== "lb011")
    .forEach(function (i) {
      i.avails.forEach(function (a) {
        Object.assign(a, i);
        a.artist = a.artist.replace(/(<([^>]+)>)/gi, "");

        var hbStream = hb().data(a);

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

      var hbStream = hb().data(i);

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

  taskcomplete(); // This might be called before all async operations complete
});

gulp.task("static", async () =>
  gulp.src(paths.static, { base: paths.webroot }).pipe(gulp.dest(paths.pub))
);

gulp.task("connect", async () =>
  connect.server({
    root: paths.pub,
    livereload: true,
  })
);

gulp.task("publish", async () =>
  gulp.series("sass", "hb", "shares", "min", "min:img", "static")
);

gulp.task("default", gulp.series("connect"));
