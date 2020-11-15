const mongoose = require('mongoose');
const { withFilter } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('graphql-tools');
const pubsub = require('../redis');

const recipeMiddleware = {
  Query: {
    recipes: async (resolve, parent, args, context, info) => {
      // You can use middleware to override arguments
      console.log(context);
      let resp = await resolve(parent, args, context, info);
      return resp;
    },
  },
}

const typeDefs = `
  type Subscription { recipes: SubscribeData! }
  type SubscribeData {
    action: String!,
    data: Recipe!
  }
  type Query { recipes: [Recipe] }
  type Media {
    medium_id: String!,
    priority: Int,
    url: String!,
    type: String!,
    created_by: String,
    updated_by: String,
    created_at: String,
    updated_at: String
  }
  type Ingredient {
    ingredient_id: String!,
    name: String!,
    type: String,
    quantity: Int,
    unit: String,
    raw: String,
    rating: String,
    media: [Media],
    created_by: String,
    updated_by: String,
    created_at: String,
    updated_at: String
  }
  type Recipe {
    recipe_id: String!,
    name: String!,
    prep_time: String,
    cook_time: String,
    difficulty: Int,
    rating: Int,
    special_requirements: String,
    author: String,
    accessibility: String,
    type: String,
    source: String,
    serving_size: String,
    allergies: [String],
    calories: Int,
    tags: [String],
    preferences: [String],
    ingredients: [Ingredient],
    media: [Media],
    created_by: String,
    updated_by: String,
    created_at: String,
    updated_at: String
  }
`;

const resolvers = {
  Query: {
    recipes: async (parent, args, context, info) => {
      try {
        if (context.user === 'anonymous') {
          let recipes = await mongoose.model('recipes').find({
            accessibility: "PUBLIC"
          }).exec();
          return recipes;
        } else {
          let recipes = await mongoose.model('recipes').find({
            $or: [
              {
                accessibility: "PUBLIC"
              },
              {
                $and: [
                  {
                    accessibility: "PRIVATE",
                    created_by: context.user.user_id
                  }
                ]
              }
            ]
          }).exec();
          return recipes;
        }
      } catch (err) {
        console.log(err);
        throw new ApolloError("Something went wrong, please try again", "BAD REQUEST");
      }
    }
  },
  Subscription: {
    recipes:  {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['RECIPE']),
        (payload, variables, context) => {
          let user = context.user;
          if (user === 'anonymous') {
            return payload.recipes.data.accessibility === 'PUBLIC'
          } else {
            return (payload.recipes.data.accessibility === 'PUBLIC' || payload.recipeAdded.created_by == context.user.user_id);
          }
        }
      )
    }
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

const schemaWithMiddleware = applyMiddleware(
  schema,
  recipeMiddleware,
);

module.exports = {
  schema: schema
};