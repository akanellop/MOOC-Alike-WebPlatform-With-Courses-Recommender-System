const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const Routes = express.Router();
const PORT = 4000;

//import model schemas for database use
let UserAttend = require('./schemas/userattendance.model');
let Course = require('./schemas/course.model');
let UserInfo = require('./schemas/userInfo.model');

//initializing app and connecting to database
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/webappdbs', {useNewUrlParser: true});
const connection = mongoose.connection;

connection.once('open', function() {
    console.log("MongoDB database connection established successfully.");
})

app.use('/webappdbs', Routes);

app.listen(PORT, function() {
    console.log("Server is running on Port "+PORT);
});

//find the next id for newly signed up users
let nextUserId = 0;
UserInfo.find({},function(err,id){
    nextUserId = id[0].userid+1;
}).sort({"userid":-1}).limit(1);


//Returns the taken or proposed courses to be displayed according to what is demanded. 
Routes.route('/courses').get(function(req,res) {
    userId = Number(req.query.ID.split('|')[0])
    tab = Number(req.query.ID.split('|')[1])
    if (tab == 0){
        UserInfo.findOne({ "userid": userId}, (err,user) => {
            if(err) {
                res.status(400).send('Error');
            } else {
                if(user == null){
                    res.status(400).send('fromserver: User not found');
                }
            }
        }).then(student => {
            Course.find({ 
                'courseid': { $in: student.courses} 
            }, function(err, courses){ res.json(courses)});
        }).catch(error =>{
            console.log(error);
        });    
    }else if(tab==1){
        Course.find(function(err, courses){ res.json(courses)})
        .catch(error =>{console.log(error);
        });
    }else{
        UserInfo.findOne({ "userid": userId}, (err,user) => {
            if(err) {
                res.status(400).send('Error');
            } else {
                if(user == null){
                    res.status(400).send('fromserver: User not found');
                }
            }
        }).then(student => {
            Course.find({ 
                'courseid': { $in: student.proposed} 
            }, function(err, courses){ res.json(courses)});
        }).catch(error =>{
            console.log(error);
        });
    }
});
    
//Puts the newly submitted courses from a user into the database
Routes.route('/coursessubmit').post(function(req,res) {
    let selectedNew = req.body.selected;
    let id = Number(req.body.id);
    let selectedPrev = [];
    UserInfo.findOne({'userid': id},(err,user)=>{
        selectedPrev = user.courses;
        selectedNew.forEach((element) => {
            if(!selectedPrev.includes(element)){
                UserAttend.create({'userid':id,'courseid':Number(element),'score':0,'ratings':2})
                .then(e=>{
                    console.log('added new subject')
                });
            }
        })
        selectedPrev.forEach(element => {
            if(!selectedNew.includes(element)){
                UserAttend.findOneAndDelete({'userid':id,'courseid':Number(element)})
                .then(e=>{
                    console.log('deleted old subject')
                });
                
            }
        })
    }).then(exit =>{
        UserInfo.findOneAndUpdate({'userid':id}, { $set: {"courses": selectedNew}})
        .then(res.json('user edited successfully'))
        .catch(e => console.log(e));
    })
    
});
    
//Returns the demanded course's information and content to be displayed
Routes.route('/course/:ids').get(function(req,res) {
    let userId = req.params.ids.split('|')[0]
    let courseId = req.params.ids.split('|')[1]
    let data = {}
    UserAttend.findOne({'userid': userId,'courseid': courseId},(err,user)=>{
        if (user==null){
            Course.findOne({'courseid':courseId},(err,course)=>{
                data = {'userid':userId,'courseid':courseId,'ratings':0,'score':0,'content':course.types_of_content}
            }).then(something => {
                res.json(data)
            });
        }else{
            Course.findOne({'courseid':courseId},(err,course)=>{
                data = {'userid':userId,'courseid':courseId,'ratings':user.ratings,'score':user.score,'content':course.types_of_content}
            }).then(something => {
                res.json(data)
            });
        }
    });
});

//Puts the newly submitted score/progrees of a course from a specific user into the database
Routes.route('/newscore').post(function(req,res) {
    console.log(req.body)
    UserAttend.findOne({
        $and: [{
            'userid': req.body.userid
        }, {
            'courseid': req.body.courseid
        }]
    },(err,user)=>{
        if (user==null){
            res.status(404).send('new user entry failed');
        }else{
            user.score = req.body.score;
            user.save().then(user => {
                res.json(req.body.listToBeReturned);
            })
            .catch(err => {
                res.status(400).send('From server: Update not possible');
            });
        }
    });
});

//Puts the newly submitted rating of a course from a specific user into the database
Routes.route('/newrating').post(function(req,res) {
    UserAttend.findOne({
        $and: [{
            'userid': req.body.userid
        }, {
            'courseid': req.body.courseid
        }]
    },(err,user)=>{
        if (user==null){
            res.status(404).send('adding new user failed');
        }else{
            user.ratings = req.body.rating;
            user.save().then(user => {
                res.json('From server: User updated');
            })
            .catch(err => {
                res.status(400).send('From server: Update not possible');
            });
        }
    });
});

//Creates the newly signed up user
Routes.route('/signup').post(function(req,res) {
    let newUser = new UserInfo(req.body);
    UserInfo.findOne({'email': req.body.email},(err,user)=>{
        if (user==null){
            finalUserId = nextUserId;
            nextUserId = nextUserId +1;
            newUser.userid = finalUserId
            
            newUser.save()
            .then(res.json('user edited successfully'))
            .catch(err => {
                res.status(400).send('adding new user failed');
            });
        }else{
            res.status(400).send('Already Signed Up.');
        }
    });
});

//Authorizes the user login 
Routes.route('/login').post(function(req,res) {
    UserInfo.findOne({
        $and: [{
            'email': req.body.email
        }, {
            'password': req.body.password
        }]
    }, (err,user) => {
        if(err) {
            res.status(400).send('Error');
        } else {
            if(user == null){
                res.status(404).send('from server: User not found');
            }
            else{
                res.json(user)
            }
        }
    });
    
});



//Updating and Deleting aiding routes, not used by the frontside but from an API platform.
Routes.route('/update/:id').post(function(req, res) {
    UserInfo.findOneAndUpdate({'username':"user1939"},{$set:{'proposed':req.body.proposed }}).then(ok =>{
        res.json(ok)
    });
});
Routes.route('/delete/:id').post(function(req,res) {
    UserInfo.findOneAndDelete({'username':'geotholo'}).then( ok=>res.json(ok))
    console.log(Number(req.params.id))
});
