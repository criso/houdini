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


/**
 *
 */
socket.on('marker added', function (markerData) {
  console.log('------ marker added: ', markerData);

  // var world = App.world
  //   , content =  '<div class="box">' +
  //                   markerData.user.name + ' is adding something...' +
  //               '</div>';

  // world.addMarker(markerData.position, world.icon.likeToGo, function (marker) {
  //   world.friendsPlacesMarkers.push(marker);

  //   world.infoWindow.setContent(content);
  //   world.infoWindow.open(world.map, marker);

  //   // marker on click
  //   google.maps.event.addListener(marker, 'click', function() {
  //       world.infoWindow.open(world.map, marker);
  //   });
  // });
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

    info_window.setContent($content[0]);

    // marker on click
    google.maps.event.addListener(marker, 'click', function() {
      info_window.open(world.map, marker);
    });

    // animate marker for 5 seconds
    world.bounceMarker(marker, 5000);

    // display notification
    App.note.notify("create", {
        picture: '<img src="' + topicData.user.picture + '" />'
      , title: topicData.user.name + ' has started a conversation'
      , text:  topic_title
    });

    world.infoWindows[topic_id] = {
        infoWindow: info_window
      , marker: marker
    };
  });
});


// socket.on('user message', message);
socket.on('user message', function (chat_id, user, msg) {
  // should be using same function as sendMessage somehow

  console.log($('.chat-box'));

  var world = App.world
    , $chat_box = $('#' + chat_id)
    , info_window = world.infoWindows[chat_id].infoWindow
    , marker = world.infoWindows[chat_id].marker;

  // add message to chat box
  var $content = $('<li class="message">' +
      '<img  alt="Avatar for '+ user.name + '" src="'+ user.picture +'" class="avatar">' +
      '<div class="you-say">' + msg  + '</div>' +
    '</li>');

  // info_window is closed
  if (!info_window.getMap()) {
    // $chat_box will only exist in memory
    // so we have to 
    // - get the content
    // - change it and set content 
    var $old         = $(info_window.getContent())
      , $new_content = $old.find('.messages').append($content).end();
    
    // since it's the div is new 
    // we've lost the event bindings at this point
    // there must be a better way to do this - TODO
    $new_content.find('form')
    .submit(function(ev){
      ev.preventDefault();
      world.sendMessage($new_content, marker);
    })
    .end();

    info_window.setContent($new_content[0]);

    // animate marker for 5 seconds
    world.bounceMarker(marker, 5000);

    // display notification
    App.note.notify("create", {
        picture: '<img src="' + user.picture + '" />'
      , title: user.name + ' says:'
      , text:  msg
    });

  } else {
    $chat_box.find('.messages').append($content);
  }
});


socket.on('user disconnected', function (user) {
  console.log('user disconnected - ', user);
});


socket.on('stored friends', function (friends) {
  console.log('Friends: ', friends);
});
