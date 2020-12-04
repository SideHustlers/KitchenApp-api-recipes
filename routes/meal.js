'use strict'
const express = require('express');
const router = express.Router();
const bodyValidator = require('express-validation');
const mongoose = require('mongoose');
const authMiddleware = require('../middlewares/auth');
const mealMiddleware = require('../middlewares/meal');
const responseHelper = require('../helpers/responses');
const { clean } = require('../helpers/cleaner');
const { captureException } = require('../helpers/logging');

const create_meal = require('../validation/create_meal');

router.post('/create', 
  authMiddleware.verifyAccessToken(true),
  bodyValidator(create_meal),
  async (req, res) => {
    try {
      let recipes = await mongoose.model('recipes').find({
        recipe_id: { $in : req.body.recipes}
      });

      const meal = await mongoose.model('meals').create({
        user_id: req.user.user_id,
        date: req.body.date,
        tags: req.body.tags,
        name: req.body.name,
        total_calories: req.body.total_calories,
        total_time: req.body.total_time,
        total_time_units: req.body.total_time_units,
        recipes: recipes,
        created_by: req.user.user_id,
        updated_by: req.user.user_id
      });
      
      return responseHelper.returnSuccessResponse(req, res, true, meal);
    } catch(error) {
      captureException(error);
      return responseHelper.returnInternalServerError(req, res, new String(error));
    }
  }
);

// ! WIP: Weird response payload
router.put('/:id/update',
  authMiddleware.verifyAccessToken(true),
  mealMiddleware.checkMealExists,
  mealMiddleware.checkMealOwnership,
  async (req, res) => {
    try {
      let meal = req.meal;

      let recipes = await mongoose.model('recipes').find({
        recipe_id: { $in : req.body.recipes}
      });

      let mealUpdate = {
        user_id: req.user.user_id,
        date: req.body.date,
        tags: req.body.tags,
        name: req.body.name,
        total_calories: req.body.total_calories,
        total_time: req.body.total_time,
        total_time_units: req.body.total_time_units,
        recipes: recipes,
        updated_by: req.user.user_id
      };

      let cleaned = clean(mealUpdate);
      meal = await mongoose.model('meals').findOneAndUpdate({meal_id: req.params.id}, {$set: cleaned}, {new: true});
      
      return responseHelper.returnSuccessResponse(req, res, true, meal);

    } catch (error) {
      captureException(error);
      return responseHelper.returnInternalServerError(req, res, new String(error));
    }
  }
);

module.exports = router;