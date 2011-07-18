var App = window.App || {};

App.Gmap = function(el, options) {

  var self = this;

  this.el = el;
  _.extend(this, options);

  this.map = new google.maps.Map(document.getElementById(el), this.mapOptions);

  this.getBrowserLocation(function(location, markerContent) { 
    self.map.setCenter(location);
    self.dropMarker(location, markerContent);
  }); 
  
};


App.Gmap.prototype = {
  mapOptions: {
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }, 

  // markers 
  FBFriendsMarkers: [],
  userMarker: {},

  // gmaps native utils
  geoCoder:  new google.maps.Geocoder(),

  // user initial location
  initialLocation: {},

  // get user's location from browser  
  getBrowserLocation: function (_fn) {
    var self = this;
    // Try W3C Geolocation (Preferred)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        self.initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        _fn(self.initialLocation, 'This is Home');

      }, function() {
        alert("Nana-naboo-boo... Your browser doesn't support geolocation. We've placed you in Siberia.");
        self.initialLocation = new google.maps.LatLng(60, 105);
        _fn(self.initialLocation, "We're not in Kansas anymore");
      });
    }
  },

  // drop a marker on the map
  // `position` => google.maps.LatLng
  // `markerContent` => string
  dropMarker: function (position, markerContent) {
    var self = this;

    var marker = new google.maps.Marker({
      position:   position,
      map:        this.map,
      animation:  google.maps.Animation.DROP
    });

    var infowindow = new google.maps.InfoWindow({ content: markerContent });

    // Map marker on click event
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(self.map, marker);
    });

  // function dropMarker(latitude, longitude, marker_url, infoWindowContent, openInfoWindow) {
  //     var anim = (openInfoWindow == true) ? google.maps.Animation.DROP : null;
  //     var marker = new google.maps.Marker({
  //       position: new google.maps.LatLng(latitude, longitude),
  //       map: map,
  //       animation: anim,
  //       icon: new google.maps.MarkerImage(
  //         marker_url,
  //         new google.maps.Size(8, 18),
  //         new google.maps.Point(0, 0),
  //         new google.maps.Point(0, 18)
  //       ),
  //       shadow: new google.maps.MarkerImage(
  //         urls.MarkerShadow,
  //         new google.maps.Size(17, 12),
  //         new google.maps.Point(0, 0),
  //         new google.maps.Point(0, 12)
  //       )
  //     });
  //     var iw = new WorldViewInfoWindow({
  //       map: map,
  //       latlng: marker.getPosition(),
  //       content: infoWindowContent
  //     });
  //     google.maps.event.addListener(marker, 'click', function () {
  //       if (iw.isOpen()) {
  //         iw.close();
  //       } else {
  //         iw.open();
  //       }
  //     });
  //     if (openInfoWindow) {
  //       setTimeout(function () {
  //         iw.open();
  //         setTimeout(function () { iw.close(); }, INFO_WINDOW_DISPLAY_TIME);
  //       }, 350); // Caters for drop animation time
  //     }
  //     markers.push(marker);
  //     infoWindows.push(iw);
  //     // If we're opening the info window, it isn't an initial drop of markers,
  //     // so we want to clean up any excess old ones.
  //     if (openInfoWindow) {
  //       cleanup();
  //     }
  // }
  },

  // =========== facebook friends ============
  addFBFriendsToMap: function () {

    var self        = this
      , utils       = this.utils
      , marker      = {}
      , infowindow  = {}
      , FBFriends   = App.Facebook.FBFriends
      , i = 0
      , y = 0;


    _.each(FBFriends, function(friend){
      if (friend.location) {
        // have to use a timeout so that we don't run 
        // into query limit fail
        setTimeout(function() {
          // TODO
          // have to store the locations
          self.geoCoder.geocode({ address: friend.location.name }, function(results, status) {

            if (status === google.maps.GeocoderStatus.OK) {
              var formatted_address = results[0].formatted_address
                , position          = results[0].geometry.location
                , location_name     = utils.getParsedLocation(formatted_address);

              if (self.FBFriendsMarkers[location_name]) {
                console.log('Appending to friends.markers: ', friend);
                self.FBFriendsMarkers[location_name].friends.push(friend);

              } else {
                console.log('setting marker on ' + location_name, ++y);

                // should only drop a marker on a location 
                // that doesn't currently have a marker
                self.dropMarker(position, location_name);

                // self.FBFriendsMarkers.push( friend_location );
                self.FBFriendsMarkers[location_name] = {
                  position: position,
                  friends: [friend]
                };
              }

            } else {
              console.log('fail: ', status);  
            }
          });
          
        }, i * 1000); 
        i++;
      } 
    });
  },

  utils: {
    // larger grouping of friends adresses  
    // grouping by state/region  
    getParsedLocation: function (addr) {
      var match = false,
        location  = addr,
        country   = '';

      if (match = addr.match(/\s([A-Z]{2})/)) {       // Boston, MA, USA
        location = match[1];
      } else if (addr.split(',').length === 2) {      // Rome, Italy
        location = addr.split(',')[0];
      } else if (match = addr.match(/-\s(\w*),/)) {   // Vitoria - ES, Brazil
        location = match[1];
      } else if (match = addr.match(/\s([\w\s*]),/)){ // Westminster, London, UK 
        location = match[1];
      }

      if (country = addr.match(/, (\w*)$/)) { country = '_' + country[1]; }

      location += country;
      console.log('PARSED: ' +  addr + ' to : ', location);

      return location.toLowerCase();
    }
  }


};
