const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const config = require('../config/config.js');

const dbString = config.dialect + '://' + config.username + ':' + config.password + '@' + config.host + '/' + config.database;
mongoose.connect(dbString, {useNewUrlParser: true, 
  useUnifiedTopology: true,
  useCreateIndex: true
});

// mongoose.connect('mongodb://localhost/kitchen-api-recipes', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Database Connected');
});

fs.readdirSync(__dirname).forEach(file => {
  if(file != path.basename(__filename)) {
    require('./' + file);
  }
});

module.exports = {db}