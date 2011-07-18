var UserSchema = new Schema({
  username: String,
  type: Number,
  facebookID: String,
  email: String,
  date: Date
});

mongoose.model('User', UserSchema);
