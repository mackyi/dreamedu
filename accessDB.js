// Module dependencies
var mongoose = require('mongoose');
var	Schema = mongoose.Schema;



// dependencies for authentication
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var User = require('./models/user'),
    File = require('./models/file');

// Define local strategy for Passport
passport.use(new LocalStrategy(
  function(username, password, done) {
    process.nextTick(function () {
      User.findOne({ username: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Incorrect username.' }); }
        user.verifyPassword(password, function(err, same){
          if(err){return callback(err); }
          if(!same){return done(null, false, { message: 'Invalid password.' }); };
          return done(null, user);
        })
      });
  })
  }
))

      
// serialize user on login
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// deserialize user on logout
passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

function findByUsername(username, fn) {
  user = User.findOne({ username: username});
  if(user){
    return fn(null, user);
  }
  return fn(null, null);
}

// connect to database
module.exports = {
  // save a user
  saveUser: function(userInfo, callback) {
    User.findOne({username: userInfo.username}, function (err, user){
      if(user){
        callback(null, null, 'Username is taken')
      } else {
        var newUser = new User({
          password: userInfo.password,
          username: userInfo.username
        });
        console.error(newUser);
        newUser.save(function(err) {
          if (err) {throw err;}
          callback(null, userInfo);
        });
      }
    });
  },

  saveFile: function(fileInfo, callback){
      var newFile = new File({
        filename :fileInfo.name,
        type : fileInfo.type,
        uploadpath :fileInfo.type
      })
      newFile.save(function(err){
        if(err) {throw err;}
        callback(null, fileInfo);
      })
      console.log(newFile);
  },
  getFilePath: function(filename, callback){
    File.findOne({'filename':filename}, function(err, file) {
      callback(null, file)
    })
  },

  // disconnect from database
  closeDB: function() {
    mongoose.disconnect();
  },

  // get all the users
  getUsers: function(callback) {
    User.find({}, ['username', '_id'], function(err, users) {
      callback(null, users);
    });
  },
}