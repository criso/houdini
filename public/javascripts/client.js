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

    console.log('dropping marker for <online> user: ', user);

    App.note.notify("create", {
        picture: '<img src="' + user.picture + '" />'
      , title: user.name + ' has connected'
      , text:  'Welcome ' + user.name
    });

    world.dropMarker(user, user.name, world.icon.online, 'online');
  });
});


/**
 * a user has created a topic
 * - drop a marker on the topic location
 * - make marker bounce
 * - display notification "user A created topic"
 * - when user clicks on marker
 *   open a chat box
 */
socket.on('topic created', function (topicData) {
  console.log('socket: topic created  => ', topicData);

  var world = App.world;

  world.addMarker(topicData.position, world.icon.likeToGo, function (marker) {
    var $content    = new App.ChatBox(topicData.topic_id, topicData).el
      , topic_id    = topicData.topic_id
      , info_window = new google.maps.InfoWindow()
      , topic_title = topicData.title;

    info_window.setContent(world.pinTemplate(topicData));

    // marker on click
    // open chat on the right
    google.maps.event.addListener(marker, 'click', function() {
      info_window.open(world.map, marker);
      $('#friends-chat').append($content);
      world.focusChat(topic_id);
    });

    // animate marker for 5 seconds
    world.bounceMarker(marker, 5000);

    // display notification
    App.note.notify("create", {
        picture: '<img src="' + topicData.user.picture + '" />'
      , title: topicData.user.name + ' has started a trip log'
      , text:  topic_title
    });

    world.infoWindows[topic_id] = {
        infoWindow: info_window
      , marker: marker
    };

  });
});


/**
 *
 */
socket.on('user message', function (chat_id, user, msg) {
  // should be using same function as sendMessage somehow

  console.log('socket => user message: ', chat_id, user, msg);

  var world       = App.world
    , $chat_box   = $('#' + chat_id)
    , info_window = world.infoWindows[chat_id].infoWindow
    , marker      = world.infoWindows[chat_id].marker;

  // add message to chat box
  var $content = $('<li class="message">' +
      '<img  alt="Avatar for '+ user.name + '" src="'+ user.picture +'" class="avatar">' +
      '<div class="you-say">' + msg  + '</div>' +
    '</li>');


  $chat_box.find('.messages').append($content);
  world.focusChat(chat_id);
  world.bounceMarker(marker, 5000);

  // display notification
  App.note.notify("create", {
      picture: '<img src="' + user.picture + '" />'
    , title: user.name + ' says:'
    , text:  msg
  });

});


/**
 *
 */
socket.on('user disconnected', function (user) {
  console.log('user disconnected - ', user);
});


socket.on('stored friends', function (friends) {
  console.log('Friends: ', friends);
});
