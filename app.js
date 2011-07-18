// =================================
// Module dependencies.
// =================================
var express				= require('express'),
		app						= module.exportappSes = express.createServer(),
		io						= require('socket.io').listen(app),
		connectAuth		= require('connect-auth');
		// Routes ( controllers )
		// auth					= require('./controllers/auth.js');

// global
mongoose	= require('mongoose');
Schema		= mongoose.Schema;

// =================================
// Configuration
// =================================
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'houdinified' }));
	app.use(connectAuth([
		connectAuth.Facebook({
			appId:  '193097990710217',
			appSecret:  '1242bb60970bff12916baca437cb0492',
			scope: 'email, user_about_me, user_birthday, user_location, publish_stream, friends_location',
			callback:  'http://localhost:3000/auth/facebook'
		})
	]));

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



// =================================
// mongoose
// =================================
mongoose.connect(app.set('db-uri'));

require('./models/account.js');
Account = mongoose.model('Account');


// =================================
// Routes
// =================================
var usernames = {};


app.get('/', function(req, res){
  res.render('index', { title: 'Express' });
});


app.get('/loggedIn', function(req, res) {
	res.render('user/loggedin', {title: 'user logged In'});
});


// app.get('/auth/facebook', auth.facebookLogIn);
// app.get('/logout', auth.logOut);


var loadFacebookAccount = function(facebook_details,loadCallback){
  Account.findOne({ facebook_id: facebook_details.user.id }, function(err,account){
    if(account){
      loadCallback(account);
    }
    else{
      var n = new Account();
      n.email = facebook_details.user.email;
      n.type = 1;
      n.facebook_id = facebook_details.user.id;
      n.date = new Date();
      n.save(function(err){
        loadCallback(n);
      });
    }
  });
};

loadAccount = function(req,loadCallback){
  if(req.isAuthenticated()){
    //load account out of database
    if(req.getAuthDetails().user.id){
      //its a facebook login - try and grab out of db otherwise make a user off of fbook credentials
      var fbook_details = req.getAuthDetails();
      loadFacebookAccount(fbook_details,loadCallback);
    }
  }
  else{
    loadCallback(null);
  }
};

// Auth Routes
app.get('/auth/facebook', function(req,res) {
  req.authenticate(['facebook'], function(error, authenticated) {
    loadAccount(req,function(account){
      console.log(req.headers.referer);
      if(req.headers.referer.substring(0,23) === 'http://www.facebook.com'){
        if(account && !account.username)
          res.redirect('/edit/username');
        else
          res.redirect('/');
      }
    });
  });
});



app.listen(3000);
console.log("Express server listening on port %d", app.address().port);


// Socket

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
