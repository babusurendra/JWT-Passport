var mongoose = require('mongoose');
schema = mongoose.Schema;
user = new schema({
  userid: String,
  username: String,
  password: String,
  email: String
});
module.exports = mongoose.model("authtable",user);