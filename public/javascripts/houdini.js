var App = window.App || {};

(function () {

$.subscribe('/FB/Friends/loaded', function() {
  // make sure we have a map before adding it 
  (function retry() {
    setTimeout(function() {
      if (App.world) {
        // App.world.addFBFriendsToMap(App.Facebook.FBFriends);
      } else {
        retry(); 
      }
    },500); 
  }());

});


$.subscribe('/FB/user/loaded', function (user) {

  // TODO need to build something for this whole retry business
  (function retry() {
    setTimeout(function() {
      if (App.world) {
        user.position = {
          Ka: App.world.initialLocation.Ka,
          La: App.world.initialLocation.La
        };

        console.log('Emitting user: [client]', user.first_name);
        socket.emit('user', user);   
      } else {
        retry(); 
      }
    },500); 
  }());
});



}());




$(window).load(function () {
	// initialize google maps
	// ======================
	App.world = new App.Gmap('map_canvas');	
});
