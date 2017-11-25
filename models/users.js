/*
 * 유저정보 스키마
 */

'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userSchema = new Schema({
  email: {
    type: String,
    required: [true, '메일은 필수입니다.']
  },
  password: {
    type: String,
    required: [true, '패스워드는 필수입니다.']
  },
  name: {
    type: String,
    required: [true, '별명은 필수입니다.']
  },
  joinWay: String,
  image: String,
  joinDate: {
    type: Date,
    default: Date.now()
  }
});

mongoose.model('users', userSchema);
