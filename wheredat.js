!function _wheredat(){
   var BING_LOC_URL = 'https://dev.virtualearth.net/REST/v1/Locations/'
   var isMapQuest = false
   var isMapbox = false
   var isRetina = window.devicePixelRatio > 1

   function param (name) {
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]")
      var regexS = "[\\?&]" + name + "=([^&#]*)"
      var regex = new RegExp(regexS)
      var results = regex.exec(window.location.href)
      return results != null ? decodeURIComponent(results[1].replace( /\+/g, " ")) : ''
   }

   var service = param('service')
   var API_KEY = param('key')

   if (service === 'mapquest') {
      document.write('<script src="'+location.protocol+'//www.mapquestapi.com/sdk/leaflet/v2.s/mq-map.js?key='+API_KEY+'"><\/script>')
      document.write('<script src="'+location.protocol+'//www.mapquestapi.com/sdk/leaflet/v2.s/mq-geocoding.js?key='+API_KEY+'"><\/script>')

      isMapQuest = true
   }

   if (service === 'mapbox') {
      document.write('<script src="'+location.protocol+'//api.mapbox.com/mapbox.js/v2.3.0/mapbox.js"><\/script>')
      isMapbox = true
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
         if (isMapQuest) {
            address = address.replace(new RegExp('#', 'g'), 'no.')

            if (!country || !city) {
               MQ.geocode().search(address)
                  .on('success', function(e) {
                     window._wheredat_res(e.result.best)
                  })
            }
            else {
               MQ.geocode().search({ country: country, street: address, city: city })
                  .on('success', function (e) {
                     window._wheredat_res(e.result.best)
                  })
            }
         }
         else if (isMapbox) {
            var geocoder = L.mapbox.geocoder('mapbox.places')
            geocoder.query(address, function (er, data) {
               window._wheredat_res(data.results)
            })
         }
         else {
            jsonp('?countryCode='+(country || 'US')+'&q='+address)
         }
      },
      reverseGeocode: function (lat, lng) {
         if (isMapQuest) {
            MQ.geocode().reverse({ lat: lat, lng: lng })
               .on('success', function (e) {
                  window._wheredat_res(e.result.best)
               })
         }
         else if (isMapbox) {
            var geocoder = L.mapbox.geocoder('mapbox.places')
            geocoder.reverseQuery({ lat: lat, lon: lng }, function (er, data) {
               window._wheredat_res(data)
            })
         }
         else {
            jsonp(lat + ',' + lng)
         }
      }
   }

   var Icon = L.icon({
      iconUrl: isRetina ? 'img/marker-2x.png' : '/img/marker.png',
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
         if (isMapQuest) {
            data = {
               lat: lastLatLng.lat || loc.latlng.lat,
               lon: lastLatLng.lng || loc.latlng.lng,
               geocodeLat: loc.latlng.lat,
               geocodeLon: loc.latlng.lng,
               address: buildAddressStr(loc),
               bounds: [loc.latlng.lat, loc.latlng.lng, loc.latlng.lat, loc.latlng.lng],
               _mapquestObj: loc
            }
         }
         else if (isMapbox) {
            data = {
               lat: lastLatLng.lat || loc.center[1],
               lon: lastLatLng.lng || loc.center[0],
               geocodeLat: loc.center[1],
               geocodeLon: loc.center[0],
               address: loc.place_name,
               bounds: loc.bbox,
               _mapboxObj: loc
            }
         }
         else {
            data = {
               lat: lastLatLng.lat || loc.point.coordinates[0],
               lon: lastLatLng.lng || loc.point.coordinates[1],
               geocodeLat: loc.point.coordinates[0],
               geocodeLon: loc.point.coordinates[1],
               address: loc.name,
               bounds: loc.bbox,
               _bingObj: loc
            }
         }
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
         var darkLayer = MQ.darkLayer()
         var lightLayer = MQ.lightLayer()

         switch (type) {
            case 'hybrid':
            case 'satellite':
               layer = satelliteLayer
               break

            case 'road':
               layer = mapLayer
               break

            case 'dark':
               layer = darkLayer

            case 'light':
               layer = lightLayer

            default:
               layer = satelliteLayer;
         }

         maxZoom = 17
         baseMaps = { "Road": mapLayer, "Satellite": satelliteLayer, "Dark": darkLayer, "Light": lightLayer }
      }
      else if (isMapbox) {
         var attr = '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
         var url = isRetina
            ? location.protocol + '//api.mapbox.com/v4/{REPLACE}/{z}/{x}/{y}@2x.jpg?access_token='+API_KEY
            : location.protocol + '//api.mapbox.com/v4/{REPLACE}/{z}/{x}/{y}.jpg?access_token='+API_KEY

         L.mapbox.accessToken = API_KEY
         var mapboxStreet = L.tileLayer(url.replace('{REPLACE}', 'mapbox.streets'), { attribution: attr })
         var mapboxGrey = L.tileLayer(url.replace('{REPLACE}', 'mapbox.light'), { attribution: attr })
         var mapboxSat = L.tileLayer(url.replace('{REPLACE}', 'mapbox.streets-satellite'), { attribution: attr })

         switch (type) {
            case 'street'    : layer = mapboxStreet; break
            case 'grey'      : layer = mapboxGrey; break
            case 'satellite' : layer = mapboxSat; break
            default          : layer = mapboxSat;
         }

         maxZoom = 17
         baseMaps = { Street: mapboxStreet, Greyscale: mapboxGrey, Aerial: mapboxSat }
      }
      else {
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
         var loc = !isMapQuest && !isMapbox ? data.resourceSets[0].resources[0] : data
         if (!loc) return sendMessage(null)

         if (isMapQuest) {
            if (!marker) { createMarker([loc.latlng.lat, loc.latlng.lng]) }
            addressEl.innerHTML = loc.adminArea5 !== "" && loc.adminArea3 !== "" ? buildAddressStr(loc) : ""
         }
         else if (isMapbox) {
            var feature = loc.features[0]
            if (!marker) { createMarker(feature.center.reverse()) }
            addressEl.innerHTML = feature.place_name
            return sendMessage(feature)
         }
         else {
            if (!marker) { createMarker(loc.point.coordinates) }
            addressEl.innerHTML = loc.name
         }

         sendMessage(loc)
      } catch (e) {}
   }

   function buildAddressStr (data) {
      return data.street !== "" ? data.street + ", " + data.adminArea5 + ", " + data.adminArea3 + " " + data.postalCode
                                : data.adminArea5 + ", " + data.adminArea3 + " " + data.postalCode
   }
}()
