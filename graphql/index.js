const {merge} = require('lodash');
const { schema: Recipe } = require('./recipe');
const { stitchSchemas } = require('graphql-tools');

module.exports = {
  schema: stitchSchemas({
    subschemas: [
      Recipe
    ]
  })
}