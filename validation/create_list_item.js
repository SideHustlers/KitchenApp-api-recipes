const Joi = require('joi');

module.exports = {
  body: {
    quantity: Joi.number(),
    unit: Joi.string(),
    name: Joi.string(),
    note: Joi.string()
  }
}