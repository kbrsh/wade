const gulp = require("gulp");
const buble = require("buble");
const uglifyJS = require("uglify-js");
const composer = require("gulp-uglify/composer");
const uglify = composer(uglifyJS, console);
const replace = require("gulp-replace");
const include = require("gulp-include");
const concat = require("gulp-concat");
const header = require("gulp-header");
const size = require("gulp-size");
const Transform = require("stream").Transform;
const mocha = require("gulp-mocha");
const pkg = require("./package.json");

// Header comment
const comment = `/**
 * Wade v${pkg.version}
 * Copyright 2017 Kabir Shah
 * Released under the MIT License
 * https://github.com/kbrsh/wade
 */\r\n`;

// Gulp Buble Plugin
const gulpBuble = function(options) {
  return new Transform({
    objectMode: true,
    transform: function(file, encoding, callback) {
      if(!file.isStream()) {
        if(options === undefined) {
          options = {};
        }

        let result = null;
        try {
          result = buble.transform(file.contents.toString(), options);
        } catch(e) {
          throw new Error("[Buble] Error: " + e);
        }

        file.contents = new Buffer(result.code);

        callback(null, file);
      }
    }
  });
};

gulp.task("transpile", function() {
  return gulp.src(["./src/index.js"])
    .pipe(gulpBuble({
      namedFunctionExpressions: false,
      transforms: {
        arrow: true,
        classes: false,
        collections: false,
        computedProperty: false,
        conciseMethodProperty: false,
        constLoop: false,
        dangerousForOf: false,
        dangerousTaggedTemplateString: false,
        defaultParameter: false,
        destructuring: false,
        forOf: false,
        generator: false,
        letConst: true,
        modules: false,
        numericLiteral: false,
        parameterDestructuring: false,
        reservedProperties: false,
        spreadRest: false,
        stickyRegExp: false,
        templateString: true,
        unicodeRegExp: false
      }
    }))
    .pipe(concat("wade.js"))
    .pipe(gulp.dest("./dist/"));
});

gulp.task("build", ["transpile"], function() {
  return gulp.src(["./src/wrapper.js"])
    .pipe(include())
    .pipe(concat("wade.js"))
    .pipe(header(comment + '\n'))
    .pipe(replace("__VERSION__", pkg.version))
    .pipe(size())
    .pipe(gulp.dest("./dist/"));
});

gulp.task("minify", ["build"], function() {
  return gulp.src(["./dist/wade.js"])
    .pipe(uglify())
    .pipe(header(comment))
    .pipe(size())
    .pipe(size({
      gzip: true
    }))
    .pipe(concat("wade.min.js"))
    .pipe(gulp.dest("./dist/"));
});


gulp.task("test", function() {
  gulp.src("./test/**/*.js")
  		.pipe(mocha({reporter: "spec"}))
});

// Default task
gulp.task("default", ["build", "minify"]);
