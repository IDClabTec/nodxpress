// HistoryModel.js
var mongoose = require('mongoose');
// Setup schema
var HistorySchema = mongoose.Schema({
    User: {
        type: String,
        require: true
    },
    info:{
        User:{
        	type: Array,
        	default:['User']
        },
        method:{
        	type: Array,
        	default:['Register']
        },
        date:{
        	type: Array,
        	default: [new Date()]
        },
        ip:{
        	type: Array,
        	default:['local']
        },
        Actuator: {
        	type: Array,
        	default:['No especificado']
        },
        TimeOn: {
        	type: Array,
        	default: [0]
        }
    },
});


// Export Contact model
var History = module.exports = mongoose.model('History', HistorySchema);
module.exports.get = function (callback, limit) {
    History.find(callback).limit(limit);
}
