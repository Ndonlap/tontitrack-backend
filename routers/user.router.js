const express = require('express')
const userController = require("../controllers/user.controller")
const decodeToken = require('../middleware/decodeToken')

const routers = express.Router();

// route to get all users
routers.get("/getAllUsers", userController.getAllUsers)
routers.post("/register", userController.register)
routers.post("/login", userController.login)
routers.get("/getUserDetail", decodeToken, userController.getUserDetail)
// Mount the controllers on specific routes
routers.post('/user', userController.createUser);
routers.get('/:id', userController.getUserById);
routers.put('/:id', userController.updateUser);
routers.post('/:id/contributions', userController.addUserContribution);
routers.post('/:id/sanctions', userController.addUserSanction);
routers.put('/:id/sanctions/:sanctionIndex/done', userController.setSanctionDone);
routers.post('/:id/transactions', userController.addTransactionAndNotification);
routers.post('/:id/notifications', userController.createNotification);
routers.post('/:id/notifications', userController.deleteNotification);
module.exports = routers