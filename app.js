"use strict"
var http = require('http')
var fs = require('fs')

process.chdir(__dirname)

function makeIndex() {
   var index = fs.readFileSync('index.html').toString()
      .replace("<link href='lib.css' rel='stylesheet'>", '<style>' + fs.readFileSync('lib.css').toString() + '</style>')
      .replace("<script src='lib.js'></script>", '<script>' + fs.readFileSync('lib.js').toString() + '</script>')
      .replace("<script src='wheredat.js'></script>", '<script>' + fs.readFileSync('wheredat.js').toString() + '</script>')
   return new Buffer(index)
}

var index = makeIndex()
var example = fs.readFileSync('example.html')

var icons = {
   '/img/marker.png': fs.readFileSync('img/marker.png'),
   '/img/marker-shadow.png': fs.readFileSync('img/marker-shadow.png'),
   '/img/popup-close.png': fs.readFileSync('img/popup-close.png'),
   '/img/zoom-in.png': fs.readFileSync('img/zoom-in.png'),
   '/img/zoom-out.png': fs.readFileSync('img/zoom-out.png')
}

var iecss = fs.readFileSync('lib-ie.css')

http.createServer(function (req, res) {
   if (req.url.match(/img/)) {
      res.writeHead(200, { 'Content-Type': 'image/png' })
      res.end(icons[req.url])
   }
   else if (req.url === '/lib-ie.css') {
      res.writeHead(200, { 'Content-Type': 'text/css' })
      res.end(iecss)
   }
   else {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      if (req.url === '/example.html')
         res.end(example)
      else
         res.end(index)
   }
}).listen(8002)
