## wheredat

A simple, easy to use, geocoding interface for web applications

![WhereDAT](https://raw.github.com/applieddataconsultants/wheredat/master/wheredat.png)

### What is it?

wheredat provides a geocoding and reverse geocoding interface (UI) through
[Bing](http://www.microsoft.com/maps/developers/web.aspx) maps.  You setup an
instance of the application and then embed it in an iframe on any other
applications that use it.  The client app passes an address or lonlat it needs
geocoded and wheredat builds a map showing the location found allowing the user
to move the point on the map to further refine the location.  All this
information is passed back to the client app so it can be used or stored there.

Another one of its goals is to be extremely light weight and quick to load.

### Setup

Built to be served with [node.js](http://nodejs.org/) although you can serve the files up statically as well.

For node do:

```sh
sudo npm install -g wheredat
wheredat [port]
```

### Request Params

- *lat* - latitude to reverse geocode
- *lon* - longitude to reverse geocode
- *address* - address to geocode
- *type* - map type
  - road
  - aerial
  - aerialwithlabels (default)
- *freeze* - lock map, no dragging, zooming, panning
  - true
  - false (default)
- *key* - Bing API key **(required)**

### Message Data

wheredat uses [window.postMessage](https://developer.mozilla.org/en/DOM/window.postMessage)
for cross domain communication.  However, this is not supported in IE &lt;= 7.
If your application support legacy browsers, wheredat also calls a
function named `wheredat_geocode` on the parent window.  However for this to
work you will need to proxy your wheredat server.

The data returned will look like:

```json
{
   address: "58TH Ave, Chippewa Falls, WI 54729",
   bounds: [ 44.922998091755495, -91.2955657722567, 44.93072352689685, -91.281018090048 ],
   lat: 44.92686080932617,
   lon: -91.28829193115234,
   _bingObj: /* Original Bing Geocode Object */
}
```

Or if unable to geocode:

```json
{
   error: 'wheredat was unable to geocode'
}
```

This data will return whenever a geocode or reverse geocode happens (e.g.
whenever the point is moved or when the map is initially loaded).

### Example

See [the demo page](http://wheredat.adc4gis.com/example.html) for an example of usage in a client side application.

## License

(The MIT License)

Copyright (c) 2012 Applied Data Consultants

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
