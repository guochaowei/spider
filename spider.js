var https = require('https'); // 用来处理https请求 , 和http一样用法
var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');

//北京大学的一个新闻网址 , 没有反爬虫措施
var url = "http://www.ss.pku.edu.cn/index.php/research/cooperationnews";

function startRequest(url) {
    http.get(url, function (res) {
        var html = '';
        var title = [];
        res.setEncoding('utf-8');
        //监听data事件，每次取一块数据
        res.on('data', function (chunk) {
            html += chunk;
        });
        res.on('end', function () {
            var $ = cheerio.load(html); //采用cheerio模块解析html
            var items = $('#info-list-ul>li>a');
            items.each(function (index, item) {
                var time = $(item).find('.time').html();
                var news = $(item).find('.info-title').text();
                var txt = time + '---' + news + '\n';
                //避免回调地狱 , 直接使用同步写入 Sync
                fs.appendFileSync('./data/news.txt',txt);
            });
        });
    })
}

startRequest(url);
