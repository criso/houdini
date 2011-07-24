// =================================
// Module dependencies.
// =================================
var express       = require('express')
  , app           = module.exportappSes = express.createServer()
  , io            = require('socket.io').listen(app)
  , everyauth     = require('everyauth')
  , mongoose      = require('mongoose')
  , stylus        = require('stylus')
  , nib           = require('nib')
  , _             = require('underscore')
  , utils         = require('util')
  , Promise       = everyauth.Promise;


var oauthconf     = require('./conf')
  , userUtils     = require('./lib/user_helpers.js');


// User authentication
// ===================
everyauth
  .facebook
    .appId(oauthconf.fb.appId)
    .appSecret(oauthconf.fb.appSecret)
    .findOrCreateUser( function (session, accessToken, accessTokenExtra, 
                                                        fbUserMetadata) {
      console.log(fbUserMetadata);
      var promise = new Promise();
      userUtils.findOrCreateUserByFacebookData(fbUserMetadata, promise);
      return promise;
    })
    .scope(oauthconf.fb.scope)
    .moduleErrback( function (err) {
      console.log("error: ", err);
    })
    .moduleTimeout( 4000 ) // Wait 4 seconds before timing out any step
    .redirectPath('/');


// Configuration
// ==============
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'houdinified' }));
  app.use(stylus.middleware({ 
    src: __dirname + '/public',
    dest: __dirname + '/public',
    compile: function(str, path) {
      return stylus(str)
        .set('compress', true)
        .use(nib());
    }
  }));

  app.use(everyauth.middleware());

  app.use(app.router);
  app.use(express.static(__dirname + '/public'));

// function compile(str, path) {
//       return stylus(str)
//         .import(__dirname + '/css/mixins/blueprint')
//         .import(__dirname + '/css/mixins/css3')
//         .set('filename', path)
//         .set('warn', true)
//         .set('compress', true);
//     }


});

app.configure('development', function(){
  app.set('db-uri', 'mongodb://localhost/houdini-dev');
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('test', function() {
  app.set('db-uri', 'mongodb://localhost/houdini-test');
});

app.configure('production', function(){
  app.set('db-uri', 'mongodb://localhost/houdini');
  app.use(express.errorHandler()); 
});


// mongoose config
// ================
mongoose.connect(app.set('db-uri'));


// Routes
// =======
var locationApi = require('./controllers/location.js')
  , friendsApi  = require('./controllers/friends.js');

app.get('/', function(req, res){
  res.render('index', { title: 'Houdini' });
});

app.get('/location/:name', locationApi.show);

app.post('/friends', friendsApi.create);


// Socket
// =======

var users           = {}
  , userPool        = {}
  , userSetMarkers  = [];


io.sockets.on('connection', function (socket) {

  // once a user is connected
  // we'll add that user to the userPool
  // and associate it's socketID with it's FBID
  socket.on('user', function (userData) {
    var facebook_id = userData.id;

    userPool[facebook_id] = {
      name:       userData.name,
      socketID:   socket.id,
      facebookID: facebook_id,
      position: {
        Ka: userData.position.Ka,
        La: userData.position.La
      }
    };

    // everybody but the client
    socket.broadcast.emit('announcement', userData.name +' connected');

    // send a broadcast to *everyone*
    // announcing which users are online
    io.sockets.emit('users online', userPool);
  });

  // socket has added a marker
  socket.on('add marker', function (markerData) {
    userSetMarkers.push(markerData);
    socket.broadcast.emit('marker added', markerData);
  });

  // user has added a topic on a marker
  // this should end up being a room
  socket.on('new topic', function (topicData, _fn) {
    // save topic
    var topic_saved = true;
    socket.broadcast.emit('topic created', topicData);

    _fn(topic_saved);
  });


  socket.on('user message', function (user, msg) {
    socket.broadcast.emit('user message', user, msg);
  });


  // if any of the friends.ids are in the userPool
  // array - send call back leting them know that 
  // they're friend is connected
  socket.on('friends', function (friends) {
    socket.friends = friends; // allowed friends
  });

  socket.on('add location', function (location) {
    locationApi.create(location);
  });


  // User disconnected
  socket.on('disconnect', function () {
    _.each(userPool, function (user) {
      if (user.socketID === socket.id) {
        io.sockets.emit('user disconnected', user);
        user = null;
      }
    });
  });

});

 

everyauth.helpExpress(app);

app.listen(3000);
console.log("Express server listening on port %d", app.address().port);
