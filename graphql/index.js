const { makeExecutableSchema } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const {merge} = require('lodash');
const { typeDefs: Recipe, resolvers: recipeResolvers, middleware: recipeMiddleware } = require('./recipe');
const { typeDefs: GroceryList, resolvers: groceryListResolvers, middleware: groceryListMiddleware } = require('./grocery_list');

const typeDefs = `
  type Query {
    _empty: String
  }
`;

const schema = makeExecutableSchema({
  typeDefs: [typeDefs, Recipe, GroceryList],
  resolvers: merge(recipeResolvers, groceryListResolvers)
});

const schemaWithMiddleware = applyMiddleware(
  schema,
  recipeMiddleware,
  groceryListMiddleware
);

module.exports = {
  schema: schemaWithMiddleware
}