
var mqtt = require('mqtt')

var client  = mqtt.connect('mqtt://192.168.43.213')

var mosca = require('mosca');



let express = require('express')

let bodyParser = require('body-parser');

let app = express()


app.use(express.static('public'))

app.use(bodyParser.urlencoded({extended: true}));


app.use(bodyParser.json());



var router=express.Router();

app.get('/mqtt', function(req,res){
  res.render('mqtt')
})

var settings = {
  http: {
    port: 1883,
    bundle: true,
    static: './'
  }
};

var server = new mosca.Server(settings);



server.on('clientConnected', function(client) {
    console.log('client connected', client.id);
});



server.on('published', function(packet, client) {
   console.log("Cliente conectado");
   console.log(packet.payload)
  console.log('Published', packet.payload.toString());
  
 

});


server.on('ready', setup);
// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running');
}


client.on('connect', function () {
  client.subscribe('tomaslazolazo1994', function (err) {
    if (!err) {
       console.log("MQTT CONECTED")
       

      //client.publish('tomaslazolazo1994', 'OK')
    }
  })
})


client.on('message', function (topic, message){
    console.log(host) 
    console.log(message.toString())
  })



var JsonObject = []
var Lenght

app.get('/',function(req,res){
  res.render('index')
 
})


