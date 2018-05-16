var request = require('request');
var cheerio = require('cheerio');
var username = "yangqiang"
var _password = "********"
var login_page = "http://192.168.2.*:8080/rdms/authorize.do?method=login"
var search_bug_page = "http://192.168.2.*:8080/rdms/common/search/searchAction!search.action"
var search_bug_result_page = "http://192.168.2.*:8080/rdms/qm/bug/bugAction.do?action=getBugDetail&id="
var _id = ''
//设置请求头，模拟浏览器
var headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'
}

function start(_bug, callback) {
    //console.log(" start login... ")
    //设置访问参数,并封装成一个json对象，里面包含URL，form表单，访问方式，请求头
    //更多的参数设置参考http://www.jb51.net/article/58465.htm 。补充options  还可以设置代理（目前还不知道代理有什么用）proxy: Proxy.GetProxy(),
    var login_options = {
        url: login_page,
        form: {
            "username": username,
            "password": _password
        },
        method: 'POST',
        headers: headers,
        //sendImmediately: false  //默认为真，发送一个基本的认证header。设为false之后，收到401会重试（服务器的401响应必须包含WWW-Authenticate指定认证方法）。
    };
    //设置cookie 默认情况cookie禁止，这里使用全局cookie
    //request 原文参考https://github.com/request/request 中文参考http://www.open-open.com/lib/view/open1435301679966.html
    var _request = request.defaults({ jar: true });
    _request(
        login_options
        , function (error, response, body) {
            if (error) {
                console.log("longin error,please check user &password");
                return console.error(error);
            }
            else {
                search_options = {
                    url: search_bug_page,
                    form: {
                        "queryString": _bug  //这里的queryString必须和要访问的网页form表单参数对应
                    },
                    method: 'POST',
                    headers: headers
                }
                _request(search_options,
                    function (error, response, body) {
                        if (error) {
                            console.log('get id query error');
                            return error;
                        }
                        //解析搜索bug返回的页面,这里只解析body
                        //cheerio 原文参考https://www.npmjs.com/package/cheerio 中文参考https://cnodejs.org/topic/5203a71844e76d216a727d2e
                        var $ = cheerio.load(body);
                        $('a').each(function () {
                            var $table_node = $(this);
                            var href = $table_node.attr('onclick');
                            var id = href.trim().substring(66, href.length - 13);
                            _id = id;
                        });
                        var url = search_bug_result_page + _id + "&popup=true".trim();
                        callback(url.toString())
                    });
            }
        });
}

function get_data(_bug, callback) {
    var login_options = {
        url: login_page,
        form: {
            "username": username,
            "password": _password
        },
        method: 'POST',
        headers: headers,
        //sendImmediately: false  //默认为真，发送一个基本的认证header。设为false之后，收到401会重试（服务器的401响应必须包含WWW-Authenticate指定认证方法）。
    };
    //设置cookie 默认情况cookie禁止
    var _request = request.defaults({ jar: true });
    _request(
        login_options
        , function (error, response, body) {
            if (error) {
                console.log("longin error,please check user &password");
                return console.error(error);
            }
            else {
                search_options = {
                    url: search_bug_page,
                    form: {
                        "queryString": _bug
                    },
                    method: 'POST',
                    headers: headers
                }
                _request(search_options,
                    function (error, response, body) {
                        if (error) {
                            console.log('get id query error');
                            return error;
                        }
                        //解析搜索bug返回的页面
                        var $ = cheerio.load(body);
                        $('a').each(function () {
                            var $table_node = $(this);
                            var href = $table_node.attr('onclick');
                            var id = href.trim().substring(66, href.length - 13);
                            _id = id;
                        });
                        var url = search_bug_result_page + _id + "&popup=true".trim();
                        //callback(url.toString())
                        var search_bug_result_options = {
                            url: url,
                            method: 'GET',
                            headers: headers,
                        }
                        _request(
                            search_bug_result_options,
                            function (_error, _response, _body) {
                                if (_error) {
                                    console.log("get_ bug content error");
                                    return console.error(_error);
                                }
                                var results_data = {};
                                var $ = cheerio.load(_body);
                                var td = $('td');
                                td.each(function (td) {
                                    var node_td = $(this);
                                    if (node_td.text() == '处理人') {
                                        var current_handler = node_td.next().find('a').text().trim();
                                        results_data.current_handler = current_handler;
                                        callback(results_data);
                                    }
                                });
                            });
                    });
            }
        });
}
exports.start = start;
exports.get_data = get_data;