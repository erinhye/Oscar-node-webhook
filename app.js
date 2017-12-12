/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// [START app]
const express = require('express');
const bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config/config');
var glob = require('glob');
var moment = require('moment');
const Q = require('q');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var flash = require('connect-flash');
var mongoStore = require('connect-mongo')(session);
var localStrategy = require('passport-local').Strategy;
var request = require('request');
// var namelist = [];
// var titlelist = [];
// var datelist = [];
// var monthlist = [];
// var yearlist = [];


mongoose.Promise = global.Promise;
var mongoDB = mongoose.connect(config.db, {
  useMongoClient: true
});
mongoDB
.then(function (db) {
  console.log('mongodb has been connected');
})
.catch(function (err) {
  console.log('error while trying to connect with mongodb');
});

var models = glob.sync(config.root + '/models/*.js');
models.forEach(function (model) {
  require(model);
});
var groupModel = mongoose.model('groups'),
    userModel = mongoose.model('users'),
    taskModel = mongoose.model('tasks'),
    sessionModel = mongoose.model('sessions');

const app = express();
// module.exports = require('./config/express')(app, config);

taskModel.find({'email':'hyeerin@hye.com', 'deleted':false}).sort({date:-1}).exec(function(err, Contents){
             // db에서 날짜 순으로 데이터들을 가져옴
        if(err) throw err;

        // console.log(Contents);

        Contents.forEach(function(item, index){

        // console.log(Contents[index]['title']);
      })

  });

  //testing codes

  // var d = new Date();
  // var day = d.getDay(); // 0- sunday
  // console.log(day);
  //
  // var momentemp = new Date().toISOString().slice(0,10);
  // console.log(momentemp);
  // var num = 8-day+1;
  // console.log(num);
  // var dltemp = moment(momentemp, 'YYYY-MM-DD').add(8-day+1, 'days').toISOString().slice(0,10);
  // console.log(dltemp);
  // var email = 'hye@hye.com';
  // //promise
  // findtasksbydl(dltemp, email);

//   let start = moment('2017-01-15');
// console.log(moment().add(7, 'days'));
// console.log(start.add(7, 'days'));


  //testing codes

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.use(cookieParser());
app.use(function (req, res, next) {
      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.header('Expires', '-1');
      res.header('Pragma', 'no-cache');
      next();
  });
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'hi?delryn',
    store: new mongoStore({
      url: config.db,
      collection: 'sessions',
      ttl: 1 * 24 * 60 * 60
    })
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());


// 패스포트 로그인 성공 시 세션 처리
passport.serializeUser(function (user, done) {
    done(null, user);
});

// 패스포트 페이지 이동 시 세션 처리
// passport 공홈에선 페이지 이동할때마다 serializeUser의 세션값을 이용하여 정보를 검색해서 deserializeUser를 사용하라고 하지만 유저정보가 작기 때문에 안씀
passport.deserializeUser(function (user, done) {
    done(null, user);
});

// local Strategy 세팅
passport.use(new localStrategy({
  usernameField: 'email',
  passwordField : 'password',
  passReqToCallback : true
},
  function (req, email, password, done)
  {
    userModel.findOne({email: security.xssFilter(email), password: security.changeHash(password)}, function(err, User){
      if (err) {
        throw err;
      } else if (!User) {
        return done(null, false, {message: '등록된 이메일 주소가 없거나 비밀번호가 틀렸습니다.'});
      } else {
        return done(null, User);
      }
    });
  }
));



app.get('/', (req, res) => {
  res.status(200).send(req.user.email).end();
  console.log(req.user);
  console.log("REQUEST");
});

app.get('/webhook', (req, res) => {
  console.log("GET");
  console.log(req.user);
});

