var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var collection = 'request';

var Schema = new Schema({
	studentUsername: String,
	mentorUsername: String,
	from: String,
	text: String,
	requestDate: Date
});

module.exports = mongoose.model(collection, Schema);