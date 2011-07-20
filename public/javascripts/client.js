var socket = io.connect();

socket.on('connect', function () {
  console.log('socket connected');
});

socket.on('user disconnected', function (msg) {
  console.log(msg);
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

socket.on('users', function(users) {
  console.log('Users: ', users);
	var id = App.Facebook.FBUser.id;
  
  // remove the current user from the list
  delete users[id];

  _.each(users, function (user) {
    var loc = new google.maps.LatLng( user.position.Ka, user.position.La);
    console.log('dropping marker for: ', user.name);
    App.world.dropMarker(loc, user.name);
  });

});

socket.on('stored friends', function (friends) {
  console.log('Friends: ', friends);
});


function run() {
  socket.emit('private msg', {
    message: 'this goes out to all my homies'
  });
}

