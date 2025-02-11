// Initialize modules
const { src, dest, watch, series, parallel } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const babel = require("gulp-babel");
const terser = require("gulp-terser");
const browsersync = require("browser-sync").create();

// use dart-css for @use
// sass.compiler = require('dart-sass');

// Sass task
function scssTask() {
	return src("app/scss/style.scss", { sourcemaps: true })
		.pipe(sass().on("error", sass.logError))
		.pipe(postcss([autoprefixer(), cssnano()]))
		.pipe(dest("dist", { sourcemaps: "." }));
}

// Javascript Task
function jsTask() {
	return src("app/js/script.js", { sourcemaps: true })
		.pipe(babel({ presets: ["@babel/preset-env"] })) // babel will compile es6 to older js that older browsers can support
		.pipe(terser()) // to minify the generated js file
		.pipe(dest("dist", { sourcemaps: "." }));
}

// Browsersync
function browserSyncServe(cb) {
	browsersync.init({
		server: {
			baseDir: ".",
		},
		notify: {
			styles: {
				top: "auto",
				bottom: "0",
			},
		},
	});
	cb(); // callback function to indicate that it has finished running
}

function browserSyncReload(cb) {
	browsersync.reload();
	cb();
}

// Watch Task
function watchTask(params) {
	watch("*.html", browserSyncReload); // watch all html files and if any changes are detected, call browserSyncReload
	watch(
		["app/scss/**/*.scss", "app/**/*.js"], // watch all scss and js files
		series(scssTask, jsTask, browserSyncReload) // these functions/tasks will run if the scss or js files change
	);
}
// Default Gulp Task
exports.default = series(scssTask, jsTask, browserSyncServe, watchTask); // These are the tasks that will run when you run the 'gulp' command to start the server
