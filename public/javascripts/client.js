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

socket.on('users', function(users) {
  console.log('Users: ', users);
});

socket.on('stored friends', function (friends) {
  console.log('Friends: ', friends);
});


function run() {
  socket.emit('private msg', {
    message: 'this goes out to all my homies'
  });
}

