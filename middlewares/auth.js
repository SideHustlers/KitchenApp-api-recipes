const fs = require('fs');
const jwt = require('jsonwebtoken');
const responses = require('../helpers/responses');
const accessTokenPublicKey = fs.readFileSync('keys/jwtRS512.key.pub');

module.exports = {
  verifyAccessToken: function(req, res, next) {
    if(req.headers.authorization) {
      var authHeader = req.headers.authorization;
      var token;
      if (authHeader.startsWith("Bearer ")){
        token = authHeader.substring(7, authHeader.length);
      } else {
        return responses.returnForbiddenResponse(req, res, "Invalid token format, must be a Bearer token");
      }
      jwt.verify(token, accessTokenPublicKey, async function(err, decoded) {
        if (err) {
          return responses.returnForbiddenResponse(req, res, err);
        } else {
          try {
            req.user = decoded;
            next();
          } catch (err) {
            console.log(err);
            return responses.returnBadRequest(req, res, "Something went wrong, please try again");
          }
        }
      });
    } else {
      return responses.returnForbiddenResponse(req, res, "Missing authorization header");
    }
  }
}