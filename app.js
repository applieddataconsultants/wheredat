"use strict"
var http = require('http')
var fs = require('fs')

function makeIndex() {
   var index = fs.readFileSync('index.html').toString()
      .replace('/*inc leaflet.css*/', fs.readFileSync('leaflet.css').toString())
      .replace('/*inc leaflet.js*/', fs.readFileSync('leaflet.js').toString())
      .replace('/*inc geocad.js*/', fs.readFileSync('geocad.js').toString())
   return new Buffer(index)
}

var index = makeIndex()
var test = fs.readFileSync('iframe_test.html')

var icons = {
   '/img/marker.png': fs.readFileSync('img/marker.png'),
   '/img/marker-shadow.png': fs.readFileSync('img/marker-shadow.png'),
   '/img/popup-close.png': fs.readFileSync('img/popup-close.png'),
   '/img/zoom-in.png': fs.readFileSync('img/zoom-in.png'),
   '/img/zoom-out.png': fs.readFileSync('img/zoom-out.png')
}

http.createServer(function (req, res) {
   if (req.url.match(/img/)) {
      res.writeHead(200, { 'Content-Type': 'image/png' })
      res.end(icons[req.url])
   }
   else {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      if (req.url === '/iframe_test')
         res.end(test)
      else
         res.end(index)
   }
}).listen(8000)
