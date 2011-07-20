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
var users = {}
  , user_friends   = {}
  , room_count = 1;

var FBFriends = {};

var utils = require('util');

io.sockets.on('connection', function (socket) {

  // User disconnected 
  socket.on('disconnect', function () {
    _.each(users, function (user) {
      if (user.socketID === socket.id) {
        io.sockets.emit('user disconnected', user.name + ' disconnected');
        delete user;
      }
    });
  });

  socket.on('user', function (resp) {
    var id = resp.id;

    users[id] = {
      name: resp.first_name + ' ' + resp.last_name,
      position: resp.position,
      // =>  this is what we'll look for 
      // to determine which users are in the private chat
      socketID: socket.id 
    };

    socket.fbID = id;

  // everybody but the client
    socket.broadcast.emit('announcement', resp.first_name + ' connected');

  // everbody
    io.sockets.emit('users', users);

    // usernames[username] = socket.username = username;
    // socket.broadcast.emit('announcement', username + ' connected');
    // io.sockets.emit('usernames', usernames);

    // if there are friends here - get put in the same room ?
  });

  socket.on('private msg', function (message) {
    var from  = socket.fbID
      , toArr = socket.friends;

    var sockets = io.sockets;
// ===================================
// Works inconsistently
// ===================================
//



   // var sockets = socket 
    // console.log("Mangaer: " + utils.inspect(socket.manager.sockets));
    for (var key in socket.manager.open) {
      // console.log('Socket: ', io.sockets[key]);
      var open = key;

      for (var k in sockets) {
        if (k === 'sockets') {
          console.log('K: ', k);
          console.log('sockets: '  + utils.inspect(sockets[k][open]));
          var id = sockets[k][open].fbID;
          console.log("id: " + id);
          if (toArr.indexOf(id) !== -1) {
            console.log('------ friends ----' +  from + ' to: ' + id);
          } else {
            console.log('-Not Friends ----' +  from + ' to: ' + id);
          }
          // console.log(sockets[k]);
        }
      }
    }
   
    // for (var i in sockets) {
    //   if (sockets[i].fbID) {
    //     var id = sockets[i].fbID;
    //     
    //     if (toArr.indexOf(id) !== -1) {
    //       console.log('------ friends ----' +  from + ' to: ' + id);
    //     } 
    //   
    //   }
    // }
  
    // console.log(utils.inspect(socket));
    // if (io.sockets.indexOf(socket.fbID) !== -1) {
    //   console.log('someone is online'); 
    //   console.log('from: ' + socket.fbID);
    // } else {
    //   console.log('no one is online'); 
    // }
  });

  socket.on('friends', function (friends) {
    socket.friends = friends; // allowed friends
  });

  socket.on('add location', function (location) {
    locationApi.create(location);
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
