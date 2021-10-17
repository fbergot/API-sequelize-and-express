const models = require("../../models");
const jwtUtils = require("../../utils/jwt_utils");


// routes
module.exports = {

    /**
     * For user add a like for one message if not already liked
     * route /api/message/like/:messageId
     * @param {Request} req 
     * @param {Response} res 
     * @returns 
     */
    like: function (req, res) {
        // get token in authorization header
        const authorization = req.headers['authorization'];
        const token = jwtUtils.parseAuthorization(authorization);

        // test if token contain "Bearer "
        if (token) {
            // test if token is valid. if not valid , throw one error 
            try {
                var decodedToken = jwtUtils.verifyToken(token);
            } catch (err) {
                return res.status(401).json({ "Message": "Error with token, user not authenticated" });
            }

            // authentication user
            if (decodedToken.userId && typeof decodedToken.userId === 'number') {
                 
                // verify if this user exist
                models.User.findByPk(decodedToken.userId, {
                    attributes: ["id"]
                })
                .then(function (userFound) {
                    if (userFound) {
                        //get in URL messageId
                        const messageIdInUrl = parseInt(req.params.messageId);
                        if (messageIdInUrl <= 0) {
                            return res.status(400).json({ "Message": "Id of message in URL is not correct" });
                        }
                        // find the message with id = messageId with findByPk
                        models.Message.findByPk(messageIdInUrl)
                        .then(function (messageFound) {
                            if(messageFound) {
                                // on va chercher dans la table Like si ce user a deja liké ce message
                                models.Like.findOne({
                                    where: {
                                        userId: decodedToken.userId,
                                        messageId: messageIdInUrl
                                    }
                                })
                                .then(function (isUserAlreadyLiked) {
                                // si une entrée est trouvée c'est que cet utilisateur à déja liké ce message (erreur)
                                    if (isUserAlreadyLiked) {
                                    // conflit 409
                                        return res.status(409).json({ "Message": "This user already liked this message" });
                                    } else {
                                        // ajoute une relation message-user
                                    messageFound.addUser(userFound)
                                    .then(function(alreadyLike) {
                                        messageFound.update({
                                            like : messageFound.like += 1
                                        })
                                        .then(function() {
                                            return res.status(201).json(messageFound);
                                        })
                                        .catch(function(error) {
                                            return res.status(500).json({
                                                "Internal error": "Message counter not update",
                                                "Message" : error.message
                                            })
                                        })
                                    })
                                    .catch(function(error) {
                                        return res.status(500).json({
                                            "Internal error": "Infos already like not ok",
                                            "Message" : error.message
                                        });
                                    })
                                }
                                })
                                .catch(function (error) {
                                    return res.status(500).json({
                                      "Internal error": "Message not liked",
                                      "Message": error.message
                                    });
                                })
                            } else {
                                return res.status(404).json({"Message" : "Message not found with this id"})
                            }
                        })
                        .catch(function (error) {
                            return res.status(500).json({
                                "Internal error": "Message not found",
                                "Message": error.message
                            })
                        })
                
                    } else {
                        return res.status(404).json({ "Message": "User not found" });
                    }
                })
                .catch(function (error) {
                    return res.status(500).json({
                        "Internal error": "User not found",
                        "Message": error.message
                    });
                })
            
            } else {
                return res.status(400).json({
                    "Message": "Missing information or bad information in token"
                });
            }

        } else {
            return res.status(401).json({ "Message": "Missing token" });
        }
    },

    /**
     * For user dislike one message
     * route /api/message/disLike/:messageId
     * @param {Request} req 
     * @param {Response} res 
     * @returns 
     */
    disLike: function (req, res) {
        
        // get token in authorization header
        const authorization = req.headers['authorization'];
        const token = jwtUtils.parseAuthorization(authorization);

        // test if token contain "Bearer "
        if (token) {
            // test if token is valid. if not valid , throw one error 
            try {
                var decodedToken = jwtUtils.verifyToken(token);
            } catch (err) {
                return res.status(401).json({ "Message": "Error with token, user not authenticated" });
            }

        } else {
                return res.status(401).json({ "Message": "Missing token" });
        }
    }
}