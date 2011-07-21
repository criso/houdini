var socket = io.connect();

socket.on('connect', function () {
  console.log('socket connected');
});


socket.on('announcement', function (msg) {
  console.log('announcement: ', msg);
});

socket.on('usernames', function(usernames) {
  console.log('usernames: ', usernames);  
});

socket.on('location', function(location) {
  console.log('Location  => ', location); 
});


// receives a call containing all the users online
// call gets emited as soon as a user logs in
socket.on('users online', function(users) {

  console.log(_.size(users) + '  =>  users online: ', users);

  var loc;
  _.each(users, function (user) {
    if (user.facebookID === App.Facebook.FBUser.id) { 
      console.log("skipping user[client]: ", user.name); 
      return; 
    }

    console.log('dropping marker for <online> user: ' + user.name + ' @ ',user.position);
    loc = new google.maps.LatLng( user.position.Ka, user.position.La);
    App.world.dropMarker(loc, user.name, App.world.icon.online);
  });

});


// a user has disconnected
// if the user is a `FB friend` => change pin to offline pin
// else  =>  remove pin from map
socket.on('user disconnected', function (user) {
  if (App.Facebook.isFriend(user.facebookID)) {
    App.world.setMarkerOffline(user);
  } else {
    App.world.removeMarker(user);
  }
});


socket.on('stored friends', function (friends) {
  console.log('Friends: ', friends);
});

