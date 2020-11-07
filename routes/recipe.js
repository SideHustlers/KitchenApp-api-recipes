const express = require('express');
const router = express.Router();
const bodyValidator = require('express-validation');
const mongoose = require('mongoose');
const authMiddleware = require('../middlewares/auth');
const responseHelper = require('../helpers/responses');


router.post('/create',
  // authMiddleware.verifyAccessToken,
  async function(req, res) {
    try {
      const recipe = await mongoose.model('Recipe').create({
        name: req.body.name,
        prep_time: req.body.prep_time,
        cook_time: req.body.cook_time,
        difficulty: req.body.difficulty,
        rating: req.body.rating,
        special_requirements: req.body.special_requirements,
        author: req.body.author,
        accessability: req.body.accessability,
        type: req.body.type,
        source: req.body.source,
        serving_size: req.body.serving_size,
        ingredients: req.body.ingredients,
        allergies: req.body.allergies,
        calories: req.body.calories,
        tags: req.body.tags,
        preferences: req.body.preferences,
        created_by: req.body.created_by,
        updated_by: req.body.updated_by
      });
      return responseHelper.returnSuccessResponse(req, res, true, recipe);
    }
    catch (error) {
      console.log(error);
      return responses.returnInternalServerError(req, res, new String(error));
    }
  }
);


module.exports = router;