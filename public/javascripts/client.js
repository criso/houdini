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
