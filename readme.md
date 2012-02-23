## wheredat

Roll your own geocoding interface.

## What is it?

wheredat provides a geocoding and reverse geocoding interface (UI) through
Bing&reg; maps.  You setup an instance of the application and then embed it in
an iframe on any other applications that use it.  The client app passes an
address or lonlat it needs geocoded and wheredat builds a map showing the
location found allowing the user to move the point on the map to find to
further refine the location.  All this information is passed back to the client
app so it can be used or stored there.

Another one of its goals is to be extremely light weight and quick to load.

### Setup

Built to be served with [node.js](http://nodejs.org/) although you can serve the files up statically as well.

If usign node just run:

```
node app.js
```

### Request Params

- *lat* - latitude to reverse geocode
- *lon* - longitude to reverse geocode
- *address* - address to geocode
- *key* - Bing API key **(required)**

### Response

wheredat uses [window.postMessage](https://developer.mozilla.org/en/DOM/window.postMessage)
for cross domain communication.  However, this is not supported in IE &lt;= 7.
If your application needs to support legacy browser, wheredat also calls a
function named `wheredat_geocode` on the parent window.  However for this to
work you will need to proxy your wheredat server.

The data returned will look like:

```json
{
   lat: 16.365768432617188,
   lon: -88.48485565185547,
   address: "Monkey River Town, Belize"
   _bingObj: /* original object from Bing */
}
```

This data will return whenever a geocode or reverse geocode happens (e.g.
whenever the point is moved or when the map is initially loaded)

## License

(The MIT License)

Copyright (c) 2011 Applied Data Consultants

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
