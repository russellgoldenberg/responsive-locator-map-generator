var gulp = require('gulp');
var replace = require('gulp-replace-task');
var fileinclude = require('gulp-file-include');
var browserSync = require('browser-sync');

// Default task to be run with `gulp`
gulp.task('default', function () {
    gulp.watch('src/map-style.css', ['replace-css']);
    gulp.watch(['src/responsive-map.js', '.tmp/map-style.css'], ['replace-js']);
    gulp.watch(['index.html', '*.css', '*.js'], ['browser-sync-reload']);
    gulp.start('browser-sync');
});

gulp.task('replace-css', function () {
	gulp.src('src/map-style.css')
		.pipe(replace({
			patterns: [
				{
					match: /\t/g,
					replacement: '\\t'
				}, {
					match: /\n/g,
					replacement: '\\n'
				}
			]
		}))
		.pipe(gulp.dest('.tmp'));
});

gulp.task('replace-js', function () {
	gulp.src('src/responsive-map.js')
		.pipe(fileinclude())
    	.pipe(gulp.dest('./'))
    	.pipe(browserSync.reload({ stream: true }));
});

// browser-sync task for starting the server.
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: './',
            index: 'index.html'
        },
        notify: false,
        ghostMode: false
    });
});

gulp.task('browser-sync-reload', function () {
    browserSync.reload();
});