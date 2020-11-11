'use strict'
const express = require('express');
const router = express.Router();
const bodyValidator = require('express-validation');
const mongoose = require('mongoose');
const authMiddleware = require('../middlewares/auth');
const responseHelper = require('../helpers/responses');


router.post('/create', 
  // authMiddleware.verifyAccessToken,
  async (req, res) => {
    try {
      let recipes = await mongoose.model('Recipe').find({
        recipe_id: { $in : req.body.recipes}
      });

      const meal = await mongoose.model('Meal').create({
        user_id: req.body.user_id,
        date: req.body.date,
        tags: req.body.tags,
        name: req.body.name,
        total_calories: req.body.total_calories,
        total_time: req.body.total_time,
        total_time_units: req.body.total_time_units,
        recipes: recipes,
        created_by: req.body.created_by,
        updated_by: req.body.updated_by
      });
      
      return responseHelper.returnSuccessResponse(req, res, true, meal);
    } catch(error) {
      console.log(error);
      return responseHelper.returnInternalServerError(req, res, new String(error));
    }
  }
);

// ! WIP: Create/Utilize a meal Middleware for checking permissions and injecting object into the req
// ! WIP: Finish Logic
// router.put('/:id/update',
//   // authMiddleware.verifyAccessToken,
//   async (req, res) => {
//     try {
//       let meal = await mongoose.model('Meal').findOne({meal_id: req.params.id});

//       let recipes = await mongoose.model('Recipe').find({
//         recipe_id: { $in : req.body.recipes}
//       });

//       let mealUpdate = {
//         user_id: req.body.user_id,
//         date: req.body.date,
//         tags: req.body.tags,
//         name: req.body.name,
//         total_calories: req.body.total_calories,
//         total_time: req.body.total_time,
//         total_time_units: req.body.total_time_units,
//         recipes: recipes,
//         updated_by: req.body.updated_by
//       };

//     } catch (error) {
//       console.log(error);
//       return responseHelper.returnInternalServerError(req, res, new String(error));
//     }
//   }
// );

module.exports = router;