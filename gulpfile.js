/* eslint-disable node/no-unpublished-require */
const gulp = require('gulp');
const rename = require('gulp-rename');
const gulpSass = require('gulp-sass');
const plumber = require('gulp-plumber');
const nodeSass = require('sass');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const webpack = require('webpack-stream');

const sass = gulpSass(nodeSass);

let env = 'development';

function onError(err) {
	const splitFilename = err.file.split('/');
	const fileName = splitFilename[splitFilename.length - 1];
	/* eslint-disable no-console */
	console.log('\u001b[1;31m *** Error ***');
	console.log(`\u001b[1;32m・・・Error in file '${fileName}' on line ${err.line}・・・`);
	/* eslint-enable no-console */
	this.emit('end');
}

function setProd(cb) {
	env = 'production';
	cb();
}

const paths = {
	styles: {
		src: './public/css/scss/**/*.scss',
		dest: './public/css/',
	},
	scripts: {
		files: './public/js/**/*.mjs',
		src: './public/js/index.mjs',
		dest: './public/js/',
	},
};

function styles() {
	return gulp
		.src(paths.styles.src)
		.pipe(plumber(onError))
		.pipe(sass({ outputStyle: 'compressed' }))
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest(paths.styles.dest));
}

function scripts() {
	return gulp
		.src(paths.scripts.src, { sourcemaps: true })
		.pipe(plumber(onError))
		.pipe(webpack({ mode: env, devtool: 'source-map' }))
		.pipe(babel())
		.pipe(uglify())
		.pipe(rename('bundle.min.js'))
		.pipe(gulp.dest(paths.scripts.dest));
}

function watch() {
	gulp.watch(paths.styles.src, styles);
	gulp.watch(paths.scripts.src, scripts);
}

const build = gulp.parallel(setProd, styles, scripts);

function defaultTask(cb) {
	cb();
}

exports.styles = styles;
exports.scripts = scripts;
exports.watch = watch;
exports.build = build;

exports.default = defaultTask;
