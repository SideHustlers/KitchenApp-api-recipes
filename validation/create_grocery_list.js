const { json } = require('body-parser');
const Joi = require('joi');

module.exports = {
  body: {
    items: Joi.array().items(Joi.object({
      quantity: Joi.number(),
      unit: Joi.string(),
      name: Joi.string(),
      is_fulfilled: Joi.boolean(),
      note: Joi.string().allow(null),
    })),
    meals: Joi.array().items(Joi.string()),
    start_date: Joi.string(),
    end_date: Joi.string()
  }
}