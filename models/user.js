var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    passport = require('passport'),
    bcrypt = require('bcrypt'),
    util = require('util');

var collection = 'user',
    SALT_WORK_FACTOR =10;



var schema = new Schema({
  username: { type: String, unique: true},
  hash:{type: String}
});

schema.virtual('password')
.get(function (){
  return this._password;
})
.set(function(password){
  this._password = password;
  var salt = bcrypt.genSaltSync(10);
  this.hash = bcrypt.hashSync(password, salt);
  // this.setPassword(password);
})

// schema.methods.setPassword = function(password) {
//   _this = this;
//   bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
//     if(err) {return err;}
//     bcrypt.hash(password, salt, function(err, encrypted) {
//         if(err) {console.log(err); }
//         _this.hash = encrypted;
//     });
//   });
// }

schema.methods.verifyPassword = function(password, callback) {
  bcrypt.compare(password, this.hash, callback);
};

schema.static('authenticate', function(email, password, callback){
  this.findOne({email:email}, function(err, user){
    if(err){ return callback(err); }
    if(!user){ return callback(null, false); }
    user.verifyPassword(password, function(err, passwordCorrect){
      if(err){return callback(err); }
      if(!passwordCorrect){return callback(null, false); }
      return callback(null,user);
    })
  })
})

module.exports = mongoose.model(collection, schema);