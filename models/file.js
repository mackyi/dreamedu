var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    passport = require('passport'),
    uuid = require('node-uuid'),
    util = require('util');

var collection = 'file';

var schema = new Schema({
  filename: {type: String, set: changeName},
  uploadname: {type: String},
  type: {type: String},
  path: {type: String, default: './public/uploads/'}
});

function changeName(filename){
  this.uploadname = uuid.v1() + filename;
  return filename;
}


module.exports = mongoose.model(collection, schema);