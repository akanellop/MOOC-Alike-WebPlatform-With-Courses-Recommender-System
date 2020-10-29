const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let UserInfo = new Schema({
    userid:{
        type: Number
    },
    username:{
        type: String
    },
    password:{
        type: String
    },
    email:{
        type: String
    },
    courses:{
        type: Array
    },
    proposed:{
        type: Array
    }
},{ collection : 'userinfo' });
//coment fro commit
module.exports = mongoose.model('UserInfo', UserInfo);