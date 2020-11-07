const Joi = require('joi');

// An example Joi body validation

module.exports = {
  body: {
    label: Joi.string().required()
  }
}