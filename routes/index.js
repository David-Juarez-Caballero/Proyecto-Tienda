const express = require('express');
const{createAcount} = require ('../controllers');
const{addfundsAcount} = require ('../controllers');


    const router = express.Router();

    router.post('/acount', createAcount);
    router.put('/acount/:id', addfundsAcount);
    

    module.exports = {
        router
    }