'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var sessionsSchema = new Schema({
  email: {
    type: String
  },
  sessionid: {
    type: String
  }
});

mongoose.model('sessions', sessionsSchema);
