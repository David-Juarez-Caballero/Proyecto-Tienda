const FS = require('../firebase');
const {db} = FS;

//Primer Endpoint: Crear la cuenta
const createAcount = async (req, res) => {
    try {
        const {body: acount}= req;
        //enviar respuesta
        const acountDB = db.collection('acounts');
        const {_path: { segments } } = await acountDB.add(acount);
        const id = segments[1]; 
        res.send({
            status:200,
            id,
            collectibles:[]
        })
        } catch(error) {
            res.send(error)
    }
}





module.exports = {
    createAcount

}