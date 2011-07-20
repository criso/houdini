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

socket.on('stored friends', function (friends) {
  console.log('Friends: ', friends);
});


function run() {
  socket.emit('private msg', {
    message: 'this goes out to all my homies'
  });
}

