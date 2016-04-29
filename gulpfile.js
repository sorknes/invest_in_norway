// Include gulp
var gulp = require('gulp');

// PostCSS
var postcss = require('gulp-postcss');

// Autoprefix vendor
var autoprefixer = require('gulp-autoprefixer');

// Requires the gulp-sass plugin
var sass = require('gulp-sass');

// SVG
var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');
var path = require('path');

// Include browser-sync
var browserSync = require('browser-sync').create();

// Concatenates css and javascript files
var useref = require('gulp-useref');

// Minifying JavaScript files
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');

// Minify the concatenated CSS
var cssnano = require('gulp-cssnano');

// Optimizing Images
var imagemin = require('gulp-imagemin');

// Cache files
var cache = require('gulp-cache');

// Cleaning up
var del = require('del');

// Task sequence
var runSequence = require('run-sequence');

gulp.task('sass', function() {
    return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss
        .pipe(sass())
        .pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('watch', ['browserSync', 'sass'], function() {
    gulp.watch('app/scss/**/*.scss', ['sass']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload);
});

gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'app'
        },
    })
})

gulp.task('useref', function() {
    return gulp.src('app/*.html')
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        // Minifies only if it's a CSS file
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulp.dest('dist'))
});

gulp.task('images', function() {
    return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
        // Caching images that ran through imagemin
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
});

// gulp.task('svgstore', function () {
//     return gulp.src('app/images/svg/*.svg')
//         .pipe(svgmin(function (file) {
//             var prefix = path.basename(file.relative, path.extname(file.relative));
//             return {
//                 plugins: [{
//                     cleanupIDs: {
//                         prefix: prefix + '-',
//                         minify: true
//                     }
//                 }]
//             }
//         }))
//         .pipe(svgstore())
//         .pipe(gulp.dest('dist/images'));
// });

gulp.task('fonts', function() {
    return gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'))
})

gulp.task('clean:dist', function() {
    return del.sync('dist');
})

gulp.task('build', function(callback) {
    runSequence('clean:dist', ['sass', 'useref', 'images', 'fonts'],
        callback
    )
})

gulp.task('default', function(callback) {
    runSequence(['sass', 'browserSync', 'watch'],
        callback
    )
})
