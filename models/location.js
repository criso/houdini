var LocationSchema = new Schema({
  formatted_address: String,
  position: {
    Ka: Number,
    La: Number
  },
  parsed_location: String
});

mongoose.model('Location', LocationSchema);
