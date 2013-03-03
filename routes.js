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
		res.render('home.jade', {locals:{
				user: req.user}});
		});

	app.get('/register', LocalUser, function(req, res){
		res.render('register.jade', {locals:{
				user: req.user}});
		})

	app.post('/register', function(req, res){
		db.saveUser({
		password: req.param('password'),
		username: req.param('username')}
		, function(err,docs, msg) {
			if(docs == null){
				res.render('register.jade', {locals: {
					message: msg
				}})
			} else{
				res.redirect('/');
			}
		 	
		})
	})
	app.get('/about', LocalUser, function(req, res) {
		res.render('about.jade', {locals:{
				user: req.user}});
	})

	app.get('/dreams', LocalUser, function(req, res){
		res.render('dreams.jade',  {locals:{
				user: req.user}})
	})
	
	app.get('/resources', LocalUser, function(req, res){
		res.render('resources.jade',  {locals:{
				user: req.user}})
	})
	app.get('/upload', LocalUser, function(req, res){
		res.render('upload.jade', {locals:{
				user: req.user}})
	})

	app.post('/file-upload', function(req, res, next) {
	    console.log(req.body);
	    console.log(req.files);
	    var tmp_path = req.files.thumbnail.path;
	    db.saveFile({
			name: req.files.thumbnail.name,
			uploadpath: req.files.thumbnail.path,
			type: req.files.thumbnail.type
			}, function(err,docs) {
				if(err){
					res.render('upload.jade', {locals: {
					message: 'There was an upload error'
					}})
				}
				db.getFilePath(req.files.thumbnail.name, function(err, file){
			    	if(err) {}
			    	var target_path = file.path + file.uploadname;
			    	console.log(target_path);
				    fs.rename(tmp_path, target_path, function(err) {
				        if (err) throw err;
				        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
				   //      fs.unlink(tmp_path, function() {
				   //          if (err) throw err;
							res.render('upload.jade', {locals: {
								message: 'File uploaded to: ' + target_path + ' - ' + req.files.thumbnail.size + ' bytes'
								}})
				   //      });
				    });
			    }) 
		})
	    
	    
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
	