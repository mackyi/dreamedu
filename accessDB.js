// Module dependencies
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
// var scrypt = require("scrypt");

var passport = require('passport'), 
  LocalStrategy = require('passport-local').Strategy;

var User = require('./models/user'),
    Assignment = require('./models/assignment'),
    File = require('./models/file'),
    Lesson = require('./models/lesson'),
    Request = require('./models/request');

//to-do: remove - just for testing
User.find(function(err, users){ console.log(users);} );
User.find({username: 'my'}, {type: 1}, function(err, user){console.log(user)});
var SALT_WORK_FACTOR =10;

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false, {message: 'Unknown user ' + username}); }
      user.verifyPassword(password, function(err, valid){ 
        if(err) return done(err);
        if(!valid) return done(null, false, {message: 'Invalid password'});
        return done(null, user);
      })
    });
  }
));

      
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


// connect to database
module.exports = {
  startup: function(dbToUse) {
    mongoose.connect(dbToUse);
    // Check connection to mongoDB
    mongoose.connection.on('open', function() {
      console.log('We have connected to mongodb');
    }); 

  },

  saveFile: function(fileInfo, callback){
      var newFile = new File({
        filename :fileInfo.name,
        uploadname: fileInfo.uploadname,
        path: fileInfo.path,
        type : fileInfo.type,
        uploader : fileInfo.uploader
      })
      newFile.save(function(err, docs){
        if(err) callback(err);
        callback(null, docs);
      })
      console.log(newFile);
  },

  getFile: function(filename, callback){
    File.findOne({'filename':filename}, function(err, file) {
      callback(null, file)
    })
  },

  saveUser: function(userInfo, callback){
    User.findOne({username: userInfo.username}, function (err, user){
      if(user){
        callback(null, null, "Username taken");
      } else {
        bcrypt.genSalt(10, function(err, salt) {
 //         console.log(userInfo.password);
          bcrypt.hash(userInfo.password, salt, function(err, pwdhash) {
              if (!err) {
              var newUser = new User({
                username: userInfo.username,
                hash: pwdhash,
                userType: userInfo.userType,
                fname: userInfo.fname,
                lname: userInfo.lname,
                picUrl: userInfo.picUrl
              });
              newUser.save(function(err) {
                if (err) {throw err;}
                callback(null, userInfo);
              });
          }
          });
        });  
      }
    });
  },
  
  findByUsername: function(username, callback){
    User.findOne({username: username}, function (err, user){
      if(err) callback(err, null)
      if(user){
        callback(null, user);
      } else {
        callback(null, null);
      }
    }).lean();
  },  
  
  
  
  //to-do: this probably doesn't work if any of the values is null...
  findMentor: function(mentorInfo, callback){
  
/*    var userInfo;
    for (var property in mentorInfo){
      if (mentorInfo[property] != ''){
        userInfo.property = mentorInfo.property;
      }
    }
*/
    // for each property in mentorInfo 
    //   if value!=''
    //     userInfo.property = 
    User.find({$or: [
      {username: {$in: mentorInfo.name}},
      {fname: {$in: mentorInfo.name}},
      {lname: {$in: mentorInfo.name}}
      ]}, function(err, mentors){
        if(err){
          callback(err)
        }  else {
          callback(null, mentors);
        }
      })
    // User.find({$or: [
    //   {username: mentorInfo.username}, 
    //   {fname: mentorInfo.fname},
    //   {lname: mentorInfo.lname},
    //   {rating: { $gte: mentorInfo.minRating} },
    //   {topicTags: { $in: mentorInfo.topics } }]
    // }, function (err, mentors){
    //   if (!err){
    //     console.log(mentors);
    //     callback(null, mentors);
    //   }
    //   else{
    //     callback(err);
    //   } 
    // }).lean();
  },

  addReview: function(studentUsername, mentorUsername, title, text, rating, reviewDate, callback){
    User.update({ username: mentorUsername }, 
      { $push: { reviews: [{ 
        title: title,
        username: studentUsername,
        text: text,
        rating: rating,
        reviewDate: new Date()}] } }, 
      { upsert: true }, function(err) {
        if (!err){
          //update rating based on avg of review ratings
          var query = User.find({ username: mentorUsername });
          query.select('reviews');
          query.exec(function(err,mentor){
            if (!err){
              //get an array of all ratings
//              mentor.reviews.l
              
            }
            else console.log(err);
          });
        }
        else console.log(err);
      }); 
  },
  
  findAssignments: function(lessonId, callback){
    Lesson.findById(lessonId, function(err, lesson){
      if (!err){
        var assign = lesson.assignments;
        console.log('lesson.assignments:' +lesson.assignments);
        Assignment.find({_id :{$in: assign } }, function(err,assignments){
          callback(null, assignments);
        });
      }
    });
  },
  
  findLesson: function(lessonId, callback){
    Lesson.findById(lessonId, null, null, function(err, lesson){
      if (!err){
        callback(null, lesson);
      }
      else{
        callback(err);
      }
    });
  },

  findLessonByUser: function(username, callback){
    Lesson.find({$or: [{mentorUsername: username}, {studentUsername: username}]}, function(err,lessons){
      if (err){
        return callback(err);
      } 
      callback(null, lessons);
    })
  },
  
//  findAssignments: function(lessonId, callback){
//    Assignment.find({lessonId: lessonId}, function(err, assignments){
//      callback(null, assignments);
//    })
//  },
  
  addAssignment: function(assignment, lesson, callback){
    var a = new Assignment({ 
      name: assignment.name,
      text: assignment.text,
      type: assignment.type
      // ,feedback: assignment.feedback,
      // pickUrls: assignment.picUrls,
      // vidUrls: assignment.vidUrls,
      // comments: null
    });
    a.save(function(err, assignmentid){
      if (!err){
        console.log('addassignment lessonid' + lesson._id)
        console.log('addassignment' + lesson)
        console.log('addassignment assignmentid' + assignmentid)
        // Lesson.update({ _id: lesson}, {$push : {assignments: assignmentid._id}}, {upsert: true}).exec(function(err){
        //  if (err) console.log(err);
    //       return callback(null);
        // });
        Lesson.update({_id: lesson}, {$push: {assignments: assignmentid}}, function(err, lesson){
          if(err) return callback(err)
          callback(null, lesson);
        })
      }
      else callback(err);
    }); 
  },
  
  addAssignmentComment: function(assignmentId, commentObject, callback){
    Assignment.update({ _id: assignmentId },
      {comments: {$push: commentObject } }
      ).exec(function(err){
        if (err) console.log(err);
      });
  },
  
  addLessonChat: function(lessonId, chatObject, callback){
    Lesson.update({ _id: lessonId },
      { chats: {$push: chatObject} }
      ).exec(function(err){
      if (err) console.log(err);
    });
  },
  
  createLesson: function(lesson, callback){
    var l = new Lesson({
      name: lesson.name,
      mentorUsername: lesson.mentorUsername,
      studentUsername: lesson.studentUsername,
      dateStarted: new Date(),
    })
    l.save(function(err, lesson){
      if(err) return callback(err)
      User.update({ username: {$in: [lesson.mentorUsername, lesson.studentUsername]}}, {$addToSet: { lessons: lesson._id}}, {upsert:true, multi: true}, 
        function(err, numberAffected, raw){
          if (err) callback(err);
          callback(null, numberAffected, raw);
      });
    })
  },
  
  addMentor: function(studentUsername, mentorUsername, callback){
    User.update({ username: studentUsername }, 
      { $push: { mentors: mentorUsername } }, 
      { upsert: true }).exec(function(err,result){
        if (err) callback(err);
    });
  },    
  
  addMentorRequest: function(mentor, student, from, text, callback){
    //add mentor request to student record
    User.find({ username: mentor, $or: [{'requests.studentUsername': student},{'students': student}]}, function(err, user){
        if(err) return callback(err);
        console.log(user);
        if(user.length>0) return callback(err, 'Request or connection already exists');
        User.update({ username: {$in: [mentor, student]}}, 
          { $addToSet: { requests: { 
            studentUsername: student,
            mentorUsername: mentor,
            from: from,
            text: text,
            requestDate: new Date() } } }, 
            { upsert: true, multi: true}, function(err,result){
              console.log('done updating')
              if (err) return callback(err);
              callback(null, null, result);
        })  
      })
  },    
  confirmRequest: function(username, reqid, callback){
    User.findOne({username: username, 'requests._id': reqid}, function(err, user){
      if(err) return callback(err)
      var request = user.requests.id(reqid);
      console.log('request found:' + request)
      callback(null, request);
    })
  },

  removeRequest: function(reqid, callback){
    User.update({'requests._id': reqid}, {$pull: {requests: {_id:reqid}}}, {multi: true}, function(err, result){
      if(err) return callback(err)
      callback(null, result);
    })
  },

  updatePassword: function(username, newValue, callback){
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(userInfo.password, salt, function(err, pwdhash) {
            if (err) callback(err);
            User.update({ username: username }, { hash: pwdhash }, {}, function(err,result){
              if (err) callback(err);
              callback(null);
            });
        })
      });
  },    
  
  updateFname: function(username, newValue, callback){
    User.update({ username: username }, { fname: newValue }, {}, function(err, numberAffected, raw){
      if (err) callback(err);
      callback(null);
    });
  },    
    
  updateLname: function(username, newValue, callback){
    User.update({ username: username }, { lname: newValue }, {}, function(err, numberAffected, raw){
      if (err) callback(err);
      callback(null);
    });
  },    
    
  updatePicUrl: function(username, newValue, callback){
    User.update({ username: username }, { picUrl: newValue }, {}, function(err, numberAffected, raw){
      if (err) callback(err);
      callback(null);
    });
  },    
    
  addLesson: function(username, newValue, callback){
    User.update({ username: username }, {$addToSet: { lessons: newValue}}, {upsert:true}, function(err, numberAffected, raw){
      if (err) callback(err);
      callback(null);
    });
  },    
    
  // disconnect from database
  closeDB: function() {
    mongoose.disconnect();
  },

  // // get all the users
  // getUsers: function(callback) {
  //   User.find({}, ['username', '_id'], function(err, users) {
  //     callback(null, users);
  //   });
  // },
}