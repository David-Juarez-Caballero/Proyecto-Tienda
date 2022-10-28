const { response } = require('express');
const FS = require('../firebase');
const {db} = FS;

//Primer Endpoint: Crear la cuenta
const createAcount = async (req, res) => {
    try {
        const {body: acount}= req;
        const acountDB = db.collection('acounts');
        const {_path: { segments } } = await acountDB.add(acount);
        const id = segments[1]; 
        res.send({
            id,
            money: acount.money,
            collectibles:[]
        })
        } catch(error) {
            res.send("Surgio un error")
    }
}

//Segundo Endpoint: Actualizar los fondos de la cuenta

const addfundsAcount = async (req, res) => {
    try {
        const {params:{id}}=req 
        const {body: acount} = req
        const {money: newFunds} = acount
        //Obteniendo los datos de la cuenta

        const acountDB = db.collection('acounts').doc(id)
        const {_fieldsProto} = await acountDB.get()
        const currentMoney= parseInt(_fieldsProto.money.integerValue)
        
        //Creaqndo la nueva cantidad de dinero
        const NewMoney = currentMoney + newFunds;
        //Actualizando el dinero
        const resp = await acountDB.update({ 
            money: NewMoney
        })
        res.send({
            current_balance: {
                money: NewMoney,
                collectibles: []
            },
            business_errors:[]
        })
        }catch(error) {
            response.send("Surgio un error")
    }
}
 
module.exports = {
    createAcount,
    addfundsAcount
}