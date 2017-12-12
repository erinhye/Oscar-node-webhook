'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var groupsSchema = new Schema({
  email: {
    type: String,
    required: [true, '메일은 필수입니다.']
  },
  name: {
    type: String,
    required: [true, '메일은 필수입니다.']
  },
  date: {
    type: Date,
    default: Date.now()
  },
  deleted: {type: Boolean, default: false}
});

mongoose.model('groups', groupsSchema);
