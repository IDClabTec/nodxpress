// contactModel.js
var mongoose = require('mongoose');
// Setup schema
var contactSchema = mongoose.Schema({
    Name: {
        type: String,
        require: true
    },
    direction: {
        type: String,
        require: true
    },
    Es: { 
        type: String,
        require: true
    },
    User: { 
        type: String,
        require: true
    },
    Class: { 
        type: String,
        require: true
    },
    Consume: {
        type: String,
        require: true
    },    
});


// Export Contact model
var Contact = module.exports = mongoose.model('contact', contactSchema);
module.exports.get = function (callback, limit) {
    Contact.find(callback).limit(limit);
}
