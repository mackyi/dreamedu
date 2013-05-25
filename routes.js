var db = require('./accessDB');
var passport = require('passport'),
	fs = require('fs');

function checkAuth(req, res, next) { //unused
    is_logged_in = !!req.session.passport.user;
    next();
}

function ensureAuthenticated(req, res, next) { //unused
  if (req.isAuthenticated()) { return next(); }
  res.render('login.jade', {locals: { message: 'You must be logged in to perform this action'}})
}

function LocalUser(req, res, next){
	res.locals.user = req.user;
  	next();
}

function checkRegister(req, res, next){ //not used atm
	console.log('checking register');
	username = req.param('username');
	console.log(username);
	if(db.hasUsername(req.param('username'))){ //hasUsername is not implemented
		res.render('register.jade', {locals: {
				message: 'Username is taken'
		}})
	} else if(req.param('password')!=req.param('confirm')){
		res.render('register.jade', {locals: {
				message: 'Passwords do not match'
		}})
	} else{
		console.log('register is fine');
		return next();
	}
}

module.exports = function(app){
	app.get('/', LocalUser, function(req, res) {
		res.render('home2.jade');
		});

	app.get('/register', LocalUser, function(req, res){
		res.render('register.jade');
		})
	app.get('/find', LocalUser, function(req, res){
		res.render('find.jade');
	}),
	app.post('/find', LocalUser, function(req, res){
		mentorInfo = {
			name: req.param('parameters').split(/[\s\W]+/)
		}
		console.log(mentorInfo);
		console.log(req.body);

		db.findMentor(mentorInfo, function(err, mentors){
			console.log(mentors);
			res.render('find.jade', {locals:{results: mentors, user: req.user}})
		})
	}),
	app.post('/register', LocalUser, function(req, res){
		console.log(req.body)
		db.saveUser({
			password: req.param('password'),
			username: req.param('username'),
			userType: req.param('type'),
			fname: req.param('firstName'),
			lname: req.param('lastName'),
			picUrl: req.param('picUrl')
			}
			, function(err,docs, msg) {
				if(!docs){
					res.render('register.jade', {locals: {
						message: msg
					}})
				} else{
					res.redirect('/');
				} 	
		})
	}),

	app.get('/user/:uid', function(req, res){
		var username = req.params.uid;
		db.findByUsername(username, function(err, user){
			if(err) {return}
			var page;
			if(!user) res.render('home.jade', {locals: {
				user: req.user, message: 'User page does not exist'
			}})	
			else{
				db.findLessonByUser(username, function(err, lessons){
					var lessons = lessons
					if(user.userType == 'mentor'){
						if(req.user && user.username === req.user.username){
							page = 'mentor-self.jade'
						} else {
							page = 'mentor.jade'
						}				
					} else{
						if(req.user && user.username === req.user.username){
							page ='student-self.jade'
						} else{
							page = 'student.jade'
						}
					}
					res.render(page, {locals: {
						user: req.user, pageof: user, lessons: lessons
					}})
				}
			)	
		}
	})}),

	app.get('/about', LocalUser, function(req, res) {
		res.render('about.jade');
	}),

	app.get('/dreams', LocalUser, function(req, res){
		res.render('dreams.jade')
	}),
	
	app.get('/resources', LocalUser, function(req, res){
		res.render('resources.jade')
	}),

	app.get('/getinvolved', LocalUser, function(req, res){
		res.render('getinvolved.jade')
	}),

	app.get('/upload', LocalUser, function(req, res){
		res.render('upload.jade')
	}),

	app.post('/updateinfo/picUrl', function(req, res){
		if(req.user){
			db.updatePicUrl(req.user.username, req.param('picUrl'), function(err){
				res.redirect('/user/' + req.user.username)
			});
		} else{
			res.render('home.jade', {locals: {user: req.user, message: "You do not have permission to do that"}});
		}
	}),
	app.post('/updateinfo/lname', function(req, res){
		if(req.user){
			db.updateLname(req.user.username, req.param('lname'), function(err){
				res.redirect('/user/' + req.user.username)
			});
		} else{
			res.render('home.jade', {locals: {user: req.user, message: "You do not have permission to do that"}});
		}
	}),
	app.post('/updateinfo/fname', function(req, res){
		if(req.user){
			db.updateFname(req.user.username, req.param('fname'), function(err){
				res.redirect('/user/' + req.user.username)
			});
		} else{
			res.render('home.jade', {locals: {user: req.user, message: "You do not have permission to do that"}});
		}
	}),
	app.post('/updateinfo/password', function(req, res){
		if(req.user){
			db.updatePassword(req.user.username, req.param('password'), function(err){
				res.redirect('/user/' + req.user.username)
			});
		} else{
			res.render('home.jade', {locals: {user: req.user, message: "You do not have permission to do that"}});
		}
	}),
	app.post('/file-upload', LocalUser, function(req, res) {
	    console.log(req.body);
	    console.log(req.user._id); 
	    console.log(req.files);
	    var tmp_path = req.files.thumbnail.path;
	    db.saveFile({
			name: req.files.thumbnail.name,
			path: './public/uploads/' + req.user.username +'/',
			type: req.files.thumbnail.type
			}, function(err,docs) {
				if(err){
					res.render('upload.jade', {locals: {
					message: 'There was an upload error'
					}})
				} else {
					var target_path = docs.path + docs.filename;
					fs.mkdir(docs.path, function(err){
						console.log('saved file:' + docs);
						console.log(target_path);
						fs.rename(tmp_path, target_path, function(err){
							if(err){
								res.render('upload.jade', {locals: {
									message: 'There was a database error with the file path'
								}})
							} else{
								fs.unlink(tmp_path, function(){
									if(err) callback(err);
									res.render('upload.jade', {locals: {
										message: 'File uploaded to: ' + target_path + ' - ' + req.files.thumbnail.size + ' bytes'
									}})
								})
							}		
						})
					})
				}

			})   
	});
	
	app.get('/uploads/:uname/:uuid/:file', function(req, res){
	  	var uname = req.params.uname
	  		,uuid = req.params.uuid
	    	,file = req.params.file;
	    res.download('./public/uploads/' + uname + '/' +uuid + '/' + file);
	  // req.user.mayViewFilesFrom(uid, function(yes){
	   //  	if (yes) {
	   //    		res.sendfile('/uploads/' + uid + '/' + file);
	   //  	} else {
	   //    		res.send(403, 'Sorry! you cant see that.');
	   //  	}
	  	// });
	});


	app.get('/login', LocalUser, function(req, res) {
		res.render('login.jade', {locals:{
				user: req.user}})
	})

	app.get('/logout', function(req, res){
	     req.logout();
	     res.redirect('/');
	})
	// app.post('/login', 
	// 		passport.authenticate('local', {successRedirect: '/',
	//                               			failureRedirect: '/login',
	//                               			failureFlash: true})
	// 	);
	app.post('/login', function(req, res, next) {
		  passport.authenticate('local', function(err, user, info) {
		    if (err) { return next(err); }
		    if (!user) { return res.render('login.jade', {locals: {
		    	message: "Wrong password or username"}}); };
		    req.logIn(user, function(err) {
		      if (err) { return next(err); }
		      return res.redirect('/');
		    });
		  })(req, res, next);
		});

	app.get('/writeRequest/:toname', ensureAuthenticated, function(req, res){
		var to = req.param('toname');
		var student, mentor;
		db.findByUsername(to, function(err, user){
			if(err){
				res.redirect('/home');
			} else {
				res.render('writeRequest.jade', {locals: {user: req.user, other: user}})
			}
		})
		
	}),

	app.post('/sendRequest/:myrole', LocalUser, function(req, res){
		var role = req.param('myrole'),
			text= req.param('text'),
			mentor, student, 
			from=req.param('from'),
			to = req.param('to');
		if(role ==='Mentor'){
			mentor = from
			student = to
		} else {
			mentor = to
			student = from
		}
		console.log('processed info')
		db.addMentorRequest(mentor, student, from, text, function(err, message){
			console.log('db worked')
			if(err){
				res.redirect('/');
			} else if (message){
				res.render('home2.jade', {locals: {message: message}}); //need something better than this. redirect + message. flash? 
			} else {
				res.redirect('/user/' + to);
			}
		})
	}),

	app.get('/rejectRequest/:requestid', ensureAuthenticated, LocalUser, function(req, res){
		var reqid = req.param('requestid');
		db.confirmRequest(req.user.username, reqid, function(err, request){ //confirm this is the right user doing this...
			if(err){
				res.redirect('/');
			} else if(!request){
				res.render('/user/' + req.user.username, {locals: { message: 'Permission denied'}})
			} else {
				db.removeRequest(reqid, function(err, request){
					if(err){
						res.render('home2.jade', {locals: { user: req.user, message: 'Request removal failed'}})
					} else {
						res.render('home2.jade', {locals: { user: req.user, message: 'Request successfully rejected'}})
					}
				})
			}
		})
	})

	app.get('/acceptRequest/:requestid', function(req, res){
		var reqid = req.param('requestid');
		db.confirmRequest(req.user.username, reqid, function(err, request){ //confirm this is the right user doing this...
			if(err){
				res.redirect('/');
			} else if(!request){
				res.render('/user/' + req.user.username, {locals: { message: 'Permission denied'}})
			} else {
				lessonInfo = {
					studentUsername : request.studentUsername,
					mentorUsername : request.mentorUsername,
					name : request.studentUsername + '-' + request.mentorUsername
				}
				db.createLesson(lessonInfo, function(err, numberAffected, raw){
					if(err) return res.redirect('/')
					db.removeRequest(reqid, function(err, request){
						if(err){
							res.render('home2.jade', {locals: { user: req.user, message: 'Request removal failed'}}) //badd
						} else {
							res.render('home2.jade', {locals: { user: req.user, message: 'Request successfully accepted'}}) //badd
						}
					})	
				})
			}
		})
	})

	app.get('/lesson/:lid', ensureAuthenticated, function(req, res){
		lid = req.params.lid;
		db.findLesson(lid, function(err, lesson){
			db.findAssignments(lid, function(err, assignments){
				console.log(assignments);
				res.render('lesson.jade', {locals: { user: req.user, lesson: lesson, assignments: assignments}})
			})
		})
	})

	app.post('/addAssignment/:lid', function(req, res){
		var lid = req.params.lid;
		console.log(lid);
		var assignmentInfo = {
			name: req.param('name'),
			text: req.param('text'),
			type: 'text'
		}
		console.log(assignmentInfo)
		db.addAssignment(assignmentInfo, lid, function(err){
			if(!err) res.redirect('/lesson/' + lid);
		})
	})
}
	