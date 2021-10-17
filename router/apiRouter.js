const express = require('express');
const userController = require('./routes/userController');
const messageController = require("./routes/messageController");
const likeController = require("./routes/likeController");


module.exports = (function (router) {

    // init express.Router
    const apiRouter = router();
    
    // USER
    apiRouter.route('/users/register/').post(userController.register);
    apiRouter.route("/users/login/").post(userController.login);
    apiRouter.route("/users/userInfos/").get(userController.userInfos);
    apiRouter.route("/users/update/").put(userController.updateUserInfos);

    // MESSAGE
    apiRouter.route('/message/create/').post(messageController.createMessage);
    apiRouter.route("/message/getAll/").get(messageController.getAllMessages);

    // LIKE
    apiRouter.route("/message/like/:messageId").post(likeController.like);
    apiRouter.route("/message/disLike/:messageId").post(likeController.disLike);

    return apiRouter;
})(express.Router);