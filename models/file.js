var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    passport = require('passport'),
    uuid = require('node-uuid'),
    util = require('util');

var collection = 'file';

var schema = new Schema({
  filename: {type: String, set: changeName}, //original upload name
  type: {type: String}, //file type
  //the file can be accessed at path+uploadname
//  uploadname: String,
  path: {type: String, default: './public/uploads/'}, 
  date: Date, //date of upload
  uploader: String, //uploader username
  comments: String
});

function changeName(filename){
  this.path +=uuid.v1() + '/';
//  this.uploadname = uuid.v1() + filename;
  return filename;
}


module.exports = mongoose.model(collection, schema);