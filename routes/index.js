const express = require('express');
const{createAcount} = require ('../controllers');
const{addfundsAcount} = require ('../controllers');
const{orderandSell} = require ('../controllers');

    const router = express.Router();

    router.post('/acount', createAcount);
    router.put('/acount/:id', addfundsAcount);
    router.post('/acount/:id/order', orderandSell);
    

    module.exports = {
        router
    }