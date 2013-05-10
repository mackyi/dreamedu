var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    File = require('./file');

var collection = 'assignment';

var assignmentSchema = new Schema({
	type: String,
	name: String,
	text: String,
	posts: [{
		username: String,
		date: Date,
		text: String,
		type: String,
		file: File
	}]
});

module.exports = mongoose.model(collection, assignmentSchema);