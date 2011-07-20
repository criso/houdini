// =================================
// Module dependencies.
// =================================
var express       = require('express')
  , app           = module.exportappSes = express.createServer()
  , io            = require('socket.io').listen(app)
  , everyauth     = require('everyauth')
  , mongoose      = require('mongoose')
  , Promise       = everyauth.Promise;

var _ = require('underscore');

var oauthconf     = require('./conf')
  , userUtils     = require('./lib/user_helpers.js');


everyauth.debug = true;

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
  app.use(everyauth.middleware());
  app.use(express.compiler({ src: __dirname + '/public', enable: ['sass'] }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
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
app.get('/', function(req, res){
  res.render('index', { title: 'Express' });
});

var locationApi = require('./controllers/location.js')
  , friendsApi  = require('./controllers/friends.js');

app.get('/location/:name', locationApi.show);

app.post('/friends', friendsApi.create);




// Socket
// =======
var utils = require('util');

var users     = {}
  , userPool  = {};

// var userPool = [{
//   name: username,
//   socketID: socket.id,
//   facebookID: id
// }];


io.sockets.on('connection', function (socket) {

  // once a user is connected
  // we'll add that user to the userPool
  // and associate it's socketID with it's FBID
  socket.on('user', function (userData) {
    var facebook_id = userData.id;

    userPool[facebook_id] = {
      name:       userData.first_name + ' ' + userData.last_name,
      socketID:   socket.id,
      facebookID: facebook_id,
      position: {
        Ka: userData.position.Ka,
        La: userData.position.La
      }
    };

    // everybody but the client
    socket.broadcast.emit('announcement', userData.first_name + ' connected');

    // send a broadcast to *everyone* 
    // announcing which users are online
    io.sockets.emit('users online', userPool);

    // usernames[username] = socket.username = username;
    // socket.broadcast.emit('announcement', username + ' connected');
    // io.sockets.emit('usernames', usernames);
    // if there are friends here - get put in the same room ?
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
        console.log('==== removing user');
        io.sockets.emit('user disconnected', user.name + ' disconnected');
        user = null;
      }
    });
  });


// io.sockets.on('connection', function (socket) {
//   socket.join('justin bieber fans');
//   socket.broadcast.to('justin bieber fans').emit('new fan');
//   io.sockets.in('rammstein fans').emit('new non-fan');
// });


  // sockets in the same room
  // one room for each socket
  
  // socket.join('socket.id')
  // socket.broadcast.to(socket.id).emit('connected');
});



everyauth.helpExpress(app);

app.listen(3000);
console.log("Express server listening on port %d", app.address().port);
