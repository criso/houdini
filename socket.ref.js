var io = require('socket.io').listen();

io.configure(function () {
  io.set('polling duration', 30);
});

io.configure('development', function () {
  io.set('log level', 3);
});

// ===============
io.sockets.on('connection', function (socket) {
  socket.get('nickname', function (err, nick) {
    // nickname we set during the session
  })

  io.sockets.clients(function (clients) {
    // connected clients
  });

});

// ===============
io.sockets.on('connection', function (socket) {
  var t = setInterval(function () {
    getStock('APPL', function (price) {
      socket.volatile.send(price);
    });
  }, 500);

  socket.on('disconnect', function () {
    clearInterval(t);
  });

});

// ===============
io.sockets.on('connection', function (socket) {
  socket.json.send('string');
  socket.json.send([
      {}
    , {}
  ]);

});

// ===============
io.sockets.on('connection', function (socket) {
  io.on('nickname change', function () {

  });

  io.sockets.emit('user connected', socket.id);

});


// ===============
// server side
io.sockets.on('connection', function (socket) {
  io.on('nickname', function (nick, fn) {
    checkAvailability(nick, fn);
  });
});

// client side
var socket = io.connect();
socket.emit('nickname', prompt('Nickname'), function (res) {
  // if the function arity > 0, a callback is passed 
  // to the event listener and the protocol signals
  // this is a Data ACK
}


//============
// namespace "" (default)
io.sockets.on('connection', function (socket) {
  io.on('nickname', function (nick, fn) {
    
  });
});

// namespace "/news"
var news = io.sockets
  .for('/news')
  .on('connection', function (socket) {
    io.on('item', function (nick, fn) {
    });

    news.emit('item');
});

var stream = io.sockets
  .for('/stream')
  .on('connection', function (socket) {
    io.on('item', function (nick, fn) {
    });

    stream.emit('item');
});


var socket = io.connect('http://localhost/stream')
var socket2 = io.connect('http://localhost/news')
