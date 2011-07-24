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
  var world = App.world;

  console.log(_.size(users) + '  =>  users online: ', users);

  _.each(users, function (user) {
    if (user.facebookID === App.Facebook.FBUser.id) { 
      console.log("skipping user[client]: ", user.name); 
      return; 
    }

    console.log('dropping marker for <online> user: ' + 
                user.name + ' @ ',user.position);

    world.dropMarker(user, user.name, world.icon.online, 'online');
  });
});


socket.on('marker added', function (markerData) {
  console.log('marker added: ', markerData);

  var world = App.world
    , content =  '<div class="box">' +
                    markerData.user.name + ' is adding something...' +
                '</div>';

  world.addMarker(markerData.position, world.icon.likeToGo, function (marker) {
    world.friendsPlacesMarkers.push(marker);

    world.infoWindow.setContent(content);
    world.infoWindow.open(world.map, marker);

    // marker on click
    google.maps.event.addListener(marker, 'click', function() {
        world.infoWindow.open(world.map, marker);
    });
  });

});

// user created a topic
socket.on('topic created', function (topicData) {
  console.log('topicData: ', topicData);
  var world           = App.world
    , topic_name      = topicData.topicName
    , topic_starter   = topicData.user
    , user            = App.Facebook.FBUser
    , position = new google.maps.LatLng(topicData.position.Ka, topicData.position.La);




  var $content = $(
    '<div class="chat-box">' +
      '<div class="chat-header">' +
        '<img  alt="Avatar for CrisO" src="'+ topic_starter.picture +'" class="you-say" />' +
        '<div class="topic-title">' + topic_name + '</div>' +
      '</div>' +
      '<ul class="messages"></ul>' +
      '<div class="chat-input">' +
        '<img  alt="Avatar for CrisO" src="'+ user.picture +'" class="you-say">' +
        '<form>' +
        '<textarea name="message" id="user-message" autofocus></textarea>' +
        '<button class="minimal button">Send</button' +
        '</form>' +
      '</div>' +
    '</div>');

  world.infoWindow.setOptions({
    position: position,
    content: $content[0]
  });

  world.infoWindow.open(world.map);
});


// socket.on('user message', message);
socket.on('user message', function (user, msg) {
  // should be using same function as sendMessage somehow

});



socket.on('user disconnected', function (user) {
  console.log('user disconnected - ', user);
});


socket.on('stored friends', function (friends) {
  console.log('Friends: ', friends);
});

