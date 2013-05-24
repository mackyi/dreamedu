var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    bcrypt = require('bcrypt'),
    Assignment = require('./assignment'),
    Lesson = require('./lesson');

var collection = 'user';

var userSchema = new Schema({
  username: { type: String, unique: true},
  hash:{type: String},
  userType: String,       //'mentor' or 'student'
  fname: String,
  lname: String,
  bio: String,
  picUrl: String,         //URL of profile pic
  requests: [{        //student can request to work with a mentor
      studentUsername: String,
      mentorUsername: String,
      from: String,
      text: String,
      requestDate: Date
    }],
  mentors: [String],        //if student, these are all the associated mentors
  students: [String],       //if mentor, these are all associated students 
  lessons: [ObjectId] //attached to student
});
 
userSchema.methods.verifyPassword = function(password, callback) {
  bcrypt.compare(password, this.hash, function(err, res) {
   if(err) return callback(err, null);
    return callback(err, res);
  });
};

module.exports = mongoose.model(collection, userSchema);