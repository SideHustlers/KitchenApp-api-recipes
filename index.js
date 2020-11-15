const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { execute, subscribe } = require('graphql');
const { verifyAccessTokenGraphQL } = require('./middlewares/auth');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { createServer } = require('http');

const app = express();
const port = 8000;
const bodyParser = require('body-parser');
var dotenv = require('dotenv').config();
const models = require('./models');
const router = require('./routes');
const { schema } = require('./graphql/index');


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/', router);

const apolloServer = new ApolloServer({
    schema,
    context: ({req}) => {
      const token = req.headers.authorization || '';
      if (token === '') {
        return { user: "anonymous"}
      } else {
        try {
          let decoded = verifyAccessTokenGraphQL(token);
          return { user: decoded }
        } catch (err) {
          throw err;
        }
      }
    }
  });
  
apolloServer.applyMiddleware({ app, path: '/graphql' });

app.use(function(err, req, res, next){
  console.log(err.name, process.env.NODE_ENV);
  if(err.name === "ValidationError" && process.env.NODE_ENV === "production") {
      var new_err = {
          status: "failed",
          message: "Body validation failed, missing parameters."
      }
      res.status(400).json(new_err)
  }
  else {
      res.status(400).json(err);
  }
});

const server = createServer(app);

server.listen(port, () => {
  new SubscriptionServer({
    execute,
    subscribe,
    schema,
    onConnect: (connectionParams, webSocket, context) => {
      const token = connectionParams.Authorization || connectionParams.authorization || '';
      if (token === '') {
        return { user: "anonymous"}
      } else {
        try {
          let decoded = verifyAccessTokenGraphQL(token);
          return { user: decoded }
        } catch (err) {
          throw err;
        }
      }
    }
  }, {
    server: server,
    path: '/graphql',
  });
  console.log(`App listening on port ${port}!`);

});

module.exports = app;