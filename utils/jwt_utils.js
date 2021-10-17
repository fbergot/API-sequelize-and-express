require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = {
  /**
   * Create signed token with jwt
   * @param {{id : Number , username : String , email : String , password : String , ?bio : string}} userData
   * @returns {String} token signed with secret
   */
  generateToken: function (userData) {
    const algo = process.env.ALGO_JWT || "HS256";
    const payload = {
      "userId": userData.id,
      "isAdmin": userData.isAdmin
    };
    // sign token
    return jwt.sign(payload, process.env.JWT_SIGN_SECRET, {
      expiresIn: process.env.expiresIN || "1h",
      algorithm: algo
    });
    },
    
  /**
   * 'Parse' the authorization brut for get the token
   * @param {String} brutAuthorization
   * @returns {String|null} token
   */
  parseAuthorization(brutAuthorization) {
    return brutAuthorization ? brutAuthorization.replace("Bearer ", "") : null;
    },
  
  /**
   * Verify the token
   * @param {String} token
   * @returns {{userId:Number , isAdmin:Boolean , iat:Number , exp:Number}} decodedToken
   * @throw error token invalid or expired
   */
  verifyToken: function (token) {
    const algo = process.env.ALGO_JWT || "HS256";
    let decodedToken;
    jwt.verify(
      token,
      process.env.JWT_SIGN_SECRET,
      {
        algorithms: [algo, "HS256"],
        maxAge: process.env.expiresIn || "1h"
      },
      function (err, tokenDecoded) {
        if (tokenDecoded) {
          decodedToken = tokenDecoded;
        }
        if (err) {
          throw new Error("Error token");
        }
      }
    );
    return decodedToken;
  }
};