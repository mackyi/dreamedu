var User = require('./models/user');

var db = require('./accessDB');

var passport = require('passport'),
	fs = require('fs');

function checkAuth(req, res, next) {
    is_logged_in = !!req.session.passport.user;
    next();
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

function LocalUser(req, res, next){
	res.locals.user = req.user;
  	next();
}

function findByUsername(username, fn) {
  user = User.findOne({ username: username});
  if(user){
    return fn(null, user);
  }
  return fn(null, null);
}


function checkRegister(req, res, next){
	console.log('checking register');
	username = req.param('username');
	console.log(username);
	if(db.hasUsername(req.param('username'))){
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
//			mentors.topicTags= mentors.topicTags.toString();
			res.render('find.jade', {locals:{results: mentors, user: req.user}})
		})
		// mentors ={
		// 	mentor1: {
		// 		fname: 'Mack',
		// 		lname: 'Yi',
		// 		rating: '0',
		// 		topicTags: 'Nothing, Sleeping, Chemistry, Math, Algebra',
		// 		picUrl: 'http://sphotos-a.xx.fbcdn.net/hphotos-ash3/532386_4200069688061_127509570_n.jpg',
		// 		username: 'mackyi'
		// 	}
		// }
		// res.render('find.jade', {locals:{results: mentors, user: req.user}})
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
	app.get('/about', LocalUser, function(req, res) {
		res.render('about.jade');
	})

	app.get('/dreams', LocalUser, function(req, res){
		res.render('dreams.jade')
	})
	
	app.get('/resources', LocalUser, function(req, res){
		res.render('resources.jade')
	})

	app.get('/getinvolved', LocalUser, function(req, res){
		res.render('getinvolved.jade')
	})

	app.get('/upload', LocalUser, function(req, res){
		res.render('upload.jade')
	})

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
}
	