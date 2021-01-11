'use strict'

const express = require('express');
const router = express.Router();
const cors = require('cors');

const recipeRoutes = require('./recipe');
const mealRoutes = require('./meal');
const groceryListRoutes = require('./grocery_list');

const allowedOrigins = ['http://localhost:3000', 'http://localhost:8000'];

router.use(cors({
  credentials: true,
  origin: function(origin, callback) {
    // allow requests with no origin
    // like mobile apps or curl requests
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not ' +
        'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

router.use('/recipes', recipeRoutes);
router.use('/meals', mealRoutes);
router.use('/lists', groceryListRoutes);

module.exports = router;