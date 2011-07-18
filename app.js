// =================================
// Module dependencies.
// =================================
var express				= require('express'),
		app						= module.exportappSes = express.createServer(),
		io						= require('socket.io').listen(app),
		connectAuth		= require('connect-auth'),
		// Routes ( controllers )
		auth					= require('./controllers/auth.js');

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
			appId:		'193097990710217',
			appSecret:	'1242bb60970bff12916baca437cb0492',
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


app.get('/auth/facebook', auth.facebookLogIn);
app.get('/logout', auth.logOut);


// Works 
// ===============
// Auth Routes
// app.get('/auth/facebook', function(req,res) {
// 	req.authenticate(['facebook'], function (error, authenticated) {
// 		if (authenticated) {
// 			console.log('user: ' + JSON.stringify(req.getAuthDetails().user));
// 			
// 			res.redirect('/loggedIn');
// 		} else {
// 			// res.send('<h1> auth failed</h1>');	
// 			console.log('auth failed');
// 		}
// 	});
// });



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
