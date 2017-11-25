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


const app = express();

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
