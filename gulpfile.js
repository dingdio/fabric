// ==========================================================================
// Gulp build script
// ==========================================================================
/*global require, __dirname*/

var fs 			= require("fs"),
	path 		= require("path"),
	gulp 		= require("gulp"),
	gutil 		= require("gulp-util"),
	concat 		= require("gulp-concat"),
	uglify 		= require("gulp-uglify"),
	less 		= require("gulp-less"),
	minifyCss 	= require("gulp-minify-css"),
	runSequence = require("run-sequence"),
	prefix 		= require("gulp-autoprefixer"),
	svgstore 	= require("gulp-svgstore"),
	svgmin 		= require("gulp-svgmin");

var projectPath = __dirname;
var paths = {
    project: 		projectPath,

    // Watch paths
    watchless: 		path.join(projectPath, "assets/less/**/*"),
    watchjs: 		path.join(projectPath, "assets/js/**/*"),

    // SVG Icons
   	svg: 			path.join(projectPath, "lib/icomoon/SVG/*.svg"),

    // Output paths
    js:  			path.join(projectPath, "dist/js/"),
    css:  			path.join(projectPath, "dist/css/"),
    icons:  		path.join(projectPath, "dist/svg/")
},

// Task names
taskNames = {    
    lessBuild: 	"less-",
    jsBuild: 	"js-",
    iconBuild: 	"icon-build",
},
// Task arrays
lessBuildTasks 	= [],
jsBuildTasks 	= [],

// Fetch bundles from JSON
bundles = loadJSON(path.join(paths.project, "bundles.json"));

// Load json
function loadJSON(path) {
    return JSON.parse(fs.readFileSync(path));
}

// Process JS 
for (var key in bundles.js) {
	(function(key) {
	    var taskName = taskNames.jsBuild + key;
	    jsBuildTasks.push(taskName);

	    gulp.task(taskName, function () {
	        return gulp
	        	.src(bundles.js[key])
				.pipe(concat(key))
	            .pipe(uglify())
	            .pipe(gulp.dest(paths.js));
	    });
	})(key);
}

// Process CSS
for (var key in bundles.less) {
    (function (key) {		
	    var taskName = taskNames.lessBuild + key;
	    lessBuildTasks.push(taskName);

	    gulp.task(taskName, function () {
			return gulp
				.src(bundles.less[key])
				.pipe(less())
				.on("error", gutil.log)
				.pipe(concat(key))
				.pipe(prefix(["last 2 versions", "> 1%", "ie 9"], { cascade: true }))
				.pipe(minifyCss())
				.pipe(gulp.dest(paths.css));
		});
	})(key);
}

// Process Icons
gulp.task(taskNames.iconBuild, function () {
	gulp
		.src(paths.svg)
		.pipe(svgmin())
        .pipe(svgstore({ 
        	prefix: 	"icon-",
        	fileName: 	"sprite.svg"
        }))
	    .pipe(gulp.dest(paths.icons));
});

// Default gulp task
gulp.task("default", function(){
	runSequence(jsBuildTasks.concat(lessBuildTasks, taskNames.iconBuild, "watch"));
});

// Watch for file changes
gulp.task("watch", function () {
    gulp.watch(paths.watchless, lessBuildTasks);
    gulp.watch(paths.watchjs, jsBuildTasks);
    gulp.watch(paths.watchicons, taskNames.iconBuild);
});