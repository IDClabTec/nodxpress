var simple=function(){
// contactModel.js
var mongoose = require('mongoose');
// Setup schema
var contactSchema = mongoose.Schema({
    Name: {
        type: String,
        require: true
    },
    Direccion: {
        type: String,
        require: true
    },
    Estado: { 
        type: String,
        require: true
    },
    
});


// Export Contact model
var Contact = mongoose.model('contact', contactSchema);

   var textMultiple = {
        text1:"text1",
        text2:"text2"
    };
   return textMultiple;

}





}
