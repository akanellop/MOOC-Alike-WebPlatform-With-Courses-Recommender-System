const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let Course = new Schema({
    courseid:{
        type: Number
    },
    title:{
        type: String
    },
    coursefield: {
        type: String
    },
    proff_involvement:{
        type: String
    },
    types_of_content:{
        type: String
    },
    difficulty: {
        type: String
    }
},{ collection : 'courses' });
//coment fro commit
module.exports = mongoose.model('Course', Course);