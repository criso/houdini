// =================================
// Module dependencies.
// =================================
var express       = require('express')
  , app           = module.exportappSes = express.createServer()
  , io            = require('socket.io').listen(app)
  , everyauth     = require('everyauth')
  , Promise       = everyauth.Promise;

var oauthconf     = require('./conf')
  , userUtils     = require('./lib/user_helpers.js');



// global
// ======
mongoose  = require('mongoose');
Schema    = mongoose.Schema;

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
require('./models/user.js');
User = mongoose.model('User');



// Routes
// =======
app.get('/', function(req, res){
  res.render('index', { title: 'Express' });
});


everyauth.helpExpress(app);

app.listen(3000);
console.log("Express server listening on port %d", app.address().port);





// Socket
// =======
var usernames = {};
io.sockets.on('connection', function (socket) {

  socket.on('user', function (username) {
    usernames[username] = socket.username = username;
    socket.broadcast.emit('announcement', username + ' connected');
    io.sockets.emit('usernames', usernames);
  });

  // sockets in the same room
  // one room for each socket
  
  // socket.join('socket.id')
  // socket.broadcast.to(socket.id).emit('connected');

});
