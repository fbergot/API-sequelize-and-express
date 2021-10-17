// on récupères les variables d'env
require('dotenv').config();
// on appelle les models (class) Message et User en pointant sur le dossier models
const models = require('../../models');
const bcrypt = require('bcrypt');
const jwtUtils = require("../../utils/jwt_utils");
const Secure = require('../../utils/Secure');
const SALT = process.env.SALT || '10';

// routes /api/user/
module.exports = {
    /**
     * For register user in database
     * @param {Request} req 
     * @param {Response} res 
     * @returns 
     */
    register: function (req, res) {
        // si un des params obligatoire est absent , on renvoit une erreur 400 on ne va pas plus loin
        if (!req.body.username || !req.body.email || !req.body.password) {
           return res.status(400).json({
                "Message": "Missing parameters in body",
                "Expected" : "username , email , password , ?bio"
            });
        }
        // TEST params in body
        if (!Secure.testPassword(req.body.password)) {
            return res.status(400).json({
                "Message" : "Incorrect password",
                "Expected": "Password must contain 6-10 characters and one number",
            });
        }

        if (!Secure.testEmail(req.body.email)) {
            return res.status(400).json({
              "Message": "Incorrect email",
              "Expected": "Email must contain @ and .com or .en, .fr ..."
            });
        }

        if (!Secure.testUsername(req.body.username)) {
            return res.status(400).json({
                "Message" : "Incorrect username",
                "Expected": "Username must contain 3-10 characters : a-z/A-Z or 0-9"
            });
        }

        // on récupère les params du body dans des variables pour plus de pratique
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        const bio = req.body.bio ? req.body.bio : null;

        // on vérifie si cet utilisateur n'existe pas déja dans la table users avec un findOne() qui renvoie une promesse :
        models.User.findOne({
            attributes: ['email'],
            where : {email : email}
        })
        .then(function (userFound) {
            // on teste si l'utilisateur existe deja ou non
            if (!userFound) {
                // si il existe pas (l'email) , on poursuit en hashant son mot de passe avec bcrypt :
                bcrypt.hash(password, parseInt(SALT), function (error, hashedPassord) {
                    if (error) {
                       return res.status(500).json({
                         "Internal error": "Bcrypt error",
                         "Error": error.message
                       });
                    } else {
                        // create obj for add one user
                        const objUser = {};
                        objUser.username = username;
                        objUser.email = email;
                        objUser.password = hashedPassord;
                        objUser.bio = bio;
                        objUser.isAdmin = 0;
                        //fields createdAt and updatedAt are created by default

                        // create new user with good params if not error in brypt
                        models.User.create(objUser)
                        .then(function (newUser) {
                            // si tout c'est bien passé on renvoie une 201 (ajouté) ainsi que l'id du newUser 
                            return res.status(201).json({ "userId": newUser.id });
                        })
                        .catch(function (error) {
                            // si ici un pb c'est passé on renvoie une erreur interne(500 internal error)
                            return res.status(500).json({
                                "Internal error": "Internal error for create new user",
                                "Error": error.message
                            });
                        })                        
                    } 
                })               
            } else {
                // si il existe ou renvoie une 409 conflict
                return res.status(409).json({ "Conflict error": "This user already exist" });               
            }
            
        })
        .catch(function (error) {
            return res.status(500).json({
                "Internal error": "Impossible to verify user",
                "Error" : error.message
            });
        })
        
    },
    /**
     * For login user
     * @param {Request} req 
     * @param {Response} res 
     * @returns 
     */
    login: function (req, res) {
        // on vérifie que l'on a bien l'email et le password
        if (!req.body.email || !req.body.password) {
            return res.status(400).json({
                "Message": "Missing parameters for login user",
                "Expected": "email , password"
            });
            
        } else {
            // on récupère les params du body
            const email = req.body.email;
            const password = req.body.password;

            /*
                FAIRE VERIFS ICI
            */
            
            // on cherche si le user existe en bd
            models.User.findOne({
                // ici on ne met pas attributes car on veut recupérer toutes les infos d'un enregistrement(id,email,username ect..)
                where : {email : email}
            })
            .then(function (userFound) {
                if (userFound) {
                    // on compare le hash avec le password en clair avec brypt.compare()
                    // prettier-ignore
                    bcrypt.compare(password, userFound.password, function (error, responseBcrypt) {
                        if (responseBcrypt) {
                            return res.status(200).json({
                                "userId": userFound.id,
                                "token": jwtUtils.generateToken(userFound)
                            });

                        } else if(!responseBcrypt) {
                            return res.status(403).json({ "Message": "Invalid password" });

                        } else if(error) {
                            return res.status(500).json({
                                "Message": "Internal error",
                                "Error": error.message
                            });
                        }
                    });                        
                } else {
                    return res.status(404).json({ "Message": 'User not exist in database' });
                }
            })
            .catch(function(error) {
                return res.status(500).json({
                  "Internal error": "Impossible to verify if user exist",
                  "Error": error.message
                });
            })
        }
    },
    /**
     * Get user infos if token is good
     * @param {Request} req 
     * @param {Response} res 
     * @returns {Response}
     */
    userInfos: function (req, res) {
        // get token in authorization header
        const authorization = req.headers['authorization'];
        const token = jwtUtils.parseAuthorization(authorization);

        if (token) {
            // test if token is correct
            try {
                var decodedToken = jwtUtils.verifyToken(token);
            } catch (err) {
               return res.status(401).json({ "Message": "Error with token" }); 
            }

            if (decodedToken.userId && typeof decodedToken.userId === 'number') {
                // find user by primary key
                models.User.findByPk(decodedToken.userId, {
                    attributes : ['id' , "email", "username" , "bio"]
                })
                .then(function(userFound) {
                    if (userFound) {
                       return res.status(202).json(userFound);
                    }
                    return res.status(404).json({ "Message": "User not found" });
                })
                .catch(function (error) {
                    return res.status(500).json({
                        "Internal error": 'User not found',
                        "Error": error.message
                    });
                })
                
            } else {
               return res.status(400).json({ "Message": "Missing information or bad information in token" });                            
            }
            
        } else {
               return res.status(401).json({ "Message": "Missing token" });             
        }
    },
    /**
     * Update user infos
     * @param {Request} req 
     * @param {Response} res 
     * @returns 
     */
    updateUserInfos: function (req, res) {
        // get token in authorization header
        const authorization = req.headers["authorization"];
        const token = jwtUtils.parseAuthorization(authorization);

        if (token) {
            try {
                var decodedToken = jwtUtils.verifyToken(token);
            } catch (err) {
                return res.status(401).json({ "Message": "Error with token, user not authenticated" });
            }
            // dans l'optique de mise a jpour de la bio uniquement pour le moment
            if (!req.body.bio) {
                return res.status(400).json({
                    "Message": "Missing parameters",
                    "Expected" : "bio"
                })
            }
            // on recupère la bio puis on l'analyse contre les caracteres malveillants
            const newbio = Secure.sanitarize(req.body.bio);

            if (decodedToken.userId && typeof decodedToken.userId === "number") {
              // find user by primary key
              models.User.findByPk(decodedToken.userId, {
                //   pour l'instant on met a jour que la bio
                attributes: ["id", "bio"]
              })
                .then(function (userFound) {
                  if (userFound) {
                    // ici on fait l'update sur l'instance trouvée par le findByPk directement(la ligne de bd)
                    userFound
                      .update({
                        bio: newbio ? newbio : userFound.bio
                      })
                      .then(function () {
                        return res.status(200).json(userFound);
                      })
                      .catch(function (error) {
                        return res.status(500).json({
                          "Internal error": "Cannot update user",
                          "Message": error.message
                        });
                      });
                  } else {
                    return res.status(404).json({ "Message": "User not found" });
                  }
                })
                .catch(function (error) {
                  return res.status(500).json({
                    "Internal error": "User not found",
                    "Message": error.message
                  });
                });
            } else {
              return res.status(400).json({
                "Message": "Missing information or bad information in token"
              });
            }
        } else {
            return res.status(401).json({ "Message": "Missing token" });
         }
    }
}