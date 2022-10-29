const FS = require('../firebase');
const { db } = FS;
const collectables = []

//Primer Endpoint: Crear la cuenta
const createAcount = async (req, res) => {
    try {
        //Se solicita que se ingresa la cantidad con la que se creara la cuenta
        const { body: acount } = req;
        //se acced a la base de datos
        const acountDB = db.collection('acounts');
        //se crea una cuenta con la informaci[on dada]
        const { _path: { segments } } = await acountDB.add(acount);
        const id = segments[1];
        //Se envia los datos de la cuenta
        res.send({
            id,
            money: acount.money,
            collectables
        })
    } catch (error) {
        res.send("Surgio un error")
    }
}

//Segundo Endpoint: Actualizar los fondos de la cuenta

const addfundsAcount = async (req, res) => {
    try {
        //Pidiendo el id por medio de los parametros
        const { params: { id } } = req
        //Solicitando la cantidad que se quiere agregar
        const { body: acount } = req
        const { money: newFunds } = acount
        //Se accede a la base y se adquieren los datos necesarios: money
        const acountDB = db.collection('acounts').doc(id)
        const { _fieldsProto } = await acountDB.get()
        const savedMoney = parseInt(_fieldsProto.money.integerValue)
        const col = _fieldsProto.collectables.arrayValue.values.map(collectible => {
            const {mapValue: {fields} } = collectible;
            const {amount, collection_price, collection_name} = fields;
            return {
                collection_name: collection_name.stringValue,
                amount: Number(amount.integerValue || amount.doubleValue),
                collection_price: Number(collection_price.integerValue || collection_price.doubleValue),
            }
        })
        //Comprobacion de que el usuirio ingreso un valor valido
        if ((newFunds > 0 && typeof newFunds === 'number')) {
            // Si el valor es valido entonces
            //Sumar la cantidad gurdada y la nueva 
            const newMoney = newFunds + savedMoney
            //Subir la suma de estas a la base de datos
            const resp = await acountDB.update({
                money: newMoney
            })
            //Enviar el nuevo saldo

            res.send({
                status: 200,
                current_balance: {
                    money: newMoney,
                    collectables: col,
                },
                business_errors: []
            })
        }

        else {
            res.send({
                //eviar el error que se cometio
                status: 505,
                Error: "Se ingreso un numero negativo o algun caracter no valido"
            })

        }
    } catch (error) {
        res.send("Surgio un error")
    }
}

//Tercer endpoint
const orderandSell = async (req, res) => {
    try {
        //Pidiendo el id por medio de los parametros
        const { params: { id } } = req
        //pidiendo valores al usuario
        const { body: { operation, collection_name, amount, collection_price } } = req;
        //Definir que valores son validos
        const validName = (typeof (collection_name) === "string");
        const validAmount = (typeof (amount) === "number") && (amount >= 0);
        const validPrice = (typeof (collection_price) === "number") && (collection_price >= 0);
        //acediendo y obteniendo los datos
        const acountDB = db.collection('acounts').doc(id)
        const userData = await acountDB.get()
        //comprobando si los valores fueron validos
        if (validName && validAmount && validPrice) {

            const { money } = userData.data()

            //Si la operaci[on es buy]
            if (operation === 'BUY') {
                //comprueba si le alcanza el dinero,
                if ((money - (amount * collection_price) >= 0)) {
                    //Al si alcanzarle, se le da el nuevo valor despues de comprar, y se sube a la base de datos
                    const newMoney = money - (amount * collection_price);
                    const resp = await acountDB.update({ money: newMoney })
                    //busca si ya tiene ese collecionable
                    const collectable = collectables.find(x => x.collection_name === collection_name)
                    if (collectable) {
                        //si lo tiene, sola aumenta la cantidad
                        console.log("hola")
                        collectable.amount += amount;
                    }
                    else {
                        //si no lo tiene, sube todos los datos del nuevo coleccionable
                        collectables.push({ collection_name, amount, collection_price })
                    }
                    //enviando los datos
                    res.send({
                        current_balance: {
                            money: newMoney,
                            collectables
                        },
                        business_errors: []
                    })
                    await acountDB.update({ collectables })
                } else {
                    //si no le alcanzo se le manda el aviso
                    res.send({
                        current_balance: {
                            money,
                            collectables
                        },
                        business_errors: ["NOT-ENOUGH-FUNDS"]
                    })
                }
            }
            //si la operaci[on es sell]
            else if (operation === 'SELL') {
                //Buscar si tiene el coleccionable
                const collectable = collectables.find(collectable => collectable.collection_name == collection_name)
                //Si lo encuentra y pero su cantidad es 0 borra el coleccionable de sus coleccion
                if (collectable.amount === 0) {
                    const userC = collectables.indexOf(collectable)
                    collectables.splice(userC, 1)
                }
                // Ver si tiene suficiente cantidad
                if (collectable.amount >= amount) { 
                    //Anadir el nuevo dinero a la cuenta
                    const newMoney = money + (collection_price * amount) 
                    await acountDB.update({ money: newMoney }) 
                    //Restarle la cantidad a los colelecionables
                    collectable.amount =  collectable.amount - amount 
                    //Enviar la respuesta
                    res.send({ 
                        current_balance: {
                            money: newMoney,
                            collectables
                        },
                        business_errors: []
                    })
                } 
                // Si no tiene suficiente cantidad
                else { 
                    res.send({
                        current_balance: {
                            money,
                            collectables
                        },
                        business_errors: ["NOT-ENOUGH-AMOUNT"]
                    })
                }
            }
            //Si no es ningunda de las 2 operaciones
            else if (operation === 'BUY' && operation === 'SELL') {
                res.send({
                    current_balance: {
                        money,
                        collectables
                    },
                    business_errors: ["INVALID-OPERATION"]
                })
            }
        } 
        //Si algun parametro esta incorrecto
        else {
            res.send({
                business_errors: ["INVALID-Parameter"]
            })
        }
        await acountDB.update({ collectables })
    } catch (error) {
        res.send("Surgio un error")
    }

}

module.exports = {
    createAcount,
    addfundsAcount,
    orderandSell
}