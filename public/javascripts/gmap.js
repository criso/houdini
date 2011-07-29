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

  initialLocationName: '',

  // This function is a great place to use 
  // $.deferrend TODO
  addFriendsToMapBAK: function (friends) {
    var self  = this
      , timer = 0
      , cached_timer = 0
      , location_cluster = {};

    _.each(friends, function (friend) {
      if (friend.location && friend.location.name) {

        // try to find a cached location object
        // if that doesn't work - load from google
        self.findCachedLocationObj(friend.location.name, function(location) {
          if (location) {
            location_cluster = location.location_cluster;

            // attach coordinates to friend object
            friend.position = location.position;

            if (self.getFriendsMarkerByGroupLoc(location_cluster)) {
              self.FBFriendsMarkers[location_cluster].friends.push(friend); 
            } else {
              self.dropMarker(friend, 'marker content', self.icon.user, cluster);
            }

          } else {

            self.getGeo(friend, timer++, function(err) {
              if (!err) {
                var cluster = friend.location_cluster;

                if (self.getFriendsMarkerByGroupLoc(cluster)) {
                  timer--;
                  self.FBFriendsMarkers[cluster].friends.push(friend);
                } else {
                  self.dropMarker(friend, 'marker content', self.icon.user, cluster);
                }
              }
            });
          }
        });
      }
    });
  },

  myMarkers: [],

  collections: {},

  addFriendsToMap: function (friends) {
    var self  = this
      , timer = 0
      , cached_timer = 0
      , location_cluster = {}
      , friend_count = 0;

    var friendsView = new App.FriendsView();
    var infoWindowTemplate =  _.template($('#info-window-template').html());

    _.each(friends, function (friend) {
      if (friend.location && friend.location.name) {

        App.Fares.getAirportData(friend.location.name, function(location) {
          if (!location.error) {

            var location_cluster  = location.location_cluster
              , position          = location.position;
            
            if (self.collections[location_cluster]) {
              self.collections[location_cluster].add(friend);
            } else {

              var collection = new App.FBCollection();
              self.collections[location_cluster] = collection;

              collection.location = location_cluster;
              collection.position = position;
              collection.add(friend);

              friendsView.addCollection(collection);

              self.addMarker(position, self.icon.user, function (marker) {
                collection.marker = marker;

                // click on marker
                google.maps.event.addListener(marker, 'click', function() {
                  friendsView.hideAll();
                  collection.showInfoWindow();
                  collection.showFares();

                });

              });
            }
          }
        });
      }
    });
  },


  // currently not used 
  // ==================
  useCachedLocations: function (friend, friendsView) {
          // self.findCachedLocationObj(friend.location.name, function(location) {

          //   if (location) {
          //     location_cluster  = location.location_cluster;
          //     friend.position   = location.position;

          //     if (self.collections[location_cluster]) {
          //       // bbone
          //       self.collections[location_cluster].add(friend);
          //       // bbone
          //     } else {

          //       
          //       // bbone
          //       var collection = new App.FBCollection();
          //       self.collections[location_cluster] = collection;

          //       collection.location = location_cluster;
          //       collection.position = friend.position;
          //       collection.add(friend);

          //       friendsView.addCollection(collection);
          //       // bbone


          //       self.addMarker(location.position, self.icon.user, function (marker) {
          //         collection.marker = marker;
          //         // clear highlights from marked friends
          //         friendsView.clearHighlight();

          //         google.maps.event.addListener(marker, 'click', function() {

          //           var users = '';
          //           collection.each(function(user) {
          //             user.trigger('ui:highlight');
          //             users += user.get('name');
          //           });

          //           var info_window = new google.maps.InfoWindow();

          //           info_window.setContent('<div>' + users + '</div>');
          //           info_window.open(self.map, marker);
          //           
          //         });

          //         // console.log('Test:: marker.position for <' + location_cluster 
          //         //             + '> should be the same as friend.position',
          //         //             self.collections[location_cluster].position.lat === marker.getPosition().lat());
          //       });
          //     }

          //   }
          // });
  },

  // drop markers with a delay in between them
  delayedDrop: function (friend, marker_content, location_cluster, timer) {
    var self = this;
    setTimeout(function() {
      self.dropMarker(friend, 'marker content', self.icon.user, location_cluster);
    }, timer * 500);
  },


  // - given a position it adds a marker
  // for the current user as a "picked destination"
  // - adds the marker to `userMarkers` array
  addMarker: function (position, iconImg, _fn) {
    if (typeof position.lat !== 'function') {
      position = new google.maps.LatLng(position.lat, position.lng);
    }

    var marker = new google.maps.Marker({
      position:   position,
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

  // - given a position it adds a marker
  // for the current user as a "picked destination"
  // - adds the marker to `userMarkers` array
  addMarkerBAK: function (position, iconImg, _fn) {
    // we have to do this since we can't cache
    // the location as google objects
    var lat, lng;
    if (typeof position.lat === 'function') {
      lat = position.lat();
      lng = position.lng();
    } else {
      lat = position.lat;
      lng = position.lng;
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
              '<input type="hidden" name="lat" value="'+ event.latLng.lat()  +'" />' +
              '<input type="hidden" name="lng" value="'+  event.latLng.lng() +'" />' +
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

      });
    });

    // chat box on submit
    $('.chat-box form').live('submit', function(ev) {
      ev.preventDefault();
      var $form = $(this).parents('.chat-box').first();
      self.sendMessage($form, $form.data('marker'));
    });

    $.subscribe('bounce:marker', function(marker) {
      self.bounceMarker(marker, 4000); 
    });
  },

  // animate marker 
  bounceMarker: function (marker, time) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null);
    }, time);
  },

  // drop a marker on the map
  // `position` => google.maps.LatLng
  // `markerContent` => string
  dropMarker: function (user, markerContent, iconImg, location) {
    if (!user.position) { 
      console.log("ERROR => location undefined for user:", user);
      return false;
    }


    var self = this;

    var marker = new google.maps.Marker({
      position:   new google.maps.LatLng(user.position.lat, user.position.lng),
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

  findCachedLocationObj: function (location_name, _fn) {
    $.get('/location/' + location_name, function(resp){

      var location;
      if (resp.error) {
        location = false;
      } else {
        location = resp.success;
      }

      return _fn(location);
    });
  },

  // get user's location from browser  
  getBrowserLocation: function (_fn) {

    // Testing code START
    // =================
    var test_location;
    switch (window.location.hash) {
      case '#userB':
        // florida
        test_location = {
          lat: 25.790654,
          lng: -80.1300455
        };
      break;

        // california
      case '#userC':
        test_location = {
          lat: -118.39951940000003,
          lng: 33.8622366
        };
      break;

      default:
        test_location = null;
      break;
    }

    if (test_location) {
      this.initialLocation = new google.maps.LatLng(test_location.lat, test_location.lng);
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

  /**
   *
   */
  getFriendsMarkerByGroupLoc: function (grouped_location) {
    return this.FBFriendsMarkers[grouped_location] || null;
  },

  /**
   * callback returns true on err
   */
  getGeo: function (friend, timer, _fn) {
    var self = this;

    setTimeout(function() {
      self.geoCoder.geocode({address: friend.location.name}, function(results, status) {

        var err = false;

        if (status === google.maps.GeocoderStatus.OK) {

          var position = results[0].geometry.location
            , lat = position.lat()
            , lng = position.lng();

          var location = {
            formatted_address:  results[0].formatted_address,
            location_cluster:   self.getParsedLocation(results[0].formatted_address),
            fbLocation:         friend.location.name,
            position:           {
              lat: lat,
              lng: lng
            }
          };

          // alter friend object
          friend.position         = { lat: lat, lng: lng };
          friend.location_cluster = location.location_cluster;

          // execute callback
          self.saveLocation(location);
        } else {
          err = true;
        }

        _fn(err);

      });
    }, timer * 800);

  },

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

    return location.toLowerCase();
  },

  /**
   *
   */
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
          , position: { lat: form.lat.value, lng: form.lng.value }
          , user:     App.Facebook.FBUser
    };

    // close the "set topic" info window 
    topic_info_window.close();
    topic_info_window = null;

    // each topic gets saved on the DB with an id
    // the chat-box now has id for the "room"
    socket.emit('new topic', topic_data, function(set, topic_id) {
      if (set) {

        // set content on infowindow to be:
        //    - topic name
        // on click
        //    - open chat tab
        //    - chat elem should haven an id

        var $content    = new App.ChatBox(topic_id, topic_data).el
          , info_window = new google.maps.InfoWindow();

          info_window.setContent('<h1>' + topic_data.title + '</h1>');

        google.maps.event.addListener(marker, 'click', function() {
          info_window.open(self.map, marker);
          $('#friends-chat').html($content);
          $('#tabs').tabs( "select" , 1 );
        });

        //
        //   , info_window = new google.maps.InfoWindow();

        // // marker on click
        // google.maps.event.addListener(marker, 'click', function() {
        //   info_window.open(self.map, marker);
        // });

        // $content.data({marker: marker});

        // self.infoWindows[topic_id] = {
        //   infoWindow: info_window,
        //   marker: marker
        // };

        // info_window.setContent($content[0]);
        // info_window.open(self.map, marker);
      }
    });
  },

  // post was too slow
  // new school stuff going on here
  saveLocation: function (locationObj) {
    socket.emit('add location', locationObj);
  }
};
