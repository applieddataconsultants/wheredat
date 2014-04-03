!function _wheredat(){
   var BING_LOC_URL = 'https://dev.virtualearth.net/REST/v1/Locations/'
   var isMapQuest = false

   function param (name) {
      name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]")
      var regexS = "[\\?&]" + name + "=([^&#]*)"
      var regex = new RegExp(regexS)
      var results = regex.exec(window.location.href)
      return results != null ? decodeURIComponent(results[1].replace( /\+/g, " ")) : ''
   }

   var service = param('service')
   var API_KEY = param('key')

   if (service === "mapquest") {
      document.write('<script src="'+location.protocol+'//www.mapquestapi.com/sdk/leaflet/v1.0/mq-map.js?key='+ API_KEY +'"><\/script>');
      document.write('<script src="'+location.protocol+'//www.mapquestapi.com/sdk/leaflet/v1.0/mq-geocoding.js?key='+ API_KEY +'"><\/script>')

      isMapQuest = true
   } else {
      isMapQuest = false
   }

   var tsjson = +new Date()
   function jsonp (url) {
      var script = document.createElement('script')
      var q = /\?/.test(url) ? '&' : '?'
      script.src = BING_LOC_URL + url + q + 'key=' + API_KEY + '&jsonp=_wheredat_res&_=' + (tsjson++)
      document.body.appendChild(script)
   }

   var G = {
      geocode: function (address, country, city) {
         if (!isMapQuest) jsonp('?countryCode='+(country || 'US')+'&q='+address)
         else {
            if (!country || !city) MQ.geocode().search(address).on('success', function(e) { window._wheredat_res(e.result.best) })
            else MQ.geocode().search({ country: country, street: address, city: city }).on('success', function (e) { window._wheredat_res(e.result.best) })
         }
      },
      reverseGeocode: function (lat, lng) {
         if (!isMapQuest) jsonp(lat + ',' + lng)
         else MQ.geocode().reverse({lat:lat,lng:lng}).on('success', function (e) { window._wheredat_res(e.result.best) })
      }
   }

   var Icon = L.icon({
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
   var country = param('country')
   var city = param('city')

   var freeze = param('freeze') === 'true' ? true : false
   var type = param('type')
   var layerSwitcher = param('layerSwitcher') === 'true' ? true : false
   var debug = param('debug') === 'true' ? true : false
   var marker = null
   var addressEl = null

   var layer = null
   var maxZoom = null

   var sameDomain = null
   var map = null
   var lastLatLng = {}
   var baseMaps = null

   var sendMessage = function (loc) {
      if (!parent) return

      var data
      if (loc) {
         data = {
            lat: lastLatLng.lat || (!isMapQuest ? loc.point.coordinates[0] : loc.latlng.lat),
            lon: lastLatLng.lng || (!isMapQuest ? loc.point.coordinates[1] : loc.latlng.lng),
            geocodeLat: !isMapQuest ? loc.point.coordinates[0] : loc.latlng.lat,
            geocodeLon: !isMapQuest ? loc.point.coordinates[1] : loc.latlng.lng,
            address: !isMapQuest ? loc.name : buildAddressStr(loc),
            bounds: !isMapQuest ? loc.bbox : [loc.latlng.lat, loc.latlng.lng, loc.latlng.lat, loc.latlng.lng]
         }
         !isMapQuest ? data._bingObj = loc : data._mapquestObj = loc
      } else
         data = { error: 'wheredat was unable to geocode' }

      if (debug) console.log(data)

      if (parent.postMessage) parent.postMessage(JSON.stringify(data),'*')

      if (sameDomain == null) sameDomain = !!(parent.wheredat_geocode)
      if (sameDomain) parent.wheredat_geocode(JSON.stringify(data))
   }

   function createMarker (coords) {
      var markerLocation = new L.LatLng(coords[0], coords[1])
      marker = new L.Marker(markerLocation, { draggable: freeze ? false : true, icon: Icon })
      if (!freeze) marker.on('dragend', handleDrag)
      map.addLayer(marker)
      map.setView(markerLocation, maxZoom)
   }

   function handleDrag (e) {
      lastLatLng = e.target.getLatLng()
      G.reverseGeocode(lastLatLng.lat,lastLatLng.lng)
   }

   alReady(function() {
      if (isMapQuest) {
         var mapLayer = MQ.mapLayer()
         var hybridLayer = MQ.hybridLayer()
         var satelliteLayer = MQ.satelliteLayer()

         switch (type) {
            case 'hybrid'    : layer = hybridLayer; break
            case 'satellite' : layer = satelliteLayer; break
            case 'road'      : layer = mapLayer; break
            default          : layer = hybridLayer;
         }

         maxZoom = 17
         baseMaps = { "Road": mapLayer, "Hybrid": hybridLayer, "Satellite": satelliteLayer }
      } else {
         var bingRoad = new L.BingLayer(API_KEY, { type: 'road' })
         var bingAerial = new L.BingLayer(API_KEY, { type: 'aerial' })
         var bingAerialLabels = new L.BingLayer(API_KEY, { type: 'aerialwithlabels' })

         switch (type) {
            case 'road'             : layer = bingRoad; break
            case 'aerial'           : layer = bingAerial; break
            case 'aerialwithlabels' : layer = bingAerialLabels; break
            default                 : layer = bingAerialLabels
         }

         maxZoom = 18
         baseMaps = { "Road": bingRoad, "Hybrid": bingAerialLabels, "Satellite": bingAerial }
      }

      addressEl = document.getElementById('address')
      var opt = { minZoom: 0, maxZoom: maxZoom, layers: [layer] }
      if (freeze) {
         opt.touchZoom = false
         opt.scrollWheelZoom = false
         opt.doubleClickZoom = false
         opt.dragging = false
         opt.zoomControl = false
      }
      map = new L.Map('map', opt)
      if (layerSwitcher) map.addControl(L.control.layers(baseMaps))

      if (address || city || country) G.geocode(address, country, city)
      else {
         G.reverseGeocode(lat,lon)
         createMarker([lat,lon])
      }
   })

   window._wheredat_res = function (data) {
      try {
         var loc = !isMapQuest ? data.resourceSets[0].resources[0] : data
         if (!loc) return sendMessage(null)

         if (!isMapQuest) {
            if (!marker) { createMarker(loc.point.coordinates) }
            addressEl.innerHTML = loc.name
         } else {
            if (!marker) { createMarker([loc.latlng.lat, loc.latlng.lng]) }
            addressEl.innerHTML = loc.adminArea5 !== "" && loc.adminArea3 !== "" ? buildAddressStr(loc) : ""
         }

         sendMessage(loc)
      } catch (e) {}
   }

   function buildAddressStr (data) {
      return data.street !== ""
                           ? data.street + ", " + data.adminArea5 + ", " + data.adminArea3 + " " + data.postalCode
                           : data.adminArea5 + ", " + data.adminArea3 + " " + data.postalCode
   }
}()
