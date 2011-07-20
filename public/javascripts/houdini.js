var App = window.App || {};

$.subscribe('/FB/Friends/loaded', function() {
  // make sure we have a map before adding it 
  (function retry() {
    setTimeout(function() {
      if (App.world) {
        App.world.addFBFriendsToMap(App.Facebook.FBFriends);
      } else {
        retry(); 
      }
    },500); 
  }());

});


$(window).load(function () {
	// initialize google maps
	// ======================
	App.world = new App.Gmap('map_canvas');	
});
