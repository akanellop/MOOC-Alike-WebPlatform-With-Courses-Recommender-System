const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let UserAttendance = new Schema({
    userid:{
        type: Number
    },
    courseid:{
        type: Number
    },
    score:{
        type: Number
    },
    ratings:{
        type: Number
    }
},{ collection : 'users' }
);
//coment fro commit
module.exports = mongoose.model('UserAttendance', UserAttendance);