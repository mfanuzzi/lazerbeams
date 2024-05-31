const gulp = require("gulp");
const { rimraf } = require("rimraf");
const concat = require("gulp-concat");
const cssmin = require("gulp-cssmin");
const uglify = require("gulp-uglify");
const sass = require("gulp-sass")(require("sass"));
const connect = require("gulp-connect");
const sort = require("gulp-sort");
const hb = require("gulp-hb");
const rename = require("gulp-rename");
const yaml = require("js-yaml");
const fs = require("fs");
const imageResize = require("gulp-image-resize");
const path = require("path");

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

gulp.task("clean:js", async () => {
  return new Promise((resolve, reject) => {
    rimraf(paths.concatJsDest).catch(reject).then(resolve);
  });
});

gulp.task("clean:css", async () => {
  return new Promise((resolve, reject) => {
    rimraf(paths.concatCssDest).catch(reject).then(resolve);
  });
});

gulp.task("sass", function () {
  console.log("Starting SASS compilation");
  return gulp
    .src(paths.scss)
    .on("data", (file) => console.log(`Processing file: ${file.path}`))
    .pipe(
      sass().on("error", (err) => {
        console.error("SASS compilation error:", err);
        process.exit(1);
      })
    )
    .pipe(gulp.dest("./css"))
    .on("end", () => console.log("SASS compilation completed"));
});

gulp.task("watch", function () {
  gulp.watch(paths.scss, gulp.series("sass"));
  gulp.watch([paths.html, "./catalog.yaml"], gulp.series("hb"));
  gulp.watch(paths.js, gulp.series("min:js"));
});

gulp.task("clean", gulp.parallel("clean:js", "clean:css"));

gulp.task("min:js", () =>
  gulp
    .src([paths.js, "!" + paths.minJs], { base: "." })
    .pipe(sort({ asc: false }))
    .pipe(concat(paths.concatJsDest))
    .pipe(uglify())
    .pipe(gulp.dest("."))
);

gulp.task("min:css", () =>
  gulp
    .src([paths.css, "!" + paths.minCss])
    .pipe(concat(paths.concatCssDest))
    .pipe(cssmin())
    .pipe(gulp.dest("."))
);

gulp.task("min:img", () =>
  gulp
    .src([paths.catalog])
    .pipe(imageResize({ width: 800 }))
    .pipe(
      rename(function (path) {
        console.log(path.dirname);
        path.dirname += "/sm";
      })
    )
    .pipe(gulp.dest(paths.pub + "/img/catalog"))
);

gulp.task("min", gulp.parallel("min:js", "min:css"));

gulp.task("hb", () =>
  gulp
    .src("./index.tpl.html")
    .pipe(hb().data(catalogData))
    .pipe(
      rename(function (path) {
        path.basename = path.basename.replace(".tpl", "");
      })
    )
    .pipe(gulp.dest(paths.pub))
);

gulp.task("shares", async function () {
  for (const i of catalogData.catalog.filter((i) => i.no !== "lb011")) {
    for (const a of i.avails) {
      Object.assign(a, i);
      a.artist = a.artist.replace(/(<([^>]+)>)/gi, "");
      await new Promise((resolve, reject) => {
        gulp
          .src("./share.tpl.html")
          .pipe(hb().data(a))
          .pipe(rename({ basename: "index" }))
          .pipe(gulp.dest(path.join(paths.pub, i.no, a.name.toLowerCase())))
          .on("end", resolve)
          .on("error", reject);
      });
    }
  }
});

gulp.task("static", () =>
  gulp.src(paths.static, { base: paths.webroot }).pipe(gulp.dest(paths.pub))
);

gulp.task("connect", () =>
  connect.server({
    root: paths.pub,
    livereload: true,
  })
);

gulp.task(
  "publish",
  gulp.series("clean", "sass", "hb", "shares", "min", "min:img", "static")
);

gulp.task("default", gulp.series("connect"));
