var App = window.App || {};

(function () {

$.subscribe('/FB/Friends/loaded', function() {

  $('#facebook_login').hide();

  // make sure we have a map before adding it 
  (function retry() {
    setTimeout(function() {
      if (App.world) {
        // TODO - is broken right now
        // should addFBFriendsToMap call dropmarker or addMarker?
        // App.world.addFBFriendsToMap(App.Facebook.FBFriends);
        App.world.addFriendsToMap(App.Facebook.FBFriends);
      } else {
        retry(); 
      }
    },500); 
  }());

});


// we create a map 
// and once the FB user is loaded
// we drop a marker on the user's location
$.subscribe('/FB/user/loaded', function (user) {

  // TODO need to build something for this whole retry business
  (function retry() {
    setTimeout(function() {

      if (App.world) {
        var world = App.world;

        // get the user's location 
        world.getBrowserLocation(function(location, markerContent) { 

          // add the user's location to the user object
          // and drop a marker there
          user.position = {
            lat: location.lat(),
            lng: location.lng()
          };

          world.dropMarker(user, markerContent, world.icon.user, 'user');

          console.log('Emitting user: [client]', user);
          socket.emit('user', user);   
        }); 

      } else {
        retry(); 
      }
    },500); 
  }());
});



}());


// window load for google maps
$(window).load(function () {
  // initialize google maps
  // ======================
  if (!$('#backbone')[0]) {
    App.world = new App.Gmap('map_canvas');	
  }
});

// dom ready
$(function() {
  App.note = $('#notify-container').notify();

  $('#tabs').tabs({ selected: 0 });
});
