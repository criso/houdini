var siberia 			= new google.maps.LatLng(60, 105),
 	newyork 			= new google.maps.LatLng(40.69847032728747, -73.9514422416687),
	browserSupportFlag 	= false,
	initialLocation 	= '',
	map 				= {},
	markers 			= [];

function initialize() {
	var myOptions = {
		zoom: 10,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);


  // Try W3C Geolocation (Preferred)
  if (navigator.geolocation) {
	  browserSupportFlag = true;
	  navigator.geolocation.getCurrentPosition(function(position) {
		  initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
		  map.setCenter(initialLocation);


		var marker = new google.maps.Marker({
			position:	initialLocation,
			map:		map,
			animation: google.maps.Animation.DROP
		});

		var infowindow = new google.maps.InfoWindow({
			content: 'This is HOME'
		});

		// Map marker on click event
		google.maps.event.addListener(marker, 'click', function() {
			infowindow.open(map,marker);
		});




	  }, function() {
		  handleNoGeolocation(browserSupportFlag);
	  });
  }

  function handleNoGeolocation(errorFlag) {
    if (errorFlag == true) {
      alert("Geolocation service failed.");
      initialLocation = newyork;
    } else {
      alert("Your browser doesn't support geolocation. We've placed you in Siberia.");
      initialLocation = siberia;
    }
    map.setCenter(initialLocation);
  }

	// setMarkers(map, beaches);
	// for (var i = 0; i < beaches.length; i++) {
	// 	 setTimeout(function() {
	// 	   addMarker();
	// 	 }, (i+1) * 500);
	// }

}


/**
* Data for the markers consisting of a name, a LatLng and a zIndex for
* the order in which these markers should display on top of each
* other.
*/
var beaches = [
	['Bondi Beach', -33.890542, 151.274856, 4],
	['Coogee Beach', -33.923036, 151.259052, 5],
	['Cronulla Beach', -34.028249, 151.157507, 3],
	['Manly Beach', -33.80010128657071, 151.28747820854187, 2],
	['Maroubra Beach', -33.950198, 151.259302, 1]
];


// Add markers to the map

// Marker sizes are expressed as a Size of X,Y
// where the origin of the image (0,0) is located
// in the top left of the image.

// Origins, anchor positions and coordinates of the marker
// increase in the X direction to the right and in
// the Y direction down.
var image = new google.maps.MarkerImage('images/beachflag.png',
// This marker is 20 pixels wide by 32 pixels tall.
new google.maps.Size(20, 32),
// The origin for this image is 0,0.
new google.maps.Point(0,0),
// The anchor for this image is the base of the flagpole at 0,32.
new google.maps.Point(0, 32));
var shadow = new google.maps.MarkerImage('images/beachflag_shadow.png',
// The shadow image is larger in the horizontal dimension
// while the position and offset are the same as for the main image.
new google.maps.Size(37, 32),
new google.maps.Point(0,0),
new google.maps.Point(0, 32));
// Shapes define the clickable region of the icon.
// The type defines an HTML &lt;area&gt; element 'poly' which
// traces out a polygon as a series of X,Y points. The final
// coordinate closes the poly by connecting to the first
// coordinate.
var shape = {
	coord: [1, 1, 1, 20, 18, 20, 18 , 1],
	type: 'poly'
};


var iterator = 0;

function addMarker () {
	var beach = beaches[iterator];
	markers.push(new google.maps.Marker({
		// position:	myLatLng,
		position:	new google.maps.LatLng(beach[1], beach[2]),
		map:		map,
		shadow:		shadow,
		icon:		image,
		shape:		shape,
		title:		beach[0],
		zIndex:		beach[3],
		draggable: false,
		animation: google.maps.Animation.DROP
	}));

	iterator++;
}







$(window).load(function () {
	// initialize google maps
	// ======================
	initialize();	

	// facebook
	//==========
	var fbId		= '193097990710217';
	window.fbAsyncInit = function() {
		FB.init({
			appId:	fbId,
			status: true,
			cookie: true,
			// All elements on the page are parsed as they get loaded  
			// `xfbml: false` will disable automatic parsing  
			xfbml:	false 
		});

		FB.getLoginStatus(function(resp) {
			// if (resp.status.match(/connected/i)) { }
			if (resp.session) {
				FB.api('/me', function(resp) {
					socket.emit('user', resp.first_name);		
				});
			}
		});
	};

	(function() {
		var e = document.createElement('script');
		e.async = true;
		e.src = document.location.protocol+'//connect.facebook.net/en_US/all.js';
		document.getElementById('fb-root').appendChild(e);
	}());		

});


var friends_markers = {};


// =========== facebook friends ============
function addFriends () {
	var geocoder = new google.maps.Geocoder(),
		marker 		= {},
		infowindow 	= {};

	FB.api('/me/friends/?fields=name,location', function(resp) {
		var i = 0, y = 0;
		_.each(resp.data, function(friend){
			if (friend.location) {
				// have to use a timeout so that we don't run 
				// into query limit fail
				setTimeout(function() {

					// TODO
					// have to store the locations
					// and only drop one marker at a time
					// on the first run

					// check to see if we already created a marker
					// for this friend's location
					// if so, only add the friend to the array and don't create another marker
					// var location_name = friend.location.name;
					// if (friends_markers[location_name]) {
					// 	// add to friends-location
					// 	console.log('adding to friends_markes: ', friend);
					// 	friends_markers[location_name].friends.push(friend);

					// } else {
						geocoder.geocode({ address: friend.location.name }, function(results, status) {

							if (status == google.maps.GeocoderStatus.OK) {
								location_name = parseAddress(results[0].formatted_address);

								if (friends_markers[location_name]) {
									console.log('adding to friends_markes: ', friend);
									friends_markers[location_name].friends.push(friend);
								} else {
									console.log('setting marker on ' + friend.location.name, ++y);

									// should only drop a marker on a location 
									// that doesn't currently have a marker
									marker = new google.maps.Marker({
										map: map,
										title: friend.name,
										position: results[0].geometry.location,
										animation: google.maps.Animation.DROP
									});

									// console.log(results[0].formatted_address);// => MA

									// create a friends-location 
									console.log('creating new friend-location to friends_markes: ', location_name);
									// friends_markers.push( friend_location );
									friends_markers[location_name] = {
										position: results[0].geometry.location,
										friends: [friend]
									};


									infowindow = new google.maps.InfoWindow({ 
										content: _.pluck(friends_markers[location_name].friends, 'name').toString()

										// content: 
									});

									// Map marker on click event
									google.maps.event.addListener(marker, 'click', function() {
										infowindow.open(map,marker);
									});
								
								}
							

							}	else {
								console.log('fail: ', status);	
							}
						});
					
					// }

					
				}, i * 1000);	
				i++;
			}	
		});

	});
}

// larger grouping of friends adresses
// grouping by state
function parseAddress(addr) {
	var match 		= false,
		location 	= addr,
		country 	= '';


	if (match = addr.match(/\s([A-Z]{2})/)) { 		// Boston, MA, USA
		location = match[1];
	} else if (addr.split(',').length == 2) { 		// Rome, Italy
		location = addr.split(',')[0];
	} else if (match = addr.match(/-\s(\w*),/)) { 	// Vitoria - ES, Brazil
		location = match[1];
	} else if (match = addr.match(/\s([\w\s*]),/)){ 	// Westminster, London, UK 
		location = match[1];
	}

	if (country = addr.match(/, (\w*)$/)) { 	
		country = '_' + country[1];
	}

	location += country;
	console.log('PARSED: ' +  addr + ' to : ', location);
	return location.toLowerCase();
}


