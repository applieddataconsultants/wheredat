!function _wheredat(){
   var BING_LOC_URL = 'https://dev.virtualearth.net/REST/v1/Locations/'

   function param (name) {
      name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]")
      var regexS = "[\\?&]" + name + "=([^&#]*)"
      var regex = new RegExp(regexS)
      var results = regex.exec(window.location.href)
      return results != null ? decodeURIComponent(results[1].replace( /\+/g, " ")) : ''
   }

   var BING_KEY = param('key')

   var G = {
      geocode: function (address) { jsonp('?countryCode=US&q='+address) },
      reverseGeocode: function (lat, lng) { jsonp(lat + ',' + lng) }
   }

   var Icon = L.Icon.extend({
      iconUrl: '/img/marker.png',
      shadowUrl: '/img/marker-shadow.png',
      iconSize: new L.Point(25, 41),
      shadowSize: new L.Point(41, 41),
      iconAnchor: new L.Point(13, 41),
      popupAnchor: new L.Point(0, -33)
   })

   var lat = Number(param('lat'))
   var lon = Number(param('lon'))
   var address = param('address')
   var type = param('type')
   var marker = null
   var addressEl = document.getElementById('address')

   var tsjson = +new Date()
   function jsonp (url) {
      var script = document.createElement('script')
      var q = /\?/.test(url) ? '&' : '?'
      script.src = BING_LOC_URL + url + q + 'key=' + BING_KEY + '&jsonp=_wheredat_res&_=' + (tsjson++)
      document.body.appendChild(script)
   }

   var bing = new L.TileLayer.Bing(BING_KEY, 'aerial')

   var map = new L.Map('map', {
      minZoom: 0,
      maxZoom: 21,
      layers: [bing]
   })

   var sendMessage = function (loc) {
      if (!parent) return
      var data = {
         lat: loc.point.coordinates[0],
         lon: loc.point.coordinates[1],
         address: loc.name,
         _bingObj: loc
      }
      if (parent.postMessage)
         parent.postMessage(data,'*')
      if (parent.geocad_geocode) {
         parent.wheredat_geocode(data)
      }
   }

   function createMarker (coords) {
      var markerLocation = new L.LatLng(coords[0], coords[1])
      marker = new L.Marker(markerLocation, { draggable: true, icon: new Icon() })
      marker.on('dragend', handleDrag)
      map.addLayer(marker)
      map.setView(markerLocation, 18)
   }

   function handleDrag (e) {
      var latlng = e.target.getLatLng()
      G.reverseGeocode(latlng.lat,latlng.lng)
   }

   if (address)
      G.geocode(address)
   else {
      G.reverseGeocode(lat,lon)
      createMarker([lat,lon])
   }

   window._wheredat_res = function (data) {
      try {
         var loc = data.resourceSets[0].resources[0]
         if (!marker) { createMarker(loc.point.coordinates) }
         addressEl.innerHTML = loc.name
         sendMessage(loc)
      } catch (e) { /* */ }
   }
}()
