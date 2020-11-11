const Joi = require('joi');

module.exports = {
  body: {
    name: Joi.string().required(),
    prep_time: Joi.string().allow(null).allow(''),
    cook_time: Joi.string().allow(null).allow(''),
    difficulty: Joi.number().allow(null).allow(''),
    rating: Joi.number().min(0).max(5).allow(null).allow(''),
    special_requirements: Joi.string().allow(null).allow(''),
    author: Joi.string().allow(null).allow(''),
    accessibility: Joi.string().allow(null).allow(''),
    type: Joi.string().required(),
    source: Joi.string().allow(null).allow(''),
    serving_size: Joi.number().allow(null).allow(''),
    allergies: Joi.array().items(Joi.string()).allow([]).allow(null),
    calories: Joi.number().allow(null).allow(''),
    tags: Joi.array().items(Joi.string()).allow([]).allow(null),
    preferences: Joi.array().items(Joi.string()).allow([]).allow(null),
    ingredients: Joi.array().items(Joi.string()).required(),
    instructions: Joi.string().required(),
    media: Joi.array().items(Joi.string()).allow([]).allow(null)
  }
}