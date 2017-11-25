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
    taskModel = mongoose.model('tasks');

const app = express();
module.exports = require('./config/express')(app, config);

groupModel.find({'email':'hjsuh01@gmail.com'}).sort({date:1}).exec(function(err, groupContents){
             // db에서 날짜 순으로 데이터들을 가져옴
        if(err) throw err;

        console.log(groupContents);

  });


app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());


app.get('/', (req, res) => {
  res.status(200).send('Hello, world!').end();
});

app.post('/webhook', function(req, res) {
    var speech = "";

    if(req.body.result.action == 'task.add-yes') {
      var result = req.body.result;
      var parameters = result.parameters;
      var givenname = parameters.givenname;
      var tasktitle = parameters.tasktitle;

      if (givenname = '') {
        speech = "the Task called "+tasktitle+" has been added";
      }
      else {
        speech = "the Task called "+tasktitle+" with "+givenname+" has been added";
      }
      return res.json({
          speech: speech,
          displayText: speech,
          data: {'tasktitle':tasktitle,
            'given-name':givenname,
            'act':"add"},
          source: 'apiai-Oscar'
      });

    }

    else if(req.body.result.action == 'searching.deadline') {
      var result = req.body.result;
      var parameters = result.parameters;
      var deadline = parameters.deadline;

      if (deadline = 'until next Monday') {
        speech = "the Task called "+tasktitle+" has been added";
      }
      else if (deadline = 'until next Tuesday') {
        speech = "the Task called "+tasktitle+" with "+givenname+" has been added";
      }
      else {

      }
      return res.json({
          speech: speech,
          displayText: speech,
          data: {'tasktitle':tasktitle,
            'given-name':givenname,
            'act':"add"},
          source: 'apiai-Oscar'
      });

    }

    else {
      return res.json({
          speech: "speech",
          displayText: speech,
          source: 'apiai-Oscar'
      });

    }


    // var speech = req.body.result && req.body.result.parameters && req.body.result.parameters.echoText ? req.body.result.parameters.echoText : "Seems like some problem. Speak again."
    // return res.json({
    //     speech: speech,
    //     displayText: speech,
    //     source: 'webhook-echo-sample'
    // });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
