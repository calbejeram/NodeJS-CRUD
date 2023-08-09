const express = require('express');
const router = express.Router();
const registrationController = require("../controller/authAccount");

router.post('/register', registrationController.register);

router.post('/login', registrationController.login);

router.get('/updateform/:email', registrationController.updateform);

router.post('/updateuser', registrationController.updateuser);

router.get('/deleteaccount/:account_id', registrationController.deleteaccount);

router.get('/logout', registrationController.logout);

router.get('/skillsets', registrationController.skillsets)


module.exports = router;