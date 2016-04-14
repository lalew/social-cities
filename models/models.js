var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var UserSchema = new Schema(
{
    // "twitterID": String,
    // "token": String,
    // "username": String,
    // "displayName": String,
    // "photo": String
    id: String,
    token: String,
    username: String,
    displayname: String

});
//);

// exports.Message = Mongoose.model('User', UserSchema);
exports.models = mongoose.model('User', UserSchema);

        // newUser.twitter.id = profile.id;
        // newUser.twitter.token = profile.token;
        // newUser.twitter.username = profile.username;
        // newUser.twitter.displayName = profile.displayName;

