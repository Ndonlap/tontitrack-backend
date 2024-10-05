const express = require('express');
const tontineController = require('../controllers/tontine.controller');
const decodeToken = require('../middleware/decodeToken')

const routers = express.Router();

// endpoiny yo create a tontine
routers.post('/createTontine', decodeToken, tontineController.createTontine);
routers.get('/getTontineByMember', decodeToken, tontineController.getTontineByMember);
routers.put('/joinTontine', decodeToken, tontineController.joinTontine);
routers.put('/leaveTontine/:id', tontineController.leaveTontine);
routers.get('/getTontineByID/:id', tontineController.getTontineByID);
routers.put('/generateTontineCode/:id', tontineController.generateTontineCode);
routers.put('/processContributions/:id', tontineController.processContributions);
routers.put('/addSecretaryToTontine/:id', tontineController.addSecretaryToTontine);
routers.put('/updateTontineDetails/:id', tontineController.updateTontineDetails);
routers.post('/payment', tontineController.mobilePayment);
routers.delete('/deleteTontine/:id', tontineController.deleteTontine);

module.exports = routers
