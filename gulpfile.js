// Plugins
const gulp = require("gulp");
const htmlmin = require("gulp-htmlmin");
const imagemin = require("gulp-imagemin");
const concat = require("gulp-concat");
const terser = require("gulp-terser");
const sourcemaps = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const cleancss = require("gulp-clean-css");
const autoprefixer = require("autoprefixer");
const purgecss = require("gulp-purgecss");
const modernizr = require("gulp-modernizr");
const uglify = require("gulp-uglify");
const useref = require("gulp-useref");
const svgmin = require("gulp-svgmin");
const svgstore = require("gulp-svgstore");
const rename = require("gulp-rename");
const { src, series, parallel, dest, watch } = require("gulp");

const jsPath = "./js/**/*.js";
const cssPath = "./css/**/*.css";
const htmlPath = "./*.html";

function htmlTask() {
  return src("*.html")
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(gulp.dest("_dist"));
}

function imgTask() {
  return src("img/*").pipe(imagemin()).pipe(gulp.dest("_dist/img"));
}

function svgTask() {
  return src("img/**/*.svg")
    .pipe(svgmin())
    .pipe(svgstore())
    .pipe(rename({ basename: "sprite" }))
    .pipe(gulp.dest("_dist/img/svg"));
}

function jsTask() {
  return src(jsPath)
    .pipe(sourcemaps.init())
    .pipe(concat("all.min.js"))
    .pipe(modernizr())
    .pipe(terser())
    .pipe(sourcemaps.write("."))
    .pipe(uglify())
    .pipe(dest("_dist/js"));
}

function cssTask() {
  const plugins = [autoprefixer()];
  // Para configurar as opções de minificação do cleanCss, basta alterar o options
  // Lista completa de plugins do postCSS no site > https://www.postcss.parts/
  // Você poderá verificar todas as regras do level 1 e mais na documentação > https://www.npmjs.com/package/clean-css

  var options = {
    level: {
      1: {
        all: true,
        normalizeUrls: false,
        roundingPrecision: false,
        specialComments: 0,
        semicolonAfterLastProperty: false,
      },
      2: {
        mergeAdjacentRules: true, // controls adjacent rules merging; defaults to true
        mergeIntoShorthands: true, // controls merging properties into shorthands; defaults to true
        mergeMedia: true, // controls `@media` merging; defaults to true
        mergeNonAdjacentRules: true, // controls non-adjacent rule merging; defaults to true
        mergeSemantically: false, // controls semantic merging; defaults to false
        overrideProperties: true, // controls property overriding based on understandability; defaults to true
        removeEmpty: true, // controls removing empty rules and nested blocks; defaults to `true`
        reduceNonAdjacentRules: true, // controls non-adjacent rule reducing; defaults to true
        removeDuplicateFontRules: true, // controls duplicate `@font-face` removing; defaults to true
        removeDuplicateMediaBlocks: true, // controls duplicate `@media` removing; defaults to true
        removeDuplicateRules: true, // controls duplicate rules removing; defaults to true
        removeUnusedAtRules: false, // controls unused at rule removing; defaults to false (available since 4.1.0)
        restructureRules: false, // controls rule restructuring; defaults to false
        skipProperties: [], // controls which properties won't be optimized, defaults to `[]` which means all will be optimized (since 4.1.0)
      },
    },
  };
  return src(cssPath)
    .pipe(sourcemaps.init())
    .pipe(concat("all.min.css"))
    .pipe(
      purgecss({
        content: ["*.html"],
      })
    )
    .pipe(postcss(plugins))
    .pipe(cleancss(options))
    .pipe(sourcemaps.write("."))
    .pipe(dest("_dist/css"));
}

function watchTask() {
  watch(
    [htmlPath, cssPath, jsPath],
    { interval: 1000 },
    parallel(htmlTask, jsTask, cssTask, useRef)
  );
}

function useRef() {
  return gulp.src("./*.html").pipe(useref()).pipe(gulp.dest("_dist"));
}

exports.imgTask = imgTask;
exports.svgTask = svgTask;
exports.htmlTask = htmlTask;
exports.jsTask = jsTask;
exports.cssTask = cssTask;
exports.useRef = useRef;

exports.default = series(
  parallel(imgTask, svgTask, htmlTask, jsTask, cssTask, useRef),
  watchTask
);
