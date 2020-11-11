'use strict'
const express = require('express');
const router = express.Router();
const bodyValidator = require('express-validation');
const mongoose = require('mongoose');
const authMiddleware = require('../middlewares/auth');
const responseHelper = require('../helpers/responses');
const listItemRoutes = require('./list_item');

router.use('/:list_id/items', listItemRoutes);


router.post('/create',
  // authMiddleware.verifyAccessToken,
  async (req, res) => {
    try {
      let listItems = [];
      await Promise.all(req.body.items.map( async item => {
        let listItem = await mongoose.model('ListItem').create({
          quantity: item.quantity,
          unit: item.unit,
          name: item.name,
          is_fulfilled: item.is_fulfilled,
          note: item.note,
          created_by: req.body.created_by,
          updated_by: req.body.updated_by
        });
        listItems.push(listItem);
      }));

      let list = await mongoose.model('GroceryList').create({
        start_date: null,
        end_date: null,
        items: listItems,
        meals: [],
        created_by: req.body.created_by,
        updated_by: req.body.updated_by
      });

      return responseHelper.returnSuccessResponse(req, res, true, list);
    } catch (error) {
      console.log(error);
      return responseHelper.returnInternalServerError(req, res, new String(error));  
    }
  }
);

// ! WIP: Needs to take into account user_id, start_date, end_date
// ! WIP: Pull items from "meals->recipes->ingredients"
router.post('/generate',
  // authMiddleware.verifyAccessToken,
  async (req, res) => {
    try {
      let listItems = [];
      await Promise.all(req.body.items.map( async item => {
        let listItem = await mongoose.model('ListItem').create({
          quantity: item.quantity,
          unit: item.unit,
          name: item.name,
          is_fulfilled: item.is_fulfilled,
          note: item.note,
          created_by: req.body.created_by,
          updated_by: req.body.updated_by
        });
        listItems.push(listItem);
      }));

      let meals = await mongoose.model('Meal').find({
        meal_id: {$in: req.body.meals}
      })

      let list = await mongoose.model('GroceryList').create({
        start_date: null,
        end_date: null,
        items: listItems,
        meals: meals,
        created_by: req.body.created_by,
        updated_by: req.body.updated_by
      });

      return responseHelper.returnSuccessResponse(req, res, true, list);
    } catch (error) {
      console.log(error);
      return responseHelper.returnInternalServerError(req, res, new String(error));  
    }
  }
);



module.exports = router;