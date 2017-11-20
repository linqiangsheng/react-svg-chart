//加载插件
var gulp = require('gulp'),
    less = require('gulp-less'),//le编译ss
    minifycss = require('gulp-minify-css'),//压缩css
    concat = require('gulp-concat'),//合并js
    uglify = require('gulp-uglify'),//压缩js
    rename = require('gulp-rename'),//改输出别名
    babel = require('gulp-babel'),
    del = require('del');//删除文件

//压缩css
//gulp.task('minifycss', function() {
//    return gulp.src('css/*.css')      //压缩的文件
//        .pipe(minifycss())   //执行压缩
//        .pipe(rename({suffix: '.min'}))   //rename压缩后的文件名
//        .pipe(gulp.dest('css'));   //输出文件夹
//});
//编译less并压缩css
gulp.task('lessminifycss', function() {
    return gulp.src('src/*.less')      //压缩的文件
        .pipe(less())    //编译
        // .pipe(rename({suffix: '.min'}))   //rename压缩后的文件名
        // .pipe(minifycss())   //执行压缩
        .pipe(gulp.dest('public'));   //输出文件夹
});
//压缩js
gulp.task('minifyjs', function() {
    return gulp.src('src/*.js')//压缩文件
        //.pipe(concat('main.js'))    //合并所有js到main.js
        //.pipe(gulp.dest('js'))    //输出main.js到文件夹
        // .pipe(rename({suffix:'.min'}))//起别名保存
        // .pipe(uglify())//压缩
        .pipe(babel())
        .pipe(gulp.dest('public'));//输出文件
});
//执行压缩前，先删除文件夹里的内容
//gulp.task('clean', function(cb) {
//    del(['css', 'js'], cb)
//});
//监听任务 运行语句 gulp watch
gulp.task('watch',function(){
    gulp.watch('src/*.js',['minifyjs']);//监听js变化
    gulp.watch('src/*.less',['lessminifycss']);//监听css变化
})

//默认命令，在cmd中输入gulp后，执行的就是这个命令
gulp.task('default',[], function() {//[]中可以定义先执行的模块
    gulp.start('lessminifycss', 'minifyjs');//执行相应模块
});