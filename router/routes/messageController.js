const models = require("../../models");
const jwtUtils = require("../../utils/jwt_utils");

// on a sequelize db:drop pour enlever le champs userId de la migration de message , puis db:create pour réinitialiser une db
module.exports = {
    /**
     * User create one message
     * Need authentication for this route
     * @param {Request} req 
     * @param {Response} res 
     * @returns {newMessage|error}
     */
    createMessage: function (req, res) {
        // get token in authorization header
        const authorization = req.headers["authorization"];
        const token = jwtUtils.parseAuthorization(authorization);

        if (token) {
            try {
                var decodedToken = jwtUtils.verifyToken(token);
            } catch (error) {
                return res.status(401).json({ "Message": "Error with token, user not authenticated" });
            }
            // verify if good parameters in body-request
            if (!req.body.title || !req.body.content) {
                return res.status(400).json({
                    "Message": "Missing parameters in body for create message",
                    "Expected" : "title , content"
                })
            }
            // vérification de la taille et des caracteres et les insécures à faire
            const title = req.body.title;
            const content = req.body.content;
            // on créera le slug pour la piece détachée(photo) à faire..

            // on vérifie que l'on a bien le userId dans le token décodé et quil est du bon type
            if (decodedToken.userId && typeof decodedToken.userId === 'number') {
                // on trouve le user qui veut écrire un message
                models.User.findByPk(decodedToken.userId, {})
                .then(function(userFound) {
                    if (!userFound) {
                        return res.status(404).json({
                            "Message": "User not found"
                        });
                    }
                    // create object message
                    const objMess = {};
                    objMess.title = title;
                    objMess.content = content;
                    objMess.like = 0;
                    // le champs UserId a été généré automatiquement donc il y a une majuscule au U de UserId
                    objMess.UserId = userFound.id;

                    // create one message
                    models.Message.create(objMess)
                    .then(function(newMessage) {
                        return res.status(201).json(newMessage);
                    })
                    .catch(function(error) {
                       return res.status(500).json({
                            "Internal error": "Cannot create message",
                            "Message" : error.message
                        })
                    })
                })
                .catch(function(error) {
                    return res.status(500).json({
                        "Internal error": "Cannot find user",
                        "Message" : error.message
                    })
                })
                
            } else {
                return res.status(400).json({
                    "Message": "Missing information or bad information in token"
                });
            }

        } else {
            return res.status(401).json({
                "Message": "Missing token"
            });
        }        
    },
    /**
     * Find all messages according to params in url
     * Not need authentication for this route
     * @param {Request} req 
     * @param {Response} res 
     */
    getAllMessages: function (req, res) {
      // pour pouvoir rendre la requete plus flexible, on imaginera plusieurs options dans lurl (ou pas à voir) :
      // -fields : les champs à récupérer , -limit : la limite des messages à récup , -offset: a partir de quel id on récup , order : ordre récupération
      //on aura un objet avec la chaine de params traités issu du l'url.on cherchera alors  :
        
        const fields = req.query.fields;
        const limit = parseInt(req.query.limit);//sera NaN si null
        const offset = parseInt(req.query.offset);//sera NaN si null
        const order = req.query.order;

        // création de la requête pour récupérer tous les messages avec un findAll():
        //On fonctionnera avec des conditions pour vérifier si les params existent
        models.Message.findAll({
          order: [order != null ? order.split(":") : ["title", "ASC"]], //on test pour donner une valeur par defaut si rien
          attributes: fields !== "*" && fields != null ? fields.split(",") : null, //on test pour donner une valeur par defaut si rien
          limit: !isNaN(limit) ? limit : null, //on test pour donner une valeur par defaut si rien
          offset: !isNaN(offset) ? offset : null, //on test pour donner une valeur par defaut si rien
         // cette clé permet de définir quelles infos d'associations devront etre présentes dans les résultats :
          include: [
            {
              model: models.User,
              attributes: ["username"]
            }
          ]
        })
          .then(function (messages) {
            if (messages) {
              return res.status(200).json(messages);
            }
            return res.status(404).json({ "Message": "Messages not found" });
          })
          .catch(function (error) {
            return res.status(500).json({
              "Internal error": "Invalid fields, messages not found",
              "Message": error.message
            });
          });
    }
}