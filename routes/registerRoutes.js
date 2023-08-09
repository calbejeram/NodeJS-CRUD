const express = require('express');
const router = express.Router();

router.get('/', (request, response) => {
    response.render('index');
});

router.get('/register', (request, response) => {
    response.render('register');
});


module.exports = router;