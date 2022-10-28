const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {router} = require ('./routes')


//Creando la express app
const app = express();
const apiPort = process.env.Api_PORT || 3003;

// configurando la express app
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
app.use(bodyParser.json())
app.use('/',router);

//Decirle a la app que escuche/atienda las llamadas que le lleguen y simoplemente dormir
//cuando no lleguen nuevas llamadas, no se muere el proceso
app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));