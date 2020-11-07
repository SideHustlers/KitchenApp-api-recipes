const mongoose = require('mongoose');
const {v4: uuid} = require('uuid');
const recipeSchema = new mongoose.Schema({
  recipe_id: {
    type: String,
    default: uuid(),
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
  },
  prep_time: {
    type: Number,
    required: false,
  },
  cook_time: {
    type: Number,
    required: false
  },
  difficulty: {
    type: Number,
    required: false,
  },
  rating: {
    type: Number,
    required: false,
  },
  special_requirements: {
    type: String,
    required: false,
  },
  author: {
    type: String,
    required: false,
  },
  accessability: {
    type: String,
    required: true,
    // Need to validate (Enumerated Value)
  },
  type: {
    type: String,
    required: true,
    // Need to validate (ENUM)
  },
  source: {
    type: String,
    required: false
  },
  serving_size: {
    type: Number,
    required: false
  },
  ingredients: {
    // ! Look into: https://stackoverflow.com/questions/34230741/adding-json-array-to-a-mongoose-schema-javascript 
    type: Array,
    required: true,
  },
  allergies: {
    type: Array,
    required: true,
    // ? Need to validate (ENUMS) - Strings
  },
  calories: {
    type: Number,
    required: false
  },
  tags: {
    type: Array,
    required: false,
  },
  preferences: {
    type: Array,
    required: false
  },
  created_by: {
    type: String,
    required: true,
    // ! Validate it is a UUID
  },
  updated_by: {
    type: String,
    required: true,
    // ! Validate it is a UUID
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe;