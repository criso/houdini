// Finds or creates a user using Facebook data
exports.findOrCreateUserByFacebookData = function (fbUserMetadata, promise) {
  User.findOne({ facebookID: fbUserMetadata.id}, function (err, account) {

    if (err) {
      promise.fail(err);
      return; 
    }

    if (account) {
      promise.fulfill(account); 
    } else {
      var new_user = new User();
      new_user.email = fbUserMetadata.email;
      new_user.type = 1;
      new_user.facebookID = fbUserMetadata.id;
      new_user.date = new Date();

      new_user.save(function (err) {
        if (err) {
          promise.fail(err);
          return; 
        }
        promise.fulfill(new_user);
      });
    }
  });
};
