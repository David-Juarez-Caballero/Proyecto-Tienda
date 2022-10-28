const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const Acount = new Schema({
    money: {type: double, required:true},
    collectibles: {type: [String], required:true},
    },
    {timestamps: true}
);

module.exports = mongoose.model('acount',Acount)