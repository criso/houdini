var App = window.App || {};

App.Facebook = ({

  appPerms: [
    'email',
    'user_about_me',
    'user_birthday',
    'user_location', 
    'publish_stream', 
    'friends_location'
  ],

  FBUser:     {},
  FBFriends:  {},

  loadFB: function () {
    var self = this
      , fbID = '193097990710217';

    window.fbAsyncInit = function() {
      FB.init({
        appId:  fbID,
        status: true,
        cookie: true,
        xfbml:  false 
      });

      self.subEvents();
    };

    (function() {
      var e = document.createElement('script');
      e.async = true;
      e.src = document.location.protocol+'//connect.facebook.net/en_US/all.js';
      document.getElementById('fb-root').appendChild(e);
    }());   

    return this;
  },

  subEvents: function () {
    var self = this;

    FB.getLoginStatus(function (resp) {
      if (resp.session) {
        self.setFBUser();   
        self.setFBFriends();
      } else {
        console.log("User isn't logged in - Please FIX.");
      }
    });
  },

  setFBUser: function (_fn) {
    var self = this;
    FB.api('/me', function(resp) {
      if (resp) {
        self.FBUser = resp;

		$.publish('/FB/user/loaded', [self.FBUser]);

		// if callback was provided - returns FBUser  
		if (typeof _fn === 'function')  _fn(self.FBUser); 
      }
    });
  },

  setFBFriends: function(_fn) {
    var self = this;  

    FB.api('/me/friends/?fields=name,picture,location', function(resp) {
      if (resp && resp.data){
        self.FBFriends = resp.data;

		$.publish('/FB/Friends/loaded');

        if (typeof _fn === 'function')  _fn(self.FBFriends);

        socket.emit('friends', _.pluck(resp.data, 'id'));
      }
    });
  }


}).loadFB();

