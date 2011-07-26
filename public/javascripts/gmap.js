var App = window.App || {};

App.Gmap = function(el, options) {

  var self = this;
  this.el = el;
  _.extend(this, options);

  this.map = new google.maps.Map(document.getElementById(el), this.mapOptions);

  setTimeout(function() {
	self.attachEvents();
  
  },2000);
};


App.Gmap.prototype = {
  mapOptions: {
    minzoom: 2,
    zoom: 4,
    mapTypeControl: false,

    // mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    center: new google.maps.LatLng(37.0902400,-95.7128910)
  }, 

  icon: {
    shadow:   'images/pin_shadow.png',
    online:   'images/green_pin.png',
    likeToGo: 'images/orange_pin.png',
    user:     'images/blue_pin.png'
  },

  infoWindow: new google.maps.InfoWindow(),

  // client has set a topic
  // which became a chat room
  // using a `topic` as key
  // stores a makre and infowindow
  infoWindows: {},

  // markers 
  FBFriendsMarkers:     {},
  userMarkers:          [],

  // gmaps native utils
  geoCoder:  new google.maps.Geocoder(),

  // user initial location
  initialLocation: {},


  sendMessage: function ($chat_box, marker) {
    var self = this
      , $form = $chat_box.find('form')
      , chat_id = $chat_box[0].id
      , $messages = $chat_box.find('.messages')
      , $msg = $form.find('#user-message')
      , message = $msg.val()
      , user = App.Facebook.FBUser;

    var $content = $(
      '<li class="message">' +
        '<img  alt="Avatar for CrisO" src="'+ user.picture +'" class="avatar">' +
        '<div class="you-say">' + message  + '</div>' +
      '</li>');

    $messages.append($content);

    socket.emit('user message', chat_id,  user, message);

    $msg.val('').focus();
  },

  /**
   *
   */
  submitTopic: function (form, marker, topic_info_window) {
    var self = this
      , topic_title = form.topic.value
      , topic_data = {
            title:    topic_title
          , position: { Ka: form.Ka.value, La: form.La.value }
          , user:     App.Facebook.FBUser
    };

    // close the "set topic" info window 
    topic_info_window.close();
    topic_info_window = null;

    // each topic gets saved on the DB with an id
    // the chat-box now has id for the "room"
    socket.emit('new topic', topic_data, function(set, topic_id) {
      if (set) {
        var $content    = new App.ChatBox(topic_id, topic_data).el
          , info_window = new google.maps.InfoWindow();

        // marker on click
        google.maps.event.addListener(marker, 'click', function() {
          info_window.open(self.map, marker);
        });

		$content.data({marker: marker});

        // $content.find('form')
        // .submit(function(ev){
        //   ev.preventDefault();
        //   self.sendMessage($content, marker);
        // })
        // .end();

        self.infoWindows[topic_id] = {
          infoWindow: info_window,
          marker: marker
        };

        info_window.setContent($content[0]);
        info_window.open(self.map, marker);
      }
    });
  },

  // animate marker 
  bounceMarker: function (marker, time) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null);
    }, time);
  },

  // add events
  attachEvents: function () {
    var self      = this
      , $content  = [];

    // map.onclick
    // - should add a marker on that position
    // - should add marker to userMarkers array
    // - all users should see this
    google.maps.event.addListener(this.map, 'click', function(event) {
      self.addMarker(event.latLng, self.icon.likeToGo, function(marker){
        var topic_info_window = new google.maps.InfoWindow();

        $content = $(
          '<div class="topic-box">' +
            '<form class="topic-form">' +
              '<p>What would you like to do here?</p>' +
              '<input type="text" name=topic autofocus />' +
              '<input type="hidden" name="Ka" value="'+ event.latLng.lat()  +'" />' +
              '<input type="hidden" name="La" value="'+  event.latLng.lng() +'" />' +
            '</form>' +
          '</div>')
        .find('form')
        .submit(function(ev) {
          ev.preventDefault();
          self.submitTopic(this, marker, topic_info_window);
        })
        .end();

        topic_info_window.setContent($content[0]);
        topic_info_window.open(self.map, marker);

        // on closeclick of the topic_info
        // we'll remove the marker, since the user hasn't
        // set a topic
        google.maps.event.addListener(topic_info_window, 'closeclick', function() {
          marker.setMap(null);
        });

        self.userMarkers.push(marker);

        //
        // socket.emit('add marker', {
        //   user: App.Facebook.FBUser,
        //   position: event.latLng
        // });

      });
    });


	$('.chat-box form').live('submit', function(ev) {
		ev.preventDefault();
		var $form = $(this).parents('.chat-box').first();
		self.sendMessage($form, $form.data('marker'));
	});

  },

  // get user's location from browser  
  getBrowserLocation: function (_fn) {

    // Testing code START
    var test_location;
    switch (window.location.hash) {
      case '#userB':
        // florida
        test_location = {
          Ka: 25.790654,
          La: -80.1300455
        };
      break;

        // california
      case '#userC':
        test_location = {
          La: -118.39951940000003,
          Ka: 33.8622366
        };
      break;

      default:
        test_location = null;
      break;
    }

    if (test_location) {
      this.initialLocation = new google.maps.LatLng(test_location.Ka, test_location.La);
      _fn(this.initialLocation, 'This is Home');
      console.log('setting <userB> in florida');
      return;
    }
    // Testing code END

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
  dropMarker: function (user, markerContent, iconImg, location) {
    var self = this;

    var marker = new google.maps.Marker({
      position:   new google.maps.LatLng(user.position.Ka, user.position.La),
      map:        this.map,
      animation:  google.maps.Animation.DROP,
      icon: new google.maps.MarkerImage(
        iconImg,
        new google.maps.Size(8, 18),
        new google.maps.Point(0, 0),
        new google.maps.Point(0, 18)
      ),
      shadow: new google.maps.MarkerImage(
        this.icon.shadow,
        new google.maps.Size(17, 12),
        new google.maps.Point(0, 0),
        new google.maps.Point(0, 12)
      )
    });

    var infowindow = new google.maps.InfoWindow({ content: markerContent });

    // Map marker on click event
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(self.map, marker);
    });

    this.FBFriendsMarkers[location] = {
      marker: marker,
      friends: [user]
    };
  },


  // - given a position it adds a marker
  // for the current user as a "picked destination"
  // - adds the marker to `userMarkers` array
  addMarker: function (position, iconImg, _fn) {
	var lat, lng;
	if (typeof position.lat === 'function') {
		lat = position.lat();
		lng = position.lng();
	} else {
		lat = position.Ka;
		lng = position.La;
	}


    // FB.user is the user that added the location
    var marker = new google.maps.Marker({
      position:   new google.maps.LatLng(lat, lng),
      map:        this.map,
      animation:  google.maps.Animation.DROP,
      icon: new google.maps.MarkerImage(
        iconImg,
        new google.maps.Size(8, 18),
        new google.maps.Point(0, 0),
        new google.maps.Point(0, 18)
      ),
      shadow: new google.maps.MarkerImage(
        this.icon.shadow,
        new google.maps.Size(17, 12),
        new google.maps.Point(0, 0),
        new google.maps.Point(0, 12)
      )
    });

    _fn(marker);
  },


  /**
   * Add facebook friends to map
   */
  addFBFriendsToMap: function (FBfriends) {

    var self        = this
      , utils       = this.utils
      , marker      = {}
      , infowindow  = {}
      , timer       = 0;

    _.each(FBfriends, function(friend){
      if (friend.location) {
        $.get('/location/' + friend.location.name, function(resp){

          // we don't have that location stored  
          if (resp.error){
            // find a location 
            self.getGeo(resp.location, friend, timer++, function(result, friend) {
              if (!result.error) {

                var grouped_location = result.grouped_location;

                if (self.getFriendsMarkerByGroupLoc(grouped_location)) {
                  self.FBFriendsMarkers[grouped_location].friends.push(friend);
                } else {

                  self.dropMarker(friend, 'marker content', self.icon.user, grouped_location);

                }
              } 
            });

          } else {
            // we have a location stored
            var location    = resp.success
              , grouped_location = location.grouped_location;


            if (self.getFriendsMarkerByGroupLoc(grouped_location)) {
              self.FBFriendsMarkers[grouped_location].friends.push(friend); 
            } else {

              // have to convert the coordinates into a google object
              location.position = new google.maps.LatLng(location.position.lat(),
                                                    location.position.lng());

              self.dropMarker(friend, 'marker content', self.icon.offline, grouped_location);

            }

          }
        });
      }
    });
  },

  getFriendsMarkerByGroupLoc: function (grouped_location) {
    return this.FBFriendsMarkers[grouped_location] || null;
  },

  // post was too slow
  // new school stuff going on here
  saveLocation: function (locationObj) {
    socket.emit('add location', locationObj);
  },

  getGeo: function (fbLocation, friend, timer, _fn) {
    var self = this
      , utils = this.utils;

    setTimeout(function() {
      self.geoCoder.geocode({address: fbLocation}, function(results, status) {

        if (status === google.maps.GeocoderStatus.OK) {

          var formatted_address = results[0].formatted_address
            , position  = results[0].geometry.location
            , grouped_location = utils.getParsedLocation(formatted_address);

          var location = {
            formatted_address:  formatted_address,
            grouped_location:   grouped_location,
            fbLocation:         fbLocation,
            position:           position 
          };

          friend.position = {
            Ka: position.Ka,
            La: position.La
          };

          _fn(location, friend); // execute callback

          // cache the location for future use
          // position can't be sent as a google object
          // TODO - retest this - this looks silly
          var post_location = _.extend(location, {
              position: {
                Ka: location.position.Ka,
                La: location.position.La
              }
          });
          self.saveLocation(post_location);

        } else {
          console.error('Failed to find location: ', status); 
          _fn({error: status});
        }

      });
    }, timer * 1000);

  },


  utils: {
    // larger grouping of friends adresses  
    // grouping by state/region  
    getParsedLocation: function (addr) {
      var match = false,
        location  = addr,
        country   = '';

      if (match = addr.match(/\s([A-Z]{2})/)) {       
          // Boston, MA, USA
        location = match[1];
      } else if (match = addr.match(/\s([\w\s]*),/)){ 
        // Westminster, London, UK 
        location = match[1];
      } else if (addr.split(',').length === 2) {      
        // Rome, Italy
        location = addr.split(',')[0];
      }

      if (country = addr.match(/, (\w*)$/)) { country = '_' + country[1]; }

      location += country;
      // console.log('PARSED: ' +  addr + ' to : ', location);

      return location.toLowerCase();
    }
  }
};