app.post('/webhook', function(req, res) {

  // request.get('http://oscar.hyesuh.com:8080/', {
  //     'auth': {
  //       'bearer': 'bearerToken'
  //     }
  //   });

    var resList = [];
    var speech = "";
    var dltemp;
    var momentemp;
    var email = req.body.originalRequest.data.exampleMessage;
    // var sessionid = req.session.email;
    // console.log("SESSION"+req.session.email);

    // console.log(req.session.cookie);

    // console.log("SESSION USEREMAIL"+req.session.user.email);

    // searchsessionid(sessionid)
    // .then(function(result) {
    //   if(result.length <= 0) {
    //     var session = new sessionModel({
    //       email: email,
    //       sessionid: sessionid
    //     });
    //     session.save(function(err){//저장
    //       if (err) {
    //         console.log(err);
    //         throw err;
    //       } else {
    //         console.log("SAVED");
    //       }
    //     });
    //   }
    //   else {
    //     console.log("EMAILLL");
    //     console.log(result);
    //
    //   }
    //   // console.log('1st Random number:', result);
    // })
    // .catch(function(err) {
    //   console.log('Error ocuured:', err.message);
    // });

    if(req.body.result.action == 'task.add-yes') {
      speech = "";
      var result = req.body.result;
      var parameters = result.parameters;
      var givenname = parameters.givenname;
      var tasktitle = parameters.tasktitle;

      var tmp = tasktitle.substring(5, tasktitle.length);
      tasktitle = tmp;

      if (givenname == "") {
        speech = "the Task "+tasktitle+" has been added";
      }
      else {
        speech = "the Task "+tasktitle+" with "+givenname+" has been added";
      }
      return res.json({
          speech: speech,
          displayText: speech,
          data: {'tasktitle':tasktitle,
            'given-name':givenname,
            'act':"add",
            'email':email},
          source: 'apiai-Oscar'
      });

    }

    if(req.body.result.action == 'task.delete-yes') {
      speech = "";
      var result = req.body.result;
      var parameters = result.parameters;
      var groupname = parameters.groupname;
      var tasktitle = parameters.tasktitle;

      var tmp = tasktitle.substring(5, tasktitle.length);
      tasktitle = tmp;

      var grArray = groupname.split(' ');
      console.log(grArray[2]);

          speech = "the Task "+tmp+" has been deleted";

          console.log(dltemp);
          return res.json({
              speech: speech,
              displayText: speech,
              data: {'tasktitle':tmp,
                'groupname':grArray[2],
                'act':"deletetask",
                'email':email},
              source: 'apiai-Oscar'
          });


    }
    else if(req.body.result.action == 'help') {
      speech = "";
      var result = req.body.result;
      var parameters = result.parameters;

      speech = "I'm going to show you some great examples and the PERFECT guideline! (you SHOULD check the guideline)";

      return res.json({
          speech: speech,
          displayText: speech,
          data: {'act':"help",
            'email':email,
            'link':"https://gist.github.com/erinhye/8d48032ad5cd42cbd341ec17ed4750ec",
            'linkname':"Ask him to what? (GUIDELINE-KR)",
            'help-title':'["Add a task", "Find tasks", "Delete a task", "Add a group", "Delete a group", "Recomendation"]',
            'help':'["I\'d like to add a task [TASKNAME] in a group called [EXISTING-GROUPNAME], tomorrow", "I\'m looking for important tasks in a group called [EXISTING-GROUPNAME], next wednesday", "I\'d like to delete a task [TASKNAME] in a group called [EXISTING-GROUPNAME]", "I\'d like to add a group called [GROUPNAME]", "I\'d like to delete a group called [EXISTING-GROUPNAME]", "What do you think I should do?"]'
            },
          source: 'apiai-Oscar'
      });

    }

    else if(req.body.result.action == 'searching.deadline') {
      speech = "";
      var result = req.body.result;
      var parameters = result.parameters;
      var deadline = parameters.deadline;
      console.log(deadline);
      var dlArray = deadline.split(' ');
      console.log(dlArray[1]);

      if (dlArray[1] == 'Monday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday
        //console.log(dltemp);
        console.log("MONDAY");

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(1, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+1, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }

        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }

        //promise
        //email = 'hye@hye.com';
        findtasksbydl(dltemp, email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });

        // speech = "ADDDDDDDD";

        /////PROMISE MUST BE HERE (and return res.json)


      }
      else if (dlArray[1] == 'Tuesday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(2, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+2, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        //promise
        //email = 'hye@hye.com';
        findtasksbydl(dltemp, email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });
      }
      else if (dlArray[1] == 'Wednesday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(3, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+3, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        //promise
        //email = 'hye@hye.com';
        findtasksbydl(dltemp, email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });
      }
      else if (dlArray[1] == 'Thursday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(4, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+4, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        //promise
        //email = 'hye@hye.com';
        findtasksbydl(dltemp, email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });
      }
      else if (dlArray[1] == 'Friday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(5, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+5, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        //promise
        //email = 'hye@hye.com';
        findtasksbydl(dltemp, email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });
      }
      else if (dlArray[1] == 'Saturday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(6, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+6, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        //promise
        //email = 'hye@hye.com';
        findtasksbydl(dltemp, email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });
      }
      else if (dlArray[1] == 'Sunday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+7, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        //promise
        //email = 'hye@hye.com';
        findtasksbydl(dltemp, email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });
      }
      else if (deadline == 'Tomorrow') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday
        console.log(dltemp);

        momentemp = new Date().toISOString().slice(0,10);
        dltemp = moment(momentemp, 'YYYY-MM-DD').add(1, 'days').toISOString().slice(0,10);
        //promise
        //email = 'hye@hye.com';
        findtasksbydl(dltemp, email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });

        // speech = "ADDDDDDDD";

        /////PROMISE MUST BE HERE (and return res.json)


      }
      else if (deadline == 'Today') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday
        console.log(dltemp);

        momentemp = new Date().toISOString().slice(0,10);
        console.log(momentemp);
        dltemp = moment(momentemp, 'YYYY-MM-DD').add(0, 'days').toISOString().slice(0,10);
        //promise
        //email = 'hye@hye.com';
        findtasksbydl(momentemp, email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });

        // speech = "ADDDDDDDD";

        /////PROMISE MUST BE HERE (and return res.json)


      }
      else {

      }

      function returnSpeech(result) {
        if(result.length <= 0) {
          speech = "You don't have any tasks "+deadline+"!";

          return res.json({
              speech: speech,
              displayText: speech,
              data: {'act':"notfound", 'email':email},
              source: 'apiai-Oscar'
          });

        }
        else {
          speech = "Oh now I've found "+result.length+" tasks "+deadline+" here!";
          console.log("res2");

          console.log(result);
          return res.json({
              speech: speech,
              displayText: speech,
              data: {'resList':result,
                'act':"found",
                'email':email},
              source: 'apiai-Oscar'
          });
        }
      }


    }

    else if(req.body.result.action == 'task.adddeadline-yes') {
      speech = "";
      var result = req.body.result;
      var parameters = result.parameters;
      var deadline = parameters.deadline;
      var tasktitle = parameters.tasktitle;
      var tmp = tasktitle.substring(5, tasktitle.length);
      tasktitle = tmp;

      console.log(tmp);

      var dlArray = deadline.split(' ');
      console.log(dlArray[1]);


      if (dlArray[1] == 'Monday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday
        //console.log(dltemp);
        console.log("MONDAY");

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(1, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+1, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        returnSpeech2(dltemp);


      }

      else if (dlArray[1] == 'Tuesday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(2, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+2, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        returnSpeech2(dltemp);
      }
      else if (dlArray[1] == 'Wednesday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(3, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+3, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        returnSpeech2(dltemp);
      }
      else if (dlArray[1] == 'Thursday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(4, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+4, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        returnSpeech2(dltemp);
      }

      else if (dlArray[1] == 'Friday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(5, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+5, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        returnSpeech2(dltemp);
      }

      else if (dlArray[1] == 'Saturday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(6, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+6, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        returnSpeech2(dltemp);
      }

      else if (dlArray[1] == 'Sunday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+7, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        returnSpeech2(dltemp);
      }

      else if (deadline == 'Tomorrow') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday
        console.log(dltemp);

        momentemp = new Date().toISOString().slice(0,10);
        dltemp = moment(momentemp, 'YYYY-MM-DD').add(1, 'days').toISOString().slice(0,10);
        //promise
        //email = 'hye@hye.com';
        console.log(dltemp);
        returnSpeech2(dltemp);
      }

      else if (deadline == 'Today') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday
        console.log(dltemp);

        momentemp = new Date().toISOString().slice(0,10);
        console.log(momentemp);
        dltemp = moment(momentemp, 'YYYY-MM-DD').add(0, 'days').toISOString().slice(0,10);
        //promise
        //email = 'hye@hye.com';
        console.log(dltemp);
        returnSpeech2(dltemp);
      }

      function returnSpeech2(dltemp) {
          speech = "Your task "+tmp+" "+deadline+" has been added";

          console.log(dltemp);
          return res.json({
              speech: speech,
              displayText: speech,
              data: {'tasktitle':tmp,
                'deadline':dltemp,
                'act':"adddeadline",
                'email':email},
              source: 'apiai-Oscar'
          });
      }

    }


    else if(req.body.result.action == 'task.addgroupname-yes') {
      speech = "";
      var result = req.body.result;
      var parameters = result.parameters;
      var groupname = parameters.groupname;
      var tasktitle = parameters.tasktitle;
      var tmp = tasktitle.substring(5, tasktitle.length);
      tasktitle = tmp;

      var grArray = groupname.split(' ');
      console.log(grArray[2]);

      speech = "the Task "+tasktitle+" in "+grArray[2]+" has been added";
      return res.json({
          speech: speech,
          displayText: speech,
          data: {'tasktitle':tasktitle,
            'groupname':grArray[2],
            'act':"addgroupname",
            'email':email},
          source: 'apiai-Oscar'
      });

    }


    else if(req.body.result.action == 'task.addsuperimp-yes') {
      speech = "";
      var result = req.body.result;
      var parameters = result.parameters;
      var tasktitle = parameters.tasktitle;
      var tmp = tasktitle.substring(5, tasktitle.length);
      tasktitle = tmp;

      speech = "the SUPER IMPORTANT Task "+tasktitle+" has been added";

      return res.json({
          speech: speech,
          displayText: speech,
          data: {'tasktitle':tasktitle,
            'act':"addsuperimp",
            'email':email},
          source: 'apiai-Oscar'
      });

    }

    else if(req.body.result.action == 'add.group-yes') {
      speech = "";
      var result = req.body.result;
      var parameters = result.parameters;
      var groupname = parameters.groupname;

      var grArray = groupname.split(' ');
      console.log(grArray[2]);

      speech = "the group called "+grArray[2]+" has been added";

      return res.json({
          speech: speech,
          displayText: speech,
          data: {'groupname':grArray[2],
            'act':"addagroup",
            'email':email},
          source: 'apiai-Oscar'
      });

    }

    else if(req.body.result.action == 'delete.group-yes') {
      speech = "";
      var result = req.body.result;
      var parameters = result.parameters;
      var groupname = parameters.groupname;

      var grArray = groupname.split(' ');
      console.log(grArray[2]);

      speech = "the group called "+grArray[2]+" has been deleted";

      return res.json({
          speech: speech,
          displayText: speech,
          data: {'groupname':grArray[2],
            'act':"deleteagroup",
            'email':email},
          source: 'apiai-Oscar'
      });

    }

    else if(req.body.result.action == 'task.adddeadlinegroupname-yes') {
      speech = "";
      var result = req.body.result;
      var parameters = result.parameters;
      var deadline = parameters.deadline;
      var tasktitle = parameters.tasktitle;
      var tmp = tasktitle.substring(5, tasktitle.length);
      tasktitle = tmp;

      var groupname = parameters.groupname;

      var grArray = groupname.split(' ');
      console.log(grArray[2]);

      console.log(tmp);

      var dlArray = deadline.split(' ');
      console.log(dlArray[1]);


      if (dlArray[1] == 'Monday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday
        //console.log(dltemp);
        console.log("MONDAY");

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(1, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+1, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }

        returnSpeech2(dltemp);


      }

      else if (dlArray[1] == 'Tuesday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(2, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+2, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        returnSpeech2(dltemp);
      }
      else if (dlArray[1] == 'Wednesday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(3, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+3, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
          // dltemp = dltemp-7;
        }
        console.log(dltemp);
        returnSpeech2(dltemp);
      }
      else if (dlArray[1] == 'Thursday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(4, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+4, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        returnSpeech2(dltemp);
      }

      else if (dlArray[1] == 'Friday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(5, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+5, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        returnSpeech2(dltemp);
      }

      else if (dlArray[1] == 'Saturday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(6, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+6, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        returnSpeech2(dltemp);
      }

      else if (dlArray[1] == 'Sunday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+7, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        returnSpeech2(dltemp);
      }

      else if (deadline == 'Tomorrow') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday
        console.log(dltemp);

        momentemp = new Date().toISOString().slice(0,10);
        dltemp = moment(momentemp, 'YYYY-MM-DD').add(1, 'days').toISOString().slice(0,10);
        //promise
        //email = 'hye@hye.com';
        console.log(dltemp);
        returnSpeech2(dltemp);
      }

      else if (deadline == 'Today') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday
        console.log(dltemp);

        momentemp = new Date().toISOString().slice(0,10);
        console.log(momentemp);
        dltemp = moment(momentemp, 'YYYY-MM-DD').add(0, 'days').toISOString().slice(0,10);
        //promise
        //email = 'hye@hye.com';
        console.log(dltemp);
        returnSpeech2(dltemp);
      }

      function returnSpeech2(dltemp) {
          speech = "Your task "+tmp+" "+deadline+" in "+grArray[2]+" has been added";

          console.log(dltemp);
          return res.json({
              speech: speech,
              displayText: speech,
              data: {'tasktitle':tmp,
                'groupname':grArray[2],
                'deadline':dltemp,
                'act':"adddeadlinegroupname",
                'email':email},
              source: 'apiai-Oscar'
          });
      }

    }

    else if(req.body.result.action == 'task.adddeadlineimp-yes') {
      speech = "";
      var result = req.body.result;
      var parameters = result.parameters;
      var deadline = parameters.deadline;
      var tasktitle = parameters.tasktitle;
      var tmp = tasktitle.substring(5, tasktitle.length);
      tasktitle = tmp;

      console.log(tmp);

      var dlArray = deadline.split(' ');
      console.log(dlArray[1]);


      if (dlArray[1] == 'Monday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday
        //console.log(dltemp);
        console.log("MONDAY");

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(1, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+1, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        returnSpeech2(dltemp);


      }

      else if (dlArray[1] == 'Tuesday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(2, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+2, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        returnSpeech2(dltemp);
      }
      else if (dlArray[1] == 'Wednesday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(3, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+3, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        returnSpeech2(dltemp);
      }
      else if (dlArray[1] == 'Thursday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(4, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+4, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        returnSpeech2(dltemp);
      }

      else if (dlArray[1] == 'Friday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(5, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+5, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        returnSpeech2(dltemp);
      }

      else if (dlArray[1] == 'Saturday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(6, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+6, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        returnSpeech2(dltemp);
      }

      else if (dlArray[1] == 'Sunday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+7, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        returnSpeech2(dltemp);
      }

      else if (deadline == 'Tomorrow') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday
        console.log(dltemp);

        momentemp = new Date().toISOString().slice(0,10);
        dltemp = moment(momentemp, 'YYYY-MM-DD').add(1, 'days').toISOString().slice(0,10);
        //promise
        //email = 'hye@hye.com';
        console.log(dltemp);
        returnSpeech2(dltemp);
      }

      else if (deadline == 'Today') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday
        console.log(dltemp);

        momentemp = new Date().toISOString().slice(0,10);
        console.log(momentemp);
        dltemp = moment(momentemp, 'YYYY-MM-DD').add(0, 'days').toISOString().slice(0,10);
        //promise
        //email = 'hye@hye.com';
        console.log(dltemp);
        returnSpeech2(dltemp);
      }

      function returnSpeech2(dltemp) {
          speech = "Your important task "+tmp+" "+deadline+" has been added";

          console.log(dltemp);
          return res.json({
              speech: speech,
              displayText: speech,
              data: {'tasktitle':tmp,
                'deadline':dltemp,
                'act':"adddeadlineimp",
                'email':email},
              source: 'apiai-Oscar'
          });
      }

    }

    else if(req.body.result.action == 'task.addgroupimp-yes') {
      speech = "";
      var result = req.body.result;
      var parameters = result.parameters;
      var groupname = parameters.groupname;
      var tasktitle = parameters.tasktitle;
      var tmp = tasktitle.substring(5, tasktitle.length);
      tasktitle = tmp;

      var grArray = groupname.split(' ');
      console.log(grArray[2]);

      speech = "Your important Task "+tasktitle+" in "+grArray[2]+" has been added";
      return res.json({
          speech: speech,
          displayText: speech,
          data: {'tasktitle':tasktitle,
            'groupname':grArray[2],
            'act':"addgroupimp",
            'email':email},
          source: 'apiai-Oscar'
      });

    }

    else if(req.body.result.action == 'task.adddeadlinegroupimp-yes') {
      speech = "";
      var result = req.body.result;
      var parameters = result.parameters;
      var deadline = parameters.deadline;
      var groupname = parameters.groupname;
      var tasktitle = parameters.tasktitle;
      var tmp = tasktitle.substring(5, tasktitle.length);
      tasktitle = tmp;

      var grArray = groupname.split(' ');
      console.log(grArray[2]);

      console.log(tmp);

      var dlArray = deadline.split(' ');
      console.log(dlArray[1]);


      if (dlArray[1] == 'Monday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday
        //console.log(dltemp);
        console.log("MONDAY");

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(1, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+1, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        returnSpeech2(dltemp);


      }

      else if (dlArray[1] == 'Tuesday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(2, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+2, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        returnSpeech2(dltemp);
      }
      else if (dlArray[1] == 'Wednesday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(3, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+3, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        returnSpeech2(dltemp);
      }
      else if (dlArray[1] == 'Thursday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(4, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+4, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        returnSpeech2(dltemp);
      }

      else if (dlArray[1] == 'Friday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(5, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+5, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        returnSpeech2(dltemp);
      }

      else if (dlArray[1] == 'Saturday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(6, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+6, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        returnSpeech2(dltemp);
      }

      else if (dlArray[1] == 'Sunday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+7, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        returnSpeech2(dltemp);
      }

      else if (deadline == 'Tomorrow') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday
        console.log(dltemp);

        momentemp = new Date().toISOString().slice(0,10);
        dltemp = moment(momentemp, 'YYYY-MM-DD').add(1, 'days').toISOString().slice(0,10);
        //promise
        //email = 'hye@hye.com';
        console.log(dltemp);
        returnSpeech2(dltemp);
      }

      else if (deadline == 'Today') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday
        console.log(dltemp);

        momentemp = new Date().toISOString().slice(0,10);
        console.log(momentemp);
        dltemp = moment(momentemp, 'YYYY-MM-DD').add(0, 'days').toISOString().slice(0,10);
        //promise
        //email = 'hye@hye.com';
        console.log(dltemp);
        returnSpeech2(dltemp);
      }

      function returnSpeech2(dltemp) {
          speech = "Your important task "+tmp+" in "+grArray[2]+" "+deadline+" has been added";

          console.log(dltemp);
          return res.json({
              speech: speech,
              displayText: speech,
              data: {'tasktitle':tmp,
                'deadline':dltemp,
                'groupname':grArray[2],
                'act':"adddeadlinegroupimp",
                'email':email},
              source: 'apiai-Oscar'
          });
      }

    }

    else if(req.body.result.action == 'searching.person') {
      speech = "";
      var result = req.body.result;
      var parameters = result.parameters;
      var givenname = parameters.givenname;

      findtasksbyname(givenname, email)
      .then(function(result) {
        returnSpeech(result);
        console.log('1st Random number:', result);
      })
      .catch(function(err) {
        console.log('Error ocuured:', err.message);
      });

      function returnSpeech(result) {
        if(result.length <= 0) {
          speech = "You don't have any tasks with "+givenname+"!";

          return res.json({
              speech: speech,
              displayText: speech,
              data: {'act':"notfound", 'email':email},
              source: 'apiai-Oscar'
          });

        }
        else {
          speech = "Oh now I've found "+result.length+" tasks with "+givenname+" here!";
          console.log("res2");

          console.log(result);
          return res.json({
              speech: speech,
              displayText: speech,
              data: {'resList':result,
                'act':"found",
                'email':email},
              source: 'apiai-Oscar'
          });
        }
      }

    }

    else if(req.body.result.action == 'searching.priority') {
      speech = "";
      var result = req.body.result;
      var parameters = result.parameters;

      findtasksbypriority(email)
      .then(function(result) {
        returnSpeech(result);
        console.log('1st Random number:', result);
      })
      .catch(function(err) {
        console.log('Error ocuured:', err.message);
      });

      function returnSpeech(result) {
        if(result.length <= 0) {
          speech = "You don't have any superimportant tasks!";

          return res.json({
              speech: speech,
              displayText: speech,
              data: {'act':"notfound", 'email':email},
              source: 'apiai-Oscar'
          });

        }
        else {
          speech = "Oh now I've found "+result.length+" superimportant tasks here!";
          console.log("res2");

          console.log(result);
          return res.json({
              speech: speech,
              displayText: speech,
              data: {'resList':result,
                'act':"found",
                'email':email},
              source: 'apiai-Oscar'
          });
        }
      }

    }

    else if(req.body.result.action == 'searching.superimpdeadline') {
      speech = "";
      var result = req.body.result;
      var parameters = result.parameters;
      var deadline = parameters.deadline;
      console.log(deadline);
      var dlArray = deadline.split(' ');
      console.log(dlArray[1]);

      if (dlArray[1] == 'Monday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday
        //console.log(dltemp);
        console.log("MONDAY");

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(1, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+1, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }

        //promise
        //email = 'hye@hye.com';
        findtasksbyprdl(dltemp, email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });

        // speech = "ADDDDDDDD";

        /////PROMISE MUST BE HERE (and return res.json)


      }
      else if (dlArray[1] == 'Tuesday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(2, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+2, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        //promise
        //email = 'hye@hye.com';
        findtasksbyprdl(dltemp, email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });
      }
      else if (dlArray[1] == 'Wednesday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(3, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+3, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        //promise
        //email = 'hye@hye.com';
        findtasksbyprdl(dltemp, email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });
      }
      else if (dlArray[1] == 'Thursday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(4, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+4, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        //promise
        //email = 'hye@hye.com';
        findtasksbyprdl(dltemp, email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });
      }
      else if (dlArray[1] == 'Friday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(5, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+5, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        //promise
        //email = 'hye@hye.com';
        findtasksbyprdl(dltemp, email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });
      }
      else if (dlArray[1] == 'Saturday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(6, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+6, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        //promise
        //email = 'hye@hye.com';
        findtasksbyprdl(dltemp, email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });
      }
      else if (dlArray[1] == 'Sunday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+7, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        //promise
        //email = 'hye@hye.com';
        findtasksbyprdl(dltemp, email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });
      }
      else if (deadline == 'Tomorrow') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday
        console.log(dltemp);

        momentemp = new Date().toISOString().slice(0,10);
        dltemp = moment(momentemp, 'YYYY-MM-DD').add(1, 'days').toISOString().slice(0,10);
        //promise
        //email = 'hye@hye.com';
        findtasksbyprdl(dltemp, email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });

        // speech = "ADDDDDDDD";

        /////PROMISE MUST BE HERE (and return res.json)


      }
      else if (deadline == 'Today') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday
        console.log(dltemp);

        momentemp = new Date().toISOString().slice(0,10);
        console.log(momentemp);
        dltemp = moment(momentemp, 'YYYY-MM-DD').add(0, 'days').toISOString().slice(0,10);
        //promise
        //email = 'hye@hye.com';
        findtasksbyprdl(momentemp, email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });

        // speech = "ADDDDDDDD";

        /////PROMISE MUST BE HERE (and return res.json)


      }
      else {

      }

      function returnSpeech(result) {
        if(result.length <= 0) {
          speech = "You don't have any SUPER IMPORTANT tasks "+deadline+"!";

          return res.json({
              speech: speech,
              displayText: speech,
              data: {'act':"notfound", 'email':email},
              source: 'apiai-Oscar'
          });

        }
        else {
          speech = "Oh now I've found "+result.length+" SUPER IMPORTANT tasks "+deadline+" here!";
          console.log("res2");

          console.log(result);
          return res.json({
              speech: speech,
              displayText: speech,
              data: {'resList':result,
                'act':"found",
                'email':email},
              source: 'apiai-Oscar'
          });
        }
      }

    }

    else if(req.body.result.action == 'searching.superimpgroup') {
      speech = "";
      var result = req.body.result;
      var parameters = result.parameters;
      var groupname = parameters.groupname;

      var grArray = groupname.split(' ');
      console.log(grArray[2]);

      findtasksbyprgroup(grArray[2], email)
      .then(function(result) {
        returnSpeech(result);
        console.log('1st Random number:', result);
      })
      .catch(function(err) {
        console.log('Error ocuured:', err.message);
      });

      function returnSpeech(result) {
        if(result.length <= 0) {
          speech = "You don't have any super important tasks in "+grArray[2]+"!";

          return res.json({
              speech: speech,
              displayText: speech,
              data: {'act':"notfound", 'email':email},
              source: 'apiai-Oscar'
          });

        }
        else {
          speech = "Oh now I've found "+result.length+" super important tasks in "+grArray[2]+" here!";
          console.log("res2");

          console.log(result);
          return res.json({
              speech: speech,
              displayText: speech,
              data: {'resList':result,
                'act':"found",
                'email':email},
              source: 'apiai-Oscar'
          });
        }
      }

    }

    else if(req.body.result.action == 'searching.impdlgroup') {
      speech = "";
      var result = req.body.result;
      var parameters = result.parameters;
      var deadline = parameters.deadline;
      console.log(deadline);
      var dlArray = deadline.split(' ');
      console.log(dlArray[1]);

      var groupname = parameters.groupname;

      var grArray = groupname.split(' ');
      console.log(grArray[2]);

      if (dlArray[1] == 'Monday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday
        //console.log(dltemp);
        console.log("MONDAY");

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(1, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+1, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }

        //promise
        //email = 'hye@hye.com';
        findtasksbyimpdlgroup(dltemp, grArray[2], email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });

        // speech = "ADDDDDDDD";

        /////PROMISE MUST BE HERE (and return res.json)


      }
      else if (dlArray[1] == 'Tuesday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(2, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+2, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        //promise
        //email = 'hye@hye.com';
        findtasksbyimpdlgroup(dltemp, grArray[2], email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });
      }
      else if (dlArray[1] == 'Wednesday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(3, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+3, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        //promise
        //email = 'hye@hye.com';
        findtasksbyimpdlgroup(dltemp, grArray[2], email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });
      }
      else if (dlArray[1] == 'Thursday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(4, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+4, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        //promise
        //email = 'hye@hye.com';
        findtasksbyimpdlgroup(dltemp, grArray[2], email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });
      }
      else if (dlArray[1] == 'Friday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(5, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+5, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        //promise
        //email = 'hye@hye.com';
        findtasksbyimpdlgroup(dltemp, grArray[2], email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });
      }
      else if (dlArray[1] == 'Saturday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(6, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+6, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        //promise
        //email = 'hye@hye.com';
        findtasksbyimpdlgroup(dltemp, grArray[2], email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });
      }
      else if (dlArray[1] == 'Sunday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+7, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        //promise
        //email = 'hye@hye.com';
        findtasksbyimpdlgroup(dltemp, grArray[2], email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });
      }
      else if (deadline == 'Tomorrow') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday
        console.log(dltemp);

        momentemp = new Date().toISOString().slice(0,10);
        dltemp = moment(momentemp, 'YYYY-MM-DD').add(1, 'days').toISOString().slice(0,10);
        //promise
        //email = 'hye@hye.com';
        findtasksbyimpdlgroup(dltemp, grArray[2], email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });

        // speech = "ADDDDDDDD";

        /////PROMISE MUST BE HERE (and return res.json)


      }
      else if (deadline == 'Today') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday
        console.log(dltemp);

        momentemp = new Date().toISOString().slice(0,10);
        console.log(momentemp);
        dltemp = moment(momentemp, 'YYYY-MM-DD').add(0, 'days').toISOString().slice(0,10);
        //promise
        //email = 'hye@hye.com';
        findtasksbyimpdlgroup(dltemp, grArray[2], email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });

        // speech = "ADDDDDDDD";

        /////PROMISE MUST BE HERE (and return res.json)


      }
      else {

      }

      function returnSpeech(result) {
        if(result.length <= 0) {
          speech = "You don't have any SUPER IMPORTANT tasks "+deadline+" in "+grArray[2]+"!";

          return res.json({
              speech: speech,
              displayText: speech,
              data: {'act':"notfound", 'email':email},
              source: 'apiai-Oscar'
          });

        }
        else {
          speech = "Oh now I've found "+result.length+" SUPER IMPORTANT tasks "+deadline+" in"+grArray[2]+" here!";
          console.log("res2");

          console.log(result);
          return res.json({
              speech: speech,
              displayText: speech,
              data: {'resList':result,
                'act':"found",
                'email':email},
              source: 'apiai-Oscar'
          });
        }
      }

    }

    else if(req.body.result.action == 'searching.groupdl') {
      speech = "";
      var result = req.body.result;
      var parameters = result.parameters;
      var deadline = parameters.deadline;
      console.log(deadline);
      var dlArray = deadline.split(' ');
      console.log(dlArray[1]);

      var groupname = parameters.groupname;

      var grArray = groupname.split(' ');
      console.log(grArray[2]);

      if (dlArray[1] == 'Monday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday
        //console.log(dltemp);
        console.log("MONDAY");

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(1, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+1, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }

        //promise
        //email = 'hye@hye.com';
        findtasksbygroupdl(dltemp, grArray[2], email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });

        // speech = "ADDDDDDDD";

        /////PROMISE MUST BE HERE (and return res.json)


      }
      else if (dlArray[1] == 'Tuesday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(2, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+2, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        //promise
        //email = 'hye@hye.com';
        findtasksbygroupdl(dltemp, grArray[2], email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });
      }
      else if (dlArray[1] == 'Wednesday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(3, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+3, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        //promise
        //email = 'hye@hye.com';
        findtasksbygroupdl(dltemp, grArray[2], email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });
      }
      else if (dlArray[1] == 'Thursday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(4, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+4, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        //promise
        //email = 'hye@hye.com';
        findtasksbygroupdl(dltemp, grArray[2], email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });
      }
      else if (dlArray[1] == 'Friday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(5, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+5, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        //promise
        //email = 'hye@hye.com';
        findtasksbygroupdl(dltemp, grArray[2], email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });
      }
      else if (dlArray[1] == 'Saturday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(6, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+6, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        //promise
        //email = 'hye@hye.com';
        findtasksbygroupdl(dltemp, grArray[2], email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });
      }
      else if (dlArray[1] == 'Sunday') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday

        momentemp = new Date().toISOString().slice(0,10);
        if(day == 0) {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7, 'days').toISOString().slice(0,10);
        }
        else {
          dltemp = moment(momentemp, 'YYYY-MM-DD').add(7-day+7, 'days').toISOString().slice(0,10);
          if(dltemp > 7) {
            dltemp = dltemp-7;
          }
        }
        if (dlArray[0] == 'This') {
          dltemp = moment(dltemp, 'YYYY-MM-DD').subtract(7, 'days').toISOString().slice(0,10);
        }
        console.log(dltemp);
        //promise
        //email = 'hye@hye.com';
        findtasksbygroupdl(dltemp, grArray[2], email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });
      }
      else if (deadline == 'Tomorrow') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday
        console.log(dltemp);

        momentemp = new Date().toISOString().slice(0,10);
        dltemp = moment(momentemp, 'YYYY-MM-DD').add(1, 'days').toISOString().slice(0,10);
        //promise
        //email = 'hye@hye.com';
        findtasksbygroupdl(dltemp, grArray[2], email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });

        // speech = "ADDDDDDDD";

        /////PROMISE MUST BE HERE (and return res.json)


      }
      else if (deadline == 'Today') {
        var d = new Date();
        var day = d.getDay(); // 0- sunday
        console.log(dltemp);

        momentemp = new Date().toISOString().slice(0,10);
        console.log(momentemp);
        dltemp = moment(momentemp, 'YYYY-MM-DD').add(0, 'days').toISOString().slice(0,10);
        //promise
        //email = 'hye@hye.com';
        findtasksbygroupdl(dltemp, grArray[2], email)
        .then(function(result) {
          returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });

        // speech = "ADDDDDDDD";

        /////PROMISE MUST BE HERE (and return res.json)


      }
      else {

      }

      function returnSpeech(result) {
        if(result.length <= 0) {
          speech = "You don't have any tasks "+deadline+" in "+grArray[2]+"!";

          return res.json({
              speech: speech,
              displayText: speech,
              data: {'act':"notfound", 'email':email},
              source: 'apiai-Oscar'
          });

        }
        else {
          speech = "Oh now I've found "+result.length+" tasks "+deadline+" in"+grArray[2]+" here!";
          console.log("res2");

          console.log(result);
          return res.json({
              speech: speech,
              displayText: speech,
              data: {'resList':result,
                'act':"found",
                'email':email},
              source: 'apiai-Oscar'
          });
        }
      }

    }

    else if(req.body.result.action == 'rec.finding') {
      speech = "";
      var result = req.body.result;
      var parameters = result.parameters;

      recfinding(email)
      .then(function(result) {
        returnSpeech(result);
        console.log('1st Random number:', result);
      })
      .catch(function(err) {
        console.log('Error ocuured:', err.message);
      });

      //speech = "the group called "+grArray[2]+" has been added";

      function returnSpeech(result) {
        if(result.length <= 0) {
          speech = "You don't have any tasks for 3 days!";

          return res.json({
              speech: speech,
              displayText: speech,
              data: {'act':"notfound", 'email':email},
              source: 'apiai-Oscar'
          });

        }
        else {
          addspeechpromise(result)
          .then(function(spch) {
            //spch == speech - do nothing here with this (globalv)
            // console.log('1st Random number:', result);
            // console.log("res2");

            console.log(result);
            return res.json({
                speech: speech,
                displayText: speech,
                data: {'resList':result,
                  'act':"found",
                  'email':email},
                source: 'apiai-Oscar'
            });
          })
          .catch(function(err) {
            console.log('Error ocuured:', err.message);
          });

        }
      }

    }

    else {
      return res.json({
          speech: "speech",
          displayText: speech,
          source: 'apiai-Oscar'
      });

    }

    function findtasksbyimpdlgroup(dltemp, groupname, email) {
      let deferred = Q.defer();
      setTimeout(function() {

      // namelist = [];
      // titlelist = [];
      // datelist = [];
      // monthlist = [];
      // yearlist = [];
      resList = [];

      taskModel.find({'email':email, 'group':groupname, 'deadline':dltemp, 'importance':"a", 'deleted':false}).sort({date:-1}).exec(function(err, Contents){
                   // db에서 날짜 순으로 데이터들을 가져옴
              if(err) throw err;

              // console.log(Contents);//you can use this.... how silly you are
              //console.log("im here");

            resList = Contents;
            console.log("res1");
            console.log(resList);
            deferred.resolve(resList);

            //   Contents.forEach(function(item, index){
            //   resList[index] = item;
            // })

        });
      }, 1000);
      return deferred.promise;
    }

    function findtasksbygroupdl(dltemp, groupname, email) {
      let deferred = Q.defer();
      setTimeout(function() {

      // namelist = [];
      // titlelist = [];
      // datelist = [];
      // monthlist = [];
      // yearlist = [];
      resList = [];

      taskModel.find({'email':email, 'group':groupname, 'deadline':dltemp, 'deleted':false}).sort({date:-1}).exec(function(err, Contents){
                   // db에서 날짜 순으로 데이터들을 가져옴
              if(err) throw err;

              // console.log(Contents);//you can use this.... how silly you are
              //console.log("im here");

            resList = Contents;
            console.log("res1");
            console.log(resList);
            deferred.resolve(resList);

            //   Contents.forEach(function(item, index){
            //   resList[index] = item;
            // })

        });
      }, 1000);
      return deferred.promise;
    }


    function findtasksbydl(dltemp, email) {
      let deferred = Q.defer();
      setTimeout(function() {

      // namelist = [];
      // titlelist = [];
      // datelist = [];
      // monthlist = [];
      // yearlist = [];
      resList = [];

      taskModel.find({'email':email, 'deadline':dltemp, 'deleted':false}).sort({date:-1}).exec(function(err, Contents){
                   // db에서 날짜 순으로 데이터들을 가져옴
              if(err) throw err;

              // console.log(Contents);//you can use this.... how silly you are
              //console.log("im here");

            resList = Contents;
            console.log("res1");
            console.log(resList);
            deferred.resolve(resList);

            //   Contents.forEach(function(item, index){
            //   resList[index] = item;
            // })

        });
      }, 1000);
      return deferred.promise;
    }

    function findtasksbyname(givenname, email) {
      let deferred = Q.defer();
      setTimeout(function() {

      // namelist = [];
      // titlelist = [];
      // datelist = [];
      // monthlist = [];
      // yearlist = [];
      resList = [];

      taskModel.find({'email':email, 'associate':givenname, 'deleted':false}).sort({date:-1}).exec(function(err, Contents){
                   // db에서 날짜 순으로 데이터들을 가져옴
              if(err) throw err;

              // console.log(Contents);//you can use this.... how silly you are
              //console.log("im here");

            resList = Contents;
            console.log("res1");
            console.log(resList);
            deferred.resolve(resList);

            //   Contents.forEach(function(item, index){
            //   resList[index] = item;
            // })

        });
      }, 1000);
      return deferred.promise;
    }

    function findtasksbypriority(email) {
      let deferred = Q.defer();
      setTimeout(function() {

      // namelist = [];
      // titlelist = [];
      // datelist = [];
      // monthlist = [];
      // yearlist = [];
      resList = [];

      taskModel.find({'email':email, 'importance':"a", 'deleted':false}).sort({date:-1}).exec(function(err, Contents){
                   // db에서 날짜 순으로 데이터들을 가져옴
              if(err) throw err;

              // console.log(Contents);//you can use this.... how silly you are
              //console.log("im here");

            resList = Contents;
            console.log("res1");
            console.log(resList);
            deferred.resolve(resList);

            //   Contents.forEach(function(item, index){
            //   resList[index] = item;
            // })

        });
      }, 1000);
      return deferred.promise;
    }

    function findtasksbyprdl(dltemp, email) {
      let deferred = Q.defer();
      setTimeout(function() {

      // namelist = [];
      // titlelist = [];
      // datelist = [];
      // monthlist = [];
      // yearlist = [];
      resList = [];

      taskModel.find({'email':email, 'deadline':dltemp, 'importance':"a", 'deleted':false}).sort({date:-1}).exec(function(err, Contents){
                   // db에서 날짜 순으로 데이터들을 가져옴
              if(err) throw err;

              // console.log(Contents);//you can use this.... how silly you are
              //console.log("im here");

            resList = Contents;
            console.log("res1");
            console.log(resList);
            deferred.resolve(resList);

            //   Contents.forEach(function(item, index){
            //   resList[index] = item;
            // })

        });
      }, 1000);
      return deferred.promise;
    }

    function findtasksbyprgroup(groupname, email) {
      let deferred = Q.defer();
      setTimeout(function() {

      // namelist = [];
      // titlelist = [];
      // datelist = [];
      // monthlist = [];
      // yearlist = [];
      resList = [];

      taskModel.find({'email':email, 'group':groupname, 'importance':"a", 'deleted':false}).sort({date:-1}).exec(function(err, Contents){
                   // db에서 날짜 순으로 데이터들을 가져옴
              if(err) throw err;

              // console.log(Contents);//you can use this.... how silly you are
              //console.log("im here");

            resList = Contents;
            console.log("res1");
            console.log(resList);
            deferred.resolve(resList);

            //   Contents.forEach(function(item, index){
            //   resList[index] = item;
            // })

        });
      }, 1000);
      return deferred.promise;
    }

    function recfinding(email) {
      let deferred = Q.defer();
      setTimeout(function() {
        resList = [];

        var momentemp = new Date().toISOString().slice(0,10);//get today's date

        //finding function should be here

        var dltemp = moment(momentemp, 'YYYY-MM-DD').add(1, 'days').toISOString().slice(0,10);

        find(momentemp, email)
        .then(function(result) {
          if(result.length <= 0) {
            console.log("2TIMES!");
            dltemp = moment(momentemp, 'YYYY-MM-DD').add(1, 'days').toISOString().slice(0,10);
            find(dltemp, email)//twice
            .then(function(result) {
              if(result.length <= 0) {//three times

                dltemp = moment(momentemp, 'YYYY-MM-DD').add(2, 'days').toISOString().slice(0,10);
                find(dltemp, email)//twice
                .then(function(result) {
                  console.log("3TIMES!");
                  console.log('1st Random number:', result);
                  deferred.resolve(result);
                })
                .catch(function(err) {
                  console.log('Error ocuured:', err.message);
                });

              }
              else {
                deferred.resolve(result);

              }
              // returnSpeech(result);
              console.log('1st Random number:', result);
            })
            .catch(function(err) {
              console.log('Error ocuured:', err.message);
            });

          }
          else {
            deferred.resolve(result);

          }
          // returnSpeech(result);
          console.log('1st Random number:', result);
        })
        .catch(function(err) {
          console.log('Error ocuured:', err.message);
        });


      }, 1000);
      return deferred.promise;
    }

    function find(momentemp, email) {
      let deferred = Q.defer();
      setTimeout(function() {

      // namelist = [];
      // titlelist = [];
      // datelist = [];
      // monthlist = [];
      // yearlist = [];
      resList = [];

      taskModel.find({'email':email, 'deadline':momentemp, 'deleted':false}).sort({date:-1}).exec(function(err, Contents){
                   // db에서 날짜 순으로 데이터들을 가져옴
              if(err) throw err;

              // console.log(Contents);//you can use this.... how silly you are
              //console.log("im here");

            resList = Contents;
            console.log("res1");
            console.log(resList);
            deferred.resolve(resList);

            //   Contents.forEach(function(item, index){
            //   resList[index] = item;
            // })

        });
      }, 300);
      return deferred.promise;
    }


    function addspeechpromise(result) {
      let deferred = Q.defer();
      setTimeout(function() {
        var tmp = [];
        for (var i = 0; i<result.length;i++) {
          if(result[i].importance == 'a') {
            tmp.push(result[i]);
          }
        }
        console.log(tmp);
        if(tmp.length <= 0) {
          speech = "I think you should do these "+result.length+" tasks soon";
          deferred.resolve(speech);
        }
        else {
          console.log(result.length - tmp.length);
          speech = "I think you should do these "+tmp.length+" important tasks and "+(result.length - tmp.length)+" noraml tasks!";
          deferred.resolve(speech);

        }
        //console.log(speech);
      }, 300);
      return deferred.promise;
    }
});



// function searchsessionid(sessionid) {
//   let deferred = Q.defer();
//   setTimeout(function() {
//     resList = [];
//
//     sessionModel.find({'sessionid':sessionid}).sort({date:-1}).exec(function(err, Contents){
//                  // db에서 날짜 순으로 데이터들을 가져옴
//             if(err) throw err;
//
//             // console.log(Contents);//you can use this.... how silly you are
//             //console.log("im here");
//
//           resList = Contents;
//           console.log("res1");
//           console.log(resList);
//           deferred.resolve(resList);
//           //   Contents.forEach(function(item, index){
//           //   resList[index] = item;
//           // })
//
//       });
//   }, 300);
//   return deferred.promise;
// }

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
