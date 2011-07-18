var loadFacebookAccount = function(facebook_details,loadCallback){
  Account.findOne({ facebook_id: facebook_details.user.id }, function(err,account){
    if (account){
      loadCallback(account);
    } else{
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

var loadAccount = function(req, loadCallback){
  if (req.isAuthenticated()){
    //load account out of database
    if (req.getAuthDetails().user.id){
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
exports.logOut = function (req, res, params) {
  req.logout();
  if(req.headers.referer){
    res.redirect(req.headers.referer);
  } else {
    res.redirect('/');
	}
};

exports.facebookLogIn = function (req, res) {
  req.authenticate(['facebook'], function(error, authenticated) {

		if (authenticated) {
			// console.log('user: ' + JSON.stringify(req.getAuthDetails().user));
			//
			//
			//NOT WORKING
			// loadAccount(req, function(account){
			// 	// console.log(req.headers.referer);
			// 	// if (req.headers.referer.substring(0,23) === 'http://www.facebook.com'){
			// 		if (account && !account.username) {
			// 			// we won't go to this 
			// 			res.redirect('/edit/username');
			// 		} else {
			// 			res.redirect('/loggedIn');
			// 		}
			// 	// }
			// });

			console.log('user: ' + JSON.stringify(req.getAuthDetails().user));
			res.redirect('/loggedIn');
		} else {
		
			console.log('--- auth failed');
		}
  });
};
