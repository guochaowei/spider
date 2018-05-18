//尝试看哪个插件能下载渲染过的html文件

// jsdom 依赖于C++ 和 python , 麻烦 , 跳过
// var jsdom = require("node-jsdom");
// jsdom.env(
//   "https://tou.winfae.com/about/siteNotice.html",
//   function (errors, window) {
//     console.log(window);
//   }
// );


//phantomjs
//phantomjs 启动有步骤 , 需要进入phantom命令然后启动 , 弃之不用 , 试验 phantom的node版本
var page = require('webpage').create();
page.onConsoleMessage = function (msg) {
    console.log(msg);
};
page.open('https://tou.winfae.com/about/siteNotice.html', function (s) {
    page.includeJs("http://cdn.static.runoob.com/libs/jquery/1.10.2/jquery.min.js", function () {
        page.evaluate(function () {
            console.log($('.switch_container>ul').html())
        });
        phantom.exit()
    });
    // page.render('google_home.jpeg', {format: 'jpeg', quality: '100'});
    // phantom.exit()
});