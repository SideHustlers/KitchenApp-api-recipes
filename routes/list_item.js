'use strict'
const express = require('express');
const router = express.Router({mergeParams: true});
const bodyValidator = require('express-validation');
const mongoose = require('mongoose');
const authMiddleware = require('../middlewares/auth');
const responseHelper = require('../helpers/responses');


router.post('/create',
  // authMiddleware.verifyAccessToken,
  async (req, res) => {
    try {
      let list = await mongoose.model('grocerylists').findOne({
        grocery_list_id: req.params.list_id
      });

      let item = await mongoose.model('listitems').create({
        quantity: req.body.quantity,
        unit: req.body.unit,
        name: req.body.name,
        note: req.body.note,
        created_by: req.body.created_by,
        updated_by: req.body.updated_by
      });

      let items = list.items;
      items.push(item);

      list = await list.updateOne({items: items}, {updated_by: req.body.updated_by});

      return responseHelper.returnSuccessResponse(req, res, true, item);
    } catch (error) {
      console.log(error);
      return responseHelper.returnInternalServerError(req, res, new String(error));
    }
  }
);


module.exports = router