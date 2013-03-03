var express = require('express'),
	passport = require('passport'),
	mongodb = require('mongodb'),
	mongoose = require('mongoose'),
	MemoryStore = express.session.MemoryStore,
  sessionStore = new MemoryStore(),
  cookie = require('cookie'),
  connect =require('connect');
  flash = require('connect-flash');


var app = express();

mongoose.connect(require('./configure'));

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.static('public'));
  app.use(express.cookieParser());
  app.use(express.bodyParser({uploadDir:'./public/uploads/'}));
  app.use(flash());
  app.use(express.methodOverride());
  app.use(express.session({ 
    store: sessionStore,
  	key:  'express.sid',
  	secret: 'signalandnoise'}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});

app.configure('development', function(){
	app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// var record_visit = function(req, res){
//     /* Connect to the DB and auth */
//     require('mongodb').connect(mongourl, function(err, conn){
//         conn.collection('ips', function(err, coll){
//             /* Simple object to insert: ip address and date */
//             object_to_insert = { 'ip': req.connection.remoteAddress, 'ts': new Date() };
//             /* Insert the object then print in response */
//             /* Note the _id has been created */
//             coll.insert( object_to_insert, {safe:true}, function(err){
//             res.send(JSON.stringify(object_to_insert));
//             });
//         });
//     });
// }
// var print_visits = function(req, res){
//     /* Connect to the DB and auth */
//     require('mongodb').connect(mongourl, function(err, conn){
//         conn.collection('ips', function(err, coll){
//             coll.find({}, {limit:10, sort:[['_id','desc']]}, function(err, cursor){
//                 cursor.toArray(function(err, items){
//                     res.writeHead(200, {'Content-Type': 'text/plain'});
//                     for(i=0; i<items.length;i++){
//                         res.write(JSON.stringify(items[i]) + "\n");
//                     }
//                     res.end();
//                 });
//             });
//         });
//     });
// }


// routes



require('./routes')(app);
var port = (process.env.VMC_APP_PORT || 3000);

app.listen(port, function() {
  console.log("Listening on " + port);
});

