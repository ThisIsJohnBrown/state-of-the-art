var fs = require('fs');

var header;
var footer;
var cutsheet;
var content;

header = fs.readFileSync(__dirname + '/views/header.html');
footer = fs.readFileSync(__dirname + '/views/footer.html');
cutsheet = fs.readFileSync(__dirname + '/views/cutsheet.html');
content = '';

var nextCut = true;

fs.readdir(__dirname + '/views/sections', function(err, files) {
  for (var i = 0; i < files.length; i++) {
    var fileName = files[i].split('.html')[0];
    if (fileName.substr(0, 1) !== '-') {
      if (nextCut) {
        nextCut = false;
        content += cutsheet;
      }
      content += fs.readFileSync(__dirname + '/views/sections/' + fileName + '.html');
      if (fileName.substr(fileName.length - 1, 1) === '_') {
        nextCut = true;
      }
    }
  }
  fs.writeFile(__dirname + '/index.html', header + content + footer);
})