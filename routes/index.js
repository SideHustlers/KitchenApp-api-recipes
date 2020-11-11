'use strict'

const express = require('express');
const router = express.Router();
const cors = require('cors');

const recipeRoutes = require('./recipe');
const mealRoutes = require('./meal');
const groceryListRoutes = require('./grocery_list');

router.use('/recipes', recipeRoutes);
router.use('/meals', mealRoutes);
router.use('/lists', groceryListRoutes);

module.exports = router;