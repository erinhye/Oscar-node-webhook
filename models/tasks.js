'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var tasksSchema = new Schema({
  email: {
    type: String,
    required: [true, 'email is required.']
  },
  date: {
    type: Date,
    default: Date.now()
  },
  year: {
    type: String
  },
  month: {
    type: String
  },
  day: {
    type: String
  },
  dlyear: {
    type: String
  },
  dlmonth: {
    type: String
  },
  dlday: {
    type: String
  },
  group: {
    type: String,
    default: "Unsorted"
  },
  deadline: {
    type: String
  },
  importance: {
    type: String,
    default: "e"
  },
  title: {
    type: String
  },
  description: String,
  associate: String,
  deleted: {type: Boolean, default: false}
});

mongoose.model('tasks', tasksSchema);
