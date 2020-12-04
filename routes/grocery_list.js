'use strict'
const express = require('express');
const router = express.Router();
const bodyValidator = require('express-validation');
const mongoose = require('mongoose');
const convert = require('convert-units');
const authMiddleware = require('../middlewares/auth');
const groceryListMiddleware = require('../middlewares/grocery_list');
const responseHelper = require('../helpers/responses');
const { captureException } = require('../helpers/logging');
const listItemRoutes = require('./list_item');
const unitsHelper = require('../helpers/units');

router.use('/:list_id/items', listItemRoutes);

const create_grocery_list = require('../validation/create_grocery_list');
const update_grocery_list = require('../validation/update_grocery_list');
const units = require('../helpers/units');

// TODO: Conversion Table for Units
// TODO: Combine ingredients
async function aggregateMealsAndIngredients(req) {
  let meals = await mongoose.model('meals').find(
    {
      user_id: req.user.user_id,
      date: {$gte: req.body.start_date, $lte: req.body.end_date}
    }).populate({
      path: 'recipes',
      populate: {
        path: 'ingredients'
      }
    });
  
  let listIngredients = [];
  await Promise.all(meals.map( async meal => {
    await Promise.all(meal.recipes.map(async recipe => {
      await Promise.all(recipe.ingredients.map(ingredient => {
        listIngredients.push({
          recipe_ingredient_id: ingredient.ingredient_id,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          name: ingredient.name,
          note: ingredient.raw
        });
      }));
    }));
  }));

  let listItems = []
  listIngredients.map(ingredient => {
    let recipe_ingredient_id = null;
    if (ingredient.recipe_ingredient_id != null) {
      recipe_ingredient_id = [ingredient.recipe_ingredient_id];
    }
    let listItem = {
      recipe_ingredient_ids: recipe_ingredient_id,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      name: ingredient.name,
      type: 'generated',
      note: ingredient.note,
      created_by: req.user.user_id,
      updated_by: req.user.user_id,
    };
    listItems.push(listItem);
  });

  return {list_items: listItems, meals: meals};
};

// TODO: Test this to validate consolidation algorithm
async function consolidateIngredients(user_id, ingredients) {
  let items  = [];
  let itemNames = [];

  for (let i = 0; i < ingredients.length; i++) {
    let ingA = ingredients[i];
    for (let j = 0; j < ingredients.length; j ++) {
      let ingB = ingredients[j];
      let item = null;
      let itemName = null;
      if (ingA != ingB) {
        if (ingA.name == ingB.name) {
          if (ingA.unit == ingB.unit) {
            item = combineIngredients(user_id, ingA, ingB);
            itemName = item.name;
          }
          else {
            if (unitsHelper[ingA.unit] && unitsHelper[ingB.unit]) {
              // Requires more work
              let cQuantity = convert(ingA.quantity).from(unitsHelper[ingA.unit]).to(unitsHelper[ingB.unit]);
              ingA.unit = ingB.unit;
              ingA.quantity = cQuantity;
              item = combineIngredients(user_id, ingA, ingB);
              itemName = item.name;
            }
            else {
              item = ingB;
              itemName = ingB.name;
            }
          }
          

          if (itemNames.includes(itemName)) {
            // Find and Add to it
            let i = itemNames.indexOf(itemName);
            let tempItem = items[i];
            if (unitsHelper[tempItem.unit] != null && unitsHelper[tempItem.unit]) {
              item.quantity = convert(item.quantity).from(unitsHelper[item.unit]).to(unitsHelper[tempItem.unit]);
              item.unit = tempItem.unit;
              item = combineIngredients(user_id, tempItem, item);
              items[i] = item;
            }
            else {
              items.push(item);
              itemNames.push(itemName);
            }

          }
          else {
            items.push(item);
            itemNames.push(itemName);
          }
        }
      }
    }
  }

  return items;
};

