const express = require('express');
const app = express();
const port = 8000;
const bodyParser = require('body-parser');
var dotenv = require('dotenv').config();
const models = require('./models');
const router = require('./routes');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/', router);

app.use(function(err, req, res, next){
  console.log(err.name, process.env.NODE_ENV);
  if(err.name === "ValidationError" && process.env.NODE_ENV === "production") {
      var new_err = {
          status: "failed",
          message: "Body validation failed, missing parameters."
      }
      res.status(400).json(new_err)
  }
  else {
      res.status(400).json(err);
  }
});

app.listen(port, () => console.log(`App listening on port ${port}!`));

module.exports = app;