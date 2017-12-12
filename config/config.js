var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development'; //set the enviroment

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'user'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://erinhye:hyehye@127.0.0.1:27071/user-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'user'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/user-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'user'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/user-production'
  }
};

module.exports = config[env];
