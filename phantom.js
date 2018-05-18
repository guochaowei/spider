//phantom for node
//使用phantom + cheerio 解析
const phantom = require('phantom');
var cheerio = require('cheerio');
 
(async function() {
  const instance = await phantom.create();
  const page = await instance.createPage();
  await page.on('onResourceRequested', function(requestData) {
    console.info('Requesting', requestData.url);
  });
 
  const status = await page.open('https://tou.winfae.com/about/siteNotice.html');
  const content = await page.property('content');
  var $ = cheerio.load(content);
  console.log($("ul").html());
  instance.exit();
})();