'use strict'

const express = require('express');
const router = express.Router();
const cors = require('cors');

const recipeRoutes = require('./recipe');

router.use('/recipes', recipeRoutes);

module.exports = router;