const Joi = require('joi');

module.exports = {
  body: {
    date: Joi.date().iso().allow(null),
    tags: Joi.array().items(Joi.string()),
    name: Joi.string(),
    total_calories: Joi.number(),
    total_time: Joi.number(),
    total_time_units: Joi.string(), 
    recipes: Joi.array().items(Joi.string())
  }
}