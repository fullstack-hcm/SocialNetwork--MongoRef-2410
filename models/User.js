let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email: String,
    createAt: {
        type: Date,
        default: Date.now
    },
    /**
     * Những user đã yêu cầu kết bạn
     */ 
    usersRequest: [
        {
            type: Schema.Types.ObjectId,
            ref : 'user'
        }
    ],
    /**
     * Những user mình đã gửi yêu cầu
     */ 
    guestsRequest: [
        {
            type: Schema.Types.ObjectId,
            ref : 'user'
        }
    ],

    friends: [
        {
            type: Schema.Types.ObjectId,
            ref : 'user'
        }
    ]
});

let UserModel = mongoose.model('user', userSchema);

exports.USER_MODEL = UserModel;