function combineIngredients(user_id, a, b) {
  let ids = [];
  a.recipe_ingredient_ids.map(id => {
    ids.push(id);
  });
  b.recipe_ingredient_ids.map(id => {
    ids.push(id);
  });
  return {
    recipe_ingredient_ids: ids,
    quantity: a.quantity + b.quantity,
    unit: a.unit,
    name: a.name,
    type: 'generated',
    note: a.note + '\n\n' + b.note,
    created_by: user_id,
    updated_by: user_id,
  }
}


router.post('/create',
  authMiddleware.verifyAccessToken(true),
  bodyValidator(create_grocery_list),
  async (req, res) => {
    try {
      let listItems = [];
      await Promise.all(req.body.items.map( async item => {
        let listItem = await mongoose.model('listitems').create({
          quantity: item.quantity,
          unit: item.unit,
          name: item.name,
          is_fulfilled: item.is_fulfilled,
          type: 'custom',
          note: item.note,
          created_by: req.user.user_id,
          updated_by: req.user.user_id
        });
        listItems.push(listItem);
      }));

      let list = await mongoose.model('grocerylists').create({
        start_date: null,
        end_date: null,
        type: 'custom',
        items: listItems,
        meals: [],
        created_by: req.user.user_id,
        updated_by: req.user.user_id
      });

      return responseHelper.returnSuccessResponse(req, res, true, list);
    } catch (error) {
      captureException(error);
      return responseHelper.returnInternalServerError(req, res, new String(error));  
    }
  }
);

router.post('/generate',
  authMiddleware.verifyAccessToken(true),
  async (req, res) => {
    try {
      // TODO: Validate start-date and end_date
      let aggregate = await aggregateMealsAndIngredients(req);

      let listItems = await consolidateIngredients(req.user.user_id, aggregate.list_items);

      let items = [];
      await Promise.all(listItems.map(async listItem => {
        let item = await mongoose.model('listitems').create(listItem);
        items.push(item);
      }));

      let list = await mongoose.model('grocerylists').create({
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        type: 'generated',
        items: items,
        meals: aggregate.meals,
        created_by: req.user.user_id,
        updated_by: req.user.user_id
      });


      return responseHelper.returnSuccessResponse(req, res, true, list);
    } catch (error) {
      captureException(error);
      return responseHelper.returnInternalServerError(req, res, new String(error));  
    }
  }
);

// TODO: Test/Verify functionality
// ! Should allow for 'custom' items to remain in list
router.put('/:list_id/update',
  authMiddleware.verifyAccessToken(true),
  bodyValidator(update_grocery_list),
  groceryListMiddleware.checkGroceryListExists,
  groceryListMiddleware.checkGroceryListOwnership,
  groceryListMiddleware.checkGroceryListType('generated'),
  async (req, res) => {
    try {

      // TODO: Validate start_date & end_date
      let aggregate = await aggregateMealsAndIngredients(req);

      let listItems = await consolidateIngredients(req.user.user_id, aggregate.list_items);

      let list = await mongoose.model('grocerylists').findOne({grocery_list_id: req.params.list_id});
      await mongoose.model('listitems').deleteMany(
        {
          _id: {$in: list.items},
          type: 'generated',
          created_by: req.user.user_id,
        });
      
      list = await mongoose.model('grocerylists').findOne({grocery_list_id: req.params.list_id});
      
      let customItems = await mongoose.model('listitems').find({
        _id: {$in: list.items},
        type: {$ne: 'generated'},
        created_by: req.user.user_id
      });
      
      let items = [];
      await Promise.all(listItems.map(async listItem => {
        let item = await mongoose.model('listitems').create(listItem);
        items.push(item);
      }));
      // ! Causes Issues (ObjectId Cast)
      if (customItems.length > 0) {
        items.push(...customItems);
      }

      list = await mongoose.model('grocerylists').findOneAndUpdate(
        {grocery_list_id: req.params.list_id},
        {$set: { start_date: req.body.start_date,
          end_date: req.body.end_date,
          type: 'generated',
          items: items,
          meals: aggregate.meals,
          updated_by: req.user.user_id
        }},
        {new: true}
      );
      
      return responseHelper.returnSuccessResponse(req, res, true, list);
    } catch(error) {
      captureException(error);
      return responseHelper.returnInternalServerError(req, res, new String(error));
    }
  }
);



module.exports = router;