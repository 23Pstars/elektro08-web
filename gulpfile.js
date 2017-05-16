const gulp = require('gulp');
const del = require('del');
const less = require('gulp-less');
const browserSync = require('browser-sync').create();
const header = require('gulp-header');
const cleanCSS = require('gulp-clean-css');
const rename = require("gulp-rename");
const uglify = require('gulp-uglify');
const filter = require('gulp-filter');
const concat = require('gulp-concat');
const htmlmin = require('gulp-htmlmin');
const child = require('child_process');
const gutil = require('gulp-util');
const pkg = require('./package.json');

const banner = ['/*!\n',
    ' * <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' *\n',
    ' * Maintained by\n',
    ' * <%= pkg.author %> (<%= pkg.author_url %>)\n',
    ' */\n',
    ''
].join('');

gulp.task('html', function () {
    return gulp
        .src('_source/**/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('.'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('css', function () {
    return gulp
        .src(['_source/assets/less/freelancer.less',
            '_source/assets/less/elektro08.less'])
        .pipe(less())
        .pipe(concat('style.min.css'))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(header(banner, {pkg: pkg}))
        .pipe(gulp.dest('assets/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('js', function () {
    return gulp
        .src([
            '_source/assets/js/freelancer.js',
            '_source/assets/js/elektro08.js'])
        .pipe(uglify())
        .pipe(concat('script.min.js'))
        .pipe(header(banner, {pkg: pkg}))
        .pipe(gulp.dest('assets/js'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('copy', function () {
    gulp.src([
        'node_modules/bootstrap/dist/css/bootstrap.min.css',
        'node_modules/bootstrap/dist/css/bootstrap-theme.min.css',
        'node_modules/font-awesome/css/font-awesome.min.css'])
        .pipe(gulp.dest('assets/css'));
    gulp.src([
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/jquery-easing/dist/jquery.easing.1.3.umd.min.js',
        'node_modules/bootstrap/dist/js/bootstrap.min.js'])
        .pipe(gulp.dest('assets/js'));
    gulp.src([
        'node_modules/bootstrap/dist/fonts/*',
        'node_modules/font-awesome/fonts/*'])
        .pipe(gulp.dest('assets/fonts'));

    gulp.src('_source/**/*.md')
        .pipe(gulp.dest('.'));
    gulp.src('_source/assets/img/**/*')
        .pipe(gulp.dest('assets/img'));
});

gulp.task('jekyll', function () {
    const jekyll = child.spawn('bundle', ['exec', 'jekyll', 'serve',
        '--watch',
        '--incremental',
        '--drafts'
    ]);
    const jekyllLogger = function (buffer) {
        buffer.toString()
            .split(/\n/)
            .forEach(function (message) {
                gutil.log('Jekyll: ' + message)
            })
    };
    jekyll.stdout.on('data', jekyllLogger);
    jekyll.stderr.on('data', jekyllLogger);
});

gulp.task('default', ['html', 'css', 'js', 'copy']);

gulp.task('watch', ['default'], function () {
    gulp.watch('_source/assets/less/*.less', ['css']);
    gulp.watch('_source/assets/js/*.js', ['js']);
    gulp.watch('_source/**/*.html', ['html']);
    gulp.watch('_source/**/*.md', ['copy']);
});

gulp.task('dev', ['watch', 'jekyll'], function () {
    browserSync.init({
        server: {
            baseDir: '_site'
        }
    })
});
