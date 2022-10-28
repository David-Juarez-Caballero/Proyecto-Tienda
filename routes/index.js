const express = require('express');
const{
    createAcount} = require ('../controllers');

    const router = express.Router();

    router.post('/acount', createAcount);
    

    module.exports = {
        router
    }