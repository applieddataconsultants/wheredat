#!/usr/bin/env node

var http = require('http')
var fs = require('fs')
var port = process.argv[2] || 3000

process.chdir(__dirname)

function makeIndex() {
   var index = fs.readFileSync('index.html').toString()
      .replace("<link href='leaflet/leaflet.css' rel='stylesheet'>", '<style>' + fs.readFileSync('./leaflet/leaflet.css').toString() + '</style>')
      .replace("<script src='leaflet/leaflet.js'></script>", '<script>' + fs.readFileSync('./leaflet/leaflet.js').toString() + '</script>')
      .replace("<script src='wheredat.js'></script>", '<script>' + fs.readFileSync('wheredat.js').toString() + '</script>')
   return new Buffer(index)
}

var index = makeIndex()
var example = fs.readFileSync('example.html')
var mapquestExample = fs.readFileSync('mapquest-example.html')
var mapboxExample = fs.readFileSync('mapbox-example.html')

var icons = {
   '/img/layers.png': fs.readFileSync('./leaflet/img/layers.png'),
   '/img/layers-2x.png': fs.readFileSync('./leaflet/img/layers-2x.png'),
   '/img/marker.png': fs.readFileSync('./leaflet/img/marker.png'),
   '/img/marker-2x.png': fs.readFileSync('./leaflet/img/marker-icon-2x.png'),
   '/img/marker-shadow.png': fs.readFileSync('./leaflet/img/marker-shadow.png'),
   '/img/popup-close.png': fs.readFileSync('./leaflet/img/popup-close.png'),
   '/img/zoom-in.png': fs.readFileSync('./leaflet/img/zoom-in.png'),
   '/img/zoom-out.png': fs.readFileSync('./leaflet/img/zoom-out.png')
}

var iecss = fs.readFileSync('./leaflet/leaflet-ie.css')

http.createServer(function (req, res) {
   if (req.url.match(/\/img\//)) {
      res.writeHead(200, { 'Content-Type': 'image/png' })
      res.end(icons[req.url])
   }
   else if (req.url === '/leaflet/leaflet-ie.css') {
      res.writeHead(200, { 'Content-Type': 'text/css' })
      res.end(iecss)
   }
   else {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      if (req.url === '/example.html')
         res.end(example)
      else if (req.url === '/mapquest-example.html')
         res.end(mapquestExample)
      else if (req.url === '/mapbox-example.html')
         res.end(mapboxExample)
      else
         res.end(index)
   }
}).listen(port)
