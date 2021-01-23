//AlarmMode.js
var mongoose = require('mongoose');
// Setup schema
var AlarmSchema = mongoose.Schema({
    Accionadores: {
        type: String,
        require: true
    },
    Tiempo: {
        type: String,
        require: true
    },
    Es: { 
        type: String,
        require: true
    },
    Index: {
    	type: String,
    	require: true
    },
    User: {
    	type: String,
    	require: true
    },
    method: {
        type: Number,
        require: true
    },
    Directions: {
        type: String,
        require: true
    },
});


// Export Contact model
var Alarms = module.exports = mongoose.model('alarm', AlarmSchema);
module.exports.get = function (callback, limit) {
    Alarms.find(callback).limit(limit);
}
