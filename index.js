
const dns = require('dns')


var figlet = require('figlet');

let express = require('express')

var nodemailer = require('nodemailer');

let mailTransporter = nodemailer.createTransport({ 
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
  service: 'gmail', 
  auth: { 
    user: 'idclab.tec@gmail.com', 
    pass: 'electronatura'
  } 
}); 



let bodyParser = require('body-parser');

const morgan=require('morgan')
const mongoose = require('mongoose')


var mqtt = require('mqtt');

var client  = mqtt.connect('mqtt://46.101.114.216:1883',{
  protocolId: 'MQTT',
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 1000,
  resubscribeOnReconnect: true,
  username:"nodxpress",
  password:"electronatura"
});

var clienthtml = mqtt.connect('ws://46.101.114.216:1884',{
  protocolId: 'MQTT',
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 1000,
  resubscribeOnReconnect: true});
	

var mosca = require('mosca');

let app = express()


var urlencodedParser = bodyParser.urlencoded({extended:true});


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

let apiRoutes=require("./api-routes")
app.use('/api',apiRoutes)


app.use(morgan('dev'))

Contact = require('./contactModel');
History = require('./HistoryModel')

var router=express.Router();

app.use(express.static('./public'));
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.set('views',__dirname+'/public');


console.log(figlet.textSync('IDC LAB', {
      horizontalLayout: 'default',
      verticalLayout: 'default'
  }));
mongoose.connect('mongodb://localhost/NODE2', {useNewUrlParser: true});
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.on('connecting',function(){
  console.log('Mongo DB connecting...')
})
db.once('open', function() {
  console.log("Mongo DB databse conected");
});

//MQTT

var settings = {
  port: 1883,
  http: {
    host: "48.101.114.216",
    port: 1884,
    static: './sensors'
  }
};



var server = new mosca.Server(settings);

Users = require('./usersModel');

server.on('clientConnected', function(client) {
    console.log('client connected', client.id);
});



server.on('published', function(packet, client) {
// console.log('Published', packet.payload.toString());
});


server.on('ready', setup);
// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running');
}
client.on('disconnect',function(message){
	console.log('client disconnect:',message);
})
client.on('connect', function (clientConnected) {
	Users.find({},function(a,b){for(var i=0;i<b.length;i++){for(var e=0;e<b[i].Topics.length;e++){
	var topic=b[i].Topics[e].type+'/'+b[i].Topics[e].location+'/'+b[i].Topics[e].topic;client.subscribe(topic,
function(err){if(!err){}})}}
  });
});
client.on('packetsend',function(packet){
//	console.log('packetsend:',packet);
})


client.on('message', function (topic, message){
    if(topic.split('/')[2] == "temperatura"){
	var temp = message.toString().split('|')[1].toString().replace(/\./g, ',');
      if(temp!=null&&temp!=NaN){
      	Users.find({},function(e,r){var sensor=find(r,message.toString().split('|')[0],'sensorDir','');

	Users.updateMany({'Actuators.Type.SensorInfo.SensorName': sensor.SensorInfo.SensorName},{$set:{'Actuators.$.Type.lastData':temp}},function(a,b){})
      })};
      clienthtml.publish("temperatura", message.toString());
    } else if(topic.split('/')[2] == "Caudalimetro"){console.log('caudal:'+message.toString());
      var temp = message.toString().split('|')[1].toString().replace(/\./g, ',')
      console.log(temp)
      if(temp!=null&&temp!=NaN){
      Users.update({'Actuators.Type.SensorInfo.SensorDir': parseInt(message.toString().split('|')[0])},{$set:{'Actuators.$.Type.lastData':temp}},function(a,b){console.log(b)})
      };
      clienthtml.publish("temperatura", message.toString());

    } else if (topic.split("/")[2] =="Pulsadores"){
      Users.find({},function(err,res){
      var length = message.toString().length;var user;var method;var Actuator;
      console.log('message: '+message.toString());
      var Dir = message.toString().substr(0,length-1);
      var Es = parseInt(message.toString()[length-1])
      var obj = find(res,Dir,'dir');
      if(Es == 0){
        method = 'OFF'
      } else if (Es == 1){
        method = 'ON'
      }
      var info = {
        'method': method,
        'date': new Date(),
        'ip': 'local',
        'Actuator': obj.Name
        };
	Users.updateMany({'Actuators.Name':obj.Name},{$set:{'Actuators.$.Es':Es}},(a,b)=>{console.log(b)})
      updateAllhistory(info.method,info.date,info.ip,info.Actuator);
    });
  } else if(topic.split("/")[2]=="Accionadores"){
	console.log(message.toString().split('/'))
	var msg=message.toString().split('/')[1]
	console.log(msg)
      var length = msg.length;var user;var method;var Actuator;
      var Dir = msg.substr(0,length-1)
      var Es = msg[length-1]
	console.log(Es)
       if(parseInt(Dir)==NaN||parseInt(Es)==NaN){
        Dir = message.toString().split('.')[0];
        Es = message.toString().split('.')[1];
      }
	console.log(Dir)
      if(Es == 0){
        method = 'OFF'
      } else if (Es == 1){
        method = 'ON'
      }
	if(Dir){
	Users.find({},(a,b)=>{Actuator=find(b,Dir,'dir');if(Actuator){
	Users.updateMany({'Actuators.Name': Actuator.Name},{$set:{'Actuators.$.Es': Es}},(c,d)=>{console.log('Result:'+d)})	
	 var info ={
        'method': method,
        'date': new Date(),
 	'ip': '46.101.114.216',
        'Actuator': Actuator.Name
        };
  updateAllhistory(info.method,info.date,info.ip,info.Actuator)
	} else {console.log('Accionador no Encontrado')}
})}
      } else if (topic=="mcu/BombaPruebas"){
        console.log('caudal:',message.toString())
        clienthtml.publish("temperatura", message.toString());
      }
  });

//---
client.on('error',function(error){
  console.log(error)
})
//--
app.get('/sensors',function(req,res){
  res.render('Sensors');

  clienthtml.subscribe('temperatura', function (err) {
    if (!err) {
       console.log("MQTT CONECTED TO HTML SERVER")

    }
  })
 })


app.post('/sendmqtt', function(req,res){
  var info;var data = req.body;var length = data.value.length;var mqqtConect = true;
  var dir = parseInt(data.value.substring(0, length-1));
  Users.find({},function(err,obj){
  var obj = find(obj,dir,'dir')
  var topic = obj.topic
  var obj_es = obj.Es
console.log(obj)
	console.log(parseInt(obj_es));
  if(parseInt(obj_es)!=parseInt(data.value[length-1])){
console.log('El Estado es diferente')
  sendmqtt('/'+data.value+'/',topic);
  mqqtConect = true;
  if(data.value[length-1]=='1'){
  info = {
        'User': data.User,
        'method': 'ON',
        'date': data.date,
        'ip': data.ip,
        'Actuator': data.Actuator
      }
  } else if (data.value[length-1]=='0'){
  info = {
        'User': data.User,
        'method': 'OFF',
        'date': data.date,
        'ip': data.ip,
        'Actuator': data.Actuator
        }; 
  }
  res.end('success');
if(mqqtConect == false){
  res.end('mqttErr')
  var info ={
        'User': data.User,
        'method': 'MQTT ERROR',
        'date': data.date,
        'ip': data.ip,
        'Actuator': data.Actuator
        };

  updateHistory(info.User,info.method,info.date,info.ip,info.Actuator)

    }
      } else if(parseInt(obj_es)==parseInt(data.value[length-1])){
        console.log('El estado es el mismo')
	res.status(300).end('same');
      } else {
        console.log('err')
      }
    })

   });



//views and login/register controller

app.post('/exit', function(req,res){
var data = req.body
res.send('cerrando sesion...')
Users.updateOne({Name: req.body.user},{ipaddress: ''}, function(err,success){if(err) handleError
    var info = JSON.stringify({
        'User': data.User,
        'method': 'exit',
        'date': data.date,
        'ip': data.ip,
        'Actuator': null
        });console.log(info);History.find({User: req.body.user}, function(err,history){
 History.updateOne({User: history[0].User}, {}, function(err,success){console.log(success);})})
});res.end()
});



app.get('/login',function(req,res){
   res.render('login')
});

app.get('/page', function(req,res){  
      res.render('page')
})

app.post('/addTopicObj',function(req,res){addTopic(req.body.User,req.body.Actuator,req.body.Topic); res.status(200).send('success')});


app.post('/addObj',function(req,res){if(req.body.SensorName=='' || req.body.SensorDir==''){console.log(req.body);res.send('Objeto creado'); addObject(req.body.ObjectName, req.body.ObjectDir, 0,req.body.Class, false, '', '',req.body.User);setTimeout(()=>{addTopic(req.body.User,req.body.ObjectName,req.body.Topic)},2000)} else{
	res.send('Objeto creado'); addObject(req.body.ObjectName, req.body.ObjectDir, 0,req.body.Class, true, req.body.SensorName,req.body.SensorDir,req.body.User);setTimeout(()=>{addTopic(req.body.User,req.body.ObjectName, req.body.Topic)},2000)
}})
app.post('/addTopic',function(req,res){topic(req.body.User, req.body.Topic, req.body.Type, req.body.Location);res.send('Topico Creado'); client.subscribe(req.body.Type+'/'+req.body.Location+'/'+req.body.Topic)});

app.get('/',function(req,res){
  res.render('index1')
})

app.get('/LoginError', function(req,res){
  res.render('loginError')
})






app.post('/getHistoryData', function(req,res){
console.log(req.body);
History.find({User: req.body.user}, function(err,result){
  console.log('result'+result)
  if(err){
    res.end(err)
  } else{ 
  console.log(result)
  res.end(JSON.stringify(result[0].info));
  }
})

})

app.get('/info',function(req,res){
  History.find({},function(err,info){
  res.send(info.toString())
  })
})
var authorizing = false


app.get('/History', function(req,res){

  res.render('history', {data: authorizing})

  if(authorizing==false){
    console.log('false')
  } else if (authorizing==true){
    console.log('true')
    authorizing = false
  }
});
app.post('/refreshHistory', function(req,res){
  var index = req.body.info;
  History.find({User: req.body.user},function(err,result){
  console.log(result[0].info);
  console.log(result[0].info);
  var HistoryLenth = result[0].info.User.length;
  var userArray = result[0].info.User;
  var methodArray = result[0].info.method;
  var dateArray = result[0].info.date;
  var ipArray = result[0].info.ip;
  var actuatorArray = result[0].info.Actuator;
  console.log(index.length);
  for(var i=0; i<index.length; i++){
  console.log(index[i]);
  userArray[index[i]] = 'remove';
  methodArray[index[i]] = 'remove';
  dateArray[index[i]] = 'remove';
  ipArray[index[i]] = 'remove';
  actuatorArray[index[i]] = 'remove';
  console.log('user: '+userArray[index[i]])
  console.log('ip: '+ipArray[index[i]])
  console.log('date: '+dateArray[index[i]])
  console.log('methods: '+methodArray[index[i]])

}
  userArray = userArray.filter(function (user) { 
    return user != 'remove';
    });
  methodArray = methodArray.filter(function (method) { 
    return method != 'remove';
    });
  dateArray = dateArray.filter(function (date) { 
    return date != 'remove';
    });
  ipArray = ipArray.filter(function (ip) { 
    return ip != 'remove';
    });
  actuatorArray = actuatorArray.filter(function (actuator) { 
    console.log('actuator:'+actuator)
    return actuator != 'remove';
    });
  History.updateOne({User: req.body.user},{$set:{'info.User': userArray,'info.method': methodArray, 'info.date': dateArray, 'info.ip': ipArray, 'info.Actuator':actuatorArray}},function(err,success){
    setTimeout(()=>{    res.send('success');   },500);
    console.log(success);
    authorizing = true
      });
    });
});




app.post('/authorizing', function(req,res){

  if(req.body.User == null){
    res.end('err');
    authorizing = false;
  } else if (req.body.User != null){
    res.end('success');
    console.log('success');
    authorizing = true;
  }
});
app.post('/loginUser',urlencodedParser,function(req,res){
console.log(req.body);
Users.find({Name: req.body.Name}, function(err, user){
     if(user[0]==undefined){
               res.end("err");
            } else if (user[0].Name == req.body.Name && user[0].pass == req.body.Pass){
            console.log("Succes!");
            Users.find({ipaddress: req.body.ip},function(err,result){
              if(result[0]!=undefined){
                Users.updateOne({Name: result[0].Name}, {ipaddress: ''}, function(err,success){
                  console.log('cambiando sesión');
                  Users.updateOne({Name: user[0].Name},{ipaddress: req.body.ip},function(err,success){console.log('success',success)
            });

                })
              } else {

              Users.updateOne({Name: user[0].Name},{ipaddress: req.body.ip},function(err,success){
              console.log(success)

            });
              }
            })


            res.end(JSON.stringify(user[0].Name))  
          } else {
            console.log("Credentials wrong");
            res.end("err");
          }

        });
  });




app.post('/registerUser', urlencodedParser,function(req,res){
  Users.find({Name:req.body.Name}, function(err,user){
    console.log(req.body.Name)
    console.log(user)
    if(JSON.stringify(user)!='[]'){
      res.end('err');
    }
    if(JSON.stringify(user)=='[]'){
      loginData=req.body;
    console.log("añadiendo:  "+req.body.Name+"  "+req.body.email+"  "+req.body.password)
    res.end(JSON.stringify({'user': req.body.Name}))
// save the contact and check for errors
    Users.create({Name: req.body.Name, pass: req.body.password, email: req.body.email},function(err,result){
    console.log(result);
    History.create({User: req.body.Name, info: ''},function(err,success){
      if(err) handleError
      console.log(success)
    });
    History.updateOne({User:req.body.Name},{$set:{'info.User': [req.body.User],'info.method': ['create'], 'info.date': [new Date()], 'info.ip': [null], 'info.Actuator': [null]}},function(err,update){
        console.log('Historial creado')
    })
    });

    }
  })


})
Alarms = require('./AlarmModel')
var alarm = []
app.post('/alarm', urlencodedParser, function(req,res){
    var AlarmsDATA = [];var AlarmDay = req.body.day;var AlarmHour = req.body.Hour;var Actuators = req.body.Objects;var Directions = [];var method = req.body.method;var index = '';
    console.log('Actuators'+Actuators)
    for(var i = 0; i<Actuators.length; i++){
      Directions[i] = Actuators[i].split(',')[1]; 
    }
    Users.find({Name: req.body.User},function(a,b){
    	if(!a){
    		var alarms=b[0].Alarms;console.log(alarms); var index=cheeck();if(AlarmDay == undefined || method == null || Directions == undefined){
    		res.status(300).res('Debe introducir una hora y un dia validos');
    	} else {
    	console.log(index);
    	console.log('Creando alarma del usuario:',req.body.User+'...'); 
    	var TimeSplit = AlarmHour.split(":");
    	var hours = correctHours(TimeSplit[0]);
    	var minutes = TimeSplit[1]; var day=getDay(AlarmDay,hours,minutes);
		var a = [];var minutes = TimeSplit[1];a[index] = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()+day ,hours, minutes, 0, 0);
    	alarm[index] = setInterval(()=>{timeOut(a[index],method,Directions,req.body.User,index,true,alarm)}, 1000); var data ={'Actuators':Actuators, 'Es':'ON', 'index':index,'day':AlarmDay,'hour':hours,'minutes':minutes,'Dirs':Directions,'method':method};
    	Users.update({Name:req.body.User},{$push:{Alarms:data}},function(a,b){console.log(b);res.end(JSON.stringify(data));
})}}})});


function cheeck(){
	var number = Math.floor(Math.random() * 1000000);
	if(alarm[number]!=null || alarm[number]!=undefined || alarm[number]!='empty'){
		return number;
	} else {
		number = cheeck();
		return number;
	}
}


app.post('/AlarmStatus', function(req,res){
  console.log(req.body);
  Users.update({'Alarms.index': parseInt(req.body.index)},{$set:{'Alarms.$.Es': req.body.method}}, function(err,result){
    if(err)
      res.send(err);
    console.log(result)
    res.end()
  })
})
app.post('/getDataSensors',function(req,res){
  Users.find({Name: req.body.user},function(err,obj){
    var obj = obj[0]
    var sensors = [];
    var e = 0
    console.log(obj.Actuators[0].Type.data)
    for(var i=0;i<obj.Actuators.length;i++){
      console.log(obj.Actuators[i].Type.withSensor)
      if(obj.Actuators[i].Type.withSensor==true){
        sensors[e] = {'Name':obj.Actuators[i].Type.SensorInfo.SensorName, 'Dir':obj.Actuators[i].Type.SensorInfo.SensorDir, 'data': obj.Actuators[i].Type.data, 'topic': obj.Actuators[i].Type.SensorInfo.SensorTopic, 'type':obj.Actuators[i].Type.SensorInfo.SensorType};
        e++
      }
    }
  res.send(JSON.stringify(sensors)).status(200);
  })
})


//-----------------------------------------------------------//

 app.listen(80,()=>{console.log('server on port 80')})

app.post('/deleteAlarms', function(req,res){
Users.find({Name:req.body.User},function(a,b){if(b[0].Alarms.length!=0){for(var i=0;i<b[0].Alarms.length;i++){clearInterval(alarm[b[0].Alarms[i].index])}}})
deleteAlarms(req.body.User);
res.end()

})

app.post('/refreshConsumeAll', function(req,res){
  Contact.find({}, function(err,obj){
    console.log(obj)
    var consume = []
    var directions = []
    var names = []
    if(err) handleError
    for(var i = 0; i<obj.length; i++){
    consume[i] = obj[i].Consume;
    directions[i] = obj[i].direction;
    names[i] = obj[i].Name
    }
    console.log(consume)
    console.log(directions)
    console.log(names)
    var data = {'Consume': JSON.stringify(consume), 'Directions': JSON.stringify(directions), 'Names': JSON.stringify(names)}
    res.end(JSON.stringify(data))

  })


})

app.post('/graphs',function(req,res){
Contact.find({},function(err,result){
  var a = []
for(var i = 0; i<result.length-1; i++){
  a[i] = {Y:parseInt(result[i].Consume), label: result[i].Name}
  console.log(a) 
  res.end(JSON.stringify(a))
    };
});}) 







 
var Sampleinterval={};

app.post('/takeSamples',urlencodedParser,function(req,res){
	var replace = false;
	var data = {'SampleName': req.body.name,'date':req.body.time,'interval':req.body.interval, 'data': [], 'time': []};
	Users.find({'Actuators.Type.SensorInfo.SensorName': req.body.sensor, 'Name':req.body.user },function(a,b){console.log('obj',b);var sensor=find(b[0].Actuators,req.body.sensor,'sensor');
		console.log(sensor.data.length);var length=sensor.data.length;
		if(length==undefined){length=0};
	for(var i=0; i<length;i++){
		console.log(sensor.data[i].SampleName+' == '+req.body.name);
		if(sensor.data[i].SampleName==req.body.name){replace=true}};	
	 if(replace==false){Users.updateOne({'Name': req.body.user, 'Actuators.Type.SensorInfo.SensorDir': sensor.SensorInfo.SensorDir},{$push:{'Actuators.$.Type.data':data}},function(e,success){console.log('success',success)})
	} else if(replace==true){Users.updateOne({'Name': req.body.user, 'Actuators.Type.data.SampleName': req.body.name},{ $set: { "Actuators.$[].Type.data.$[tag2]": data } }, 
   { arrayFilters: [  { "tag2.SampleName": req.body.name} ],multi:true},function(e,r){console.log('response is',r);replace=true;console.log(replace);});
	}	
	clearInterval(Sampleinterval[req.body.name+req.body.user+sensor.SensorInfo.SensorDir]); Sampleinterval[req.body.name+req.body.user+sensor.SensorInfo.SensorDir]=setInterval(()=>{takeSamples(req.body.time,req.body.name,req.body.user,sensor.SensorInfo.SensorDir)}, req.body.interval)
});
});
function takeSamples(time,name,user,sensorDir){
	var time0 = new Date() - new Date(time) 
	var now = new Date().getTime();
	var date = new Date(time)
	var diferent = (date.getTime()-now)/10000 - 359;
	console.log(diferent);
	Users.find({},function(e,m){var sensor=find(m,sensorDir,'sensorDir');
	console.log(sensor.lastData)
	if(diferent>0){Users.update({'Actuators.Type.data.SampleName':name, 'Name':user},{$push:{'Actuators.$[].Type.data.$[tag2].data':sensor.lastData, 'Actuators.$[].Type.data.$[tag2].time': new Date()}},{ arrayFilters: [  { "tag2.SampleName": name} ],multi:true},function(a,b){console.log(b)})} else {
clearInterval(Sampleinterval[name+user+sensorDir])
Users.find({Name: user},function(a,b){
console.log(b)
let mailDetails = { 
  from: 'idclab.tec@gmail.com', 
  to: b[0].email,
  subject: 'Finalizo la toma de muestras de '+sensor.SensorInfo.SensorName+'.', 
  html: '<!DOCTYPE html><html><head><link rel=\'stylesheet\' href=\'http://nodxpress.com/css2/style.css\'><style type=\'text/css\'>.content {position: relative;}.content img {position: relative;top: 0px;right: 0px;}.image {float:left;margin-left:5px;float:left;margin-top:5px;}</style></head><div class=\'main\'><section class=\'sign-in\'><div class=\'container\'><div class=\'image\'><img class=\'content\' width=120 height=90 src=\'http://www.nodxpress.com/img/icons/creativity.png\' alt=\'Investigacion y Desarrollo Comunitario\'></div><br><div class=\'signin-content\'><div width=\'300\' height=\'300\'><h2 class=\'form-title\'>Ha Finalizado la toma de Muestras de \'+sensor.SensorInfo.SensorName+\'</h2><br><p>El periodo de prueba tuvo una duracion de \'+Math.roud(((time0)*1000)/3600)+\' horas desde el \'+zfill(date.getDate(),2)+\'/\'+zfill(date.getMonth(), 2)+\'/\'+date.getFullYear()+\' a las \'+zfill(date.getHours(),2)+\':\'+zfill(date.getMinutes(),2)+\':\'+zfill(date.getMinutes(),2)+\' con un total de <strong>\'+sensor+\' muestras</strong></p><br><br><p>Si desea descargar los datos presione <a href=\'https://www.nodxpress.com\'>AQUI<a> o en caso de obtener un informa completo entre a la pagina <a href=\'https://www.nodxpress.com/page\'>PRINCIPAL</a> y vaya a la seccion de sensores</p>\'</div></div></div></section></div></body></html><style type=\'text/css\'>   /* @extend display-flex; */display-flex, .display-flex, .display-flex-center, .signup-content, .signin-content, .social-login, .socials {  display: flex;  display: -webkit-flex; }/* @extend list-type-ulli; */list-type-ulli, .socials {  list-style-type: none;  margin: 0;  padding: 0; }/* poppins-300 - latin */@font-face {  font-family: \'Poppins\';  font-style: normal;  font-weight: 300;  src: url(\'../fonts/poppins/poppins-v5-latin-300.eot\');  /* IE9 Compat Modes */  src: local(\'Poppins Light\'), local(\'Poppins-Light\'), url(\'../fonts/poppins/poppins-v5-latin-300.eot?#iefix\') format(\'embedded-opentype\'), url(\'../fonts/poppins/poppins-v5-latin-300.woff2\') format(\'woff2\'), url(\'../fonts/poppins/poppins-v5-latin-300.woff\') format(\'woff\'), url(\'../fonts/poppins/poppins-v5-latin-300.ttf\') format(\'truetype\'), url(\'../fonts/poppins/poppins-v5-latin-300.svg#Poppins\') format(\'svg\');  /* Legacy iOS */ }/* poppins-300italic - latin */@font-face {  font-family: \'Poppins\';  font-style: italic;  font-weight: 300;  src: url(\'../fonts/poppins/poppins-v5-latin-300italic.eot\');  /* IE9 Compat Modes */  src: local(\'Poppins Light Italic\'), local(\'Poppins-LightItalic\'), url(\'../fonts/poppins/poppins-v5-latin-300italic.eot?#iefix\') format(\'embedded-opentype\'), url(\'../fonts/poppins/poppins-v5-latin-300italic.woff2\') format(\'woff2\'), url(\'../fonts/poppins/poppins-v5-latin-300italic.woff\') format(\'woff\'), url(\'../fonts/poppins/poppins-v5-latin-300italic.ttf\') format(\'truetype\'), url(\'../fonts/poppins/poppins-v5-latin-300italic.svg#Poppins\') format(\'svg\');  /* Legacy iOS */ }/* poppins-regular - latin */@font-face {  font-family: \'Poppins\';  font-style: normal;  font-weight: 400;  src: url(\'../fonts/poppins/poppins-v5-latin-regular.eot\');  /* IE9 Compat Modes */  src: local(\'Poppins Regular\'), local(\'Poppins-Regular\'), url(\'../fonts/poppins/poppins-v5-latin-regular.eot?#iefix\') format(\'embedded-opentype\'), url(\'../fonts/poppins/poppins-v5-latin-regular.woff2\') format(\'woff2\'), url(\'../fonts/poppins/poppins-v5-latin-regular.woff\') format(\'woff\'), url(\'../fonts/poppins/poppins-v5-latin-regular.ttf\') format(\'truetype\'), url(\'../fonts/poppins/poppins-v5-latin-regular.svg#Poppins\') format(\'svg\');  /* Legacy iOS */ }/* poppins-italic - latin */@font-face {  font-family: \'Poppins\';  font-style: italic;  font-weight: 400;  src: url(\'../fonts/poppins/poppins-v5-latin-italic.eot\');  /* IE9 Compat Modes */  src: local(\'Poppins Italic\'), local(\'Poppins-Italic\'), url(\'../fonts/poppins/poppins-v5-latin-italic.eot?#iefix\') format(\'embedded-opentype\'), url(\'../fonts/poppins/poppins-v5-latin-italic.woff2\') format(\'woff2\'), url(\'../fonts/poppins/poppins-v5-latin-italic.woff\') format(\'woff\'), url(\'../fonts/poppins/poppins-v5-latin-italic.ttf\') format(\'truetype\'), url(\'../fonts/poppins/poppins-v5-latin-italic.svg#Poppins\') format(\'svg\');  /* Legacy iOS */ }/* poppins-500 - latin */@font-face {  font-family: \'Poppins\';  font-style: normal;  font-weight: 500;  src: url(\'../fonts/poppins/poppins-v5-latin-500.eot\');  /* IE9 Compat Modes */  src: local(\'Poppins Medium\'), local(\'Poppins-Medium\'), url(\'../fonts/poppins/poppins-v5-latin-500.eot?#iefix\') format(\'embedded-opentype\'), url(\'../fonts/poppins/poppins-v5-latin-500.woff2\') format(\'woff2\'), url(\'../fonts/poppins/poppins-v5-latin-500.woff\') format(\'woff\'), url(\'../fonts/poppins/poppins-v5-latin-500.ttf\') format(\'truetype\'), url(\'../fonts/poppins/poppins-v5-latin-500.svg#Poppins\') format(\'svg\');  /* Legacy iOS */ }/* poppins-500italic - latin */@font-face {  font-family: \'Poppins\';  font-style: italic;  font-weight: 500;  src: url(\'../fonts/poppins/poppins-v5-latin-500italic.eot\');  /* IE9 Compat Modes */  src: local(\'Poppins Medium Italic\'), local(\'Poppins-MediumItalic\'), url(\'../fonts/poppins/poppins-v5-latin-500italic.eot?#iefix\') format(\'embedded-opentype\'), url(\'../fonts/poppins/poppins-v5-latin-500italic.woff2\') format(\'woff2\'), url(\'../fonts/poppins/poppins-v5-latin-500italic.woff\') format(\'woff\'), url(\'../fonts/poppins/poppins-v5-latin-500italic.ttf\') format(\'truetype\'), url(\'../fonts/poppins/poppins-v5-latin-500italic.svg#Poppins\') format(\'svg\');  /* Legacy iOS */ }/* poppins-600 - latin */@font-face {  font-family: \'Poppins\';  font-style: normal;  font-weight: 600;  src: url(\'../fonts/poppins/poppins-v5-latin-600.eot\');  /* IE9 Compat Modes */  src: local(\'Poppins SemiBold\'), local(\'Poppins-SemiBold\'), url(\'../fonts/poppins/poppins-v5-latin-600.eot?#iefix\') format(\'embedded-opentype\'), url(\'../fonts/poppins/poppins-v5-latin-600.woff2\') format(\'woff2\'), url(\'../fonts/poppins/poppins-v5-latin-600.woff\') format(\'woff\'), url(\'../fonts/poppins/poppins-v5-latin-600.ttf\') format(\'truetype\'), url(\'../fonts/poppins/poppins-v5-latin-600.svg#Poppins\') format(\'svg\');  /* Legacy iOS */ }/* poppins-700 - latin */@font-face {  font-family: \'Poppins\';  font-style: normal;  font-weight: 700;  src: url(\'../fonts/poppins/poppins-v5-latin-700.eot\');  /* IE9 Compat Modes */  src: local(\'Poppins Bold\'), local(\'Poppins-Bold\'), url(\'../fonts/poppins/poppins-v5-latin-700.eot?#iefix\') format(\'embedded-opentype\'), url(\'../fonts/poppins/poppins-v5-latin-700.woff2\') format(\'woff2\'), url(\'../fonts/poppins/poppins-v5-latin-700.woff\') format(\'woff\'), url(\'../fonts/poppins/poppins-v5-latin-700.ttf\') format(\'truetype\'), url(\'../fonts/poppins/poppins-v5-latin-700.svg#Poppins\') format(\'svg\');  /* Legacy iOS */ }/* poppins-700italic - latin */@font-face {  font-family: \'Poppins\';  font-style: italic;  font-weight: 700;  src: url(\'../fonts/poppins/poppins-v5-latin-700italic.eot\');  /* IE9 Compat Modes */  src: local(\'Poppins Bold Italic\'), local(\'Poppins-BoldItalic\'), url(\'../fonts/poppins/poppins-v5-latin-700italic.eot?#iefix\') format(\'embedded-opentype\'), url(\'../fonts/poppins/poppins-v5-latin-700italic.woff2\') format(\'woff2\'), url(\'../fonts/poppins/poppins-v5-latin-700italic.woff\') format(\'woff\'), url(\'../fonts/poppins/poppins-v5-latin-700italic.ttf\') format(\'truetype\'), url(\'../fonts/poppins/poppins-v5-latin-700italic.svg#Poppins\') format(\'svg\');  /* Legacy iOS */ }/* poppins-800 - latin */@font-face {  font-family: \'Poppins\';  font-style: normal;  font-weight: 800;  src: url(\'../fonts/poppins/poppins-v5-latin-800.eot\');  /* IE9 Compat Modes */  src: local(\'Poppins ExtraBold\'), local(\'Poppins-ExtraBold\'), url(\'../fonts/poppins/poppins-v5-latin-800.eot?#iefix\') format(\'embedded-opentype\'), url(\'../fonts/poppins/poppins-v5-latin-800.woff2\') format(\'woff2\'), url(\'../fonts/poppins/poppins-v5-latin-800.woff\') format(\'woff\'), url(\'../fonts/poppins/poppins-v5-latin-800.ttf\') format(\'truetype\'), url(\'../fonts/poppins/poppins-v5-latin-800.svg#Poppins\') format(\'svg\');  /* Legacy iOS */ }/* poppins-800italic - latin */@font-face {  font-family: \'Poppins\';  font-style: italic;  font-weight: 800;  src: url(\'../fonts/poppins/poppins-v5-latin-800italic.eot\');  /* IE9 Compat Modes */  src: local(\'Poppins ExtraBold Italic\'), local(\'Poppins-ExtraBoldItalic\'), url(\'../fonts/poppins/poppins-v5-latin-800italic.eot?#iefix\') format(\'embedded-opentype\'), url(\'../fonts/poppins/poppins-v5-latin-800italic.woff2\') format(\'woff2\'), url(\'../fonts/poppins/poppins-v5-latin-800italic.woff\') format(\'woff\'), url(\'../fonts/poppins/poppins-v5-latin-800italic.ttf\') format(\'truetype\'), url(\'../fonts/poppins/poppins-v5-latin-800italic.svg#Poppins\') format(\'svg\');  /* Legacy iOS */ }/* poppins-900 - latin */@font-face {  font-family: \'Poppins\';  font-style: normal;  font-weight: 900;  src: url(\'../fonts/poppins/poppins-v5-latin-900.eot\');  /* IE9 Compat Modes */  src: local(\'Poppins Black\'), local(\'Poppins-Black\'), url(\'../fonts/poppins/poppins-v5-latin-900.eot?#iefix\') format(\'embedded-opentype\'), url(\'../fonts/poppins/poppins-v5-latin-900.woff2\') format(\'woff2\'), url(\'../fonts/poppins/poppins-v5-latin-900.woff\') format(\'woff\'), url(\'../fonts/poppins/poppins-v5-latin-900.ttf\') format(\'truetype\'), url(\'../fonts/poppins/poppins-v5-latin-900.svg#Poppins\') format(\'svg\');  /* Legacy iOS */ }a:focus, a:active {  text-decoration: none;  outline: none;  transition: all 300ms ease 0s;  -moz-transition: all 300ms ease 0s;  -webkit-transition: all 300ms ease 0s;  -o-transition: all 300ms ease 0s;  -ms-transition: all 300ms ease 0s; }input, select, textarea {  outline: none;  appearance: unset !important;  -moz-appearance: unset !important;  -webkit-appearance: unset !important;  -o-appearance: unset !important;  -ms-appearance: unset !important; }input::-webkit-outer-spin-button, input::-webkit-inner-spin-button {  appearance: none !important;  -moz-appearance: none !important;  -webkit-appearance: none !important;  -o-appearance: none !important;  -ms-appearance: none !important;  margin: 0; }input:focus, select:focus, textarea:focus {  outline: none;  box-shadow: none !important;  -moz-box-shadow: none !important;  -webkit-box-shadow: none !important;  -o-box-shadow: none !important;  -ms-box-shadow: none !important; }input[type=checkbox] {  appearance: checkbox !important;  -moz-appearance: checkbox !important;  -webkit-appearance: checkbox !important;  -o-appearance: checkbox !important;  -ms-appearance: checkbox !important; }input[type=radio] {  appearance: radio !important;  -moz-appearance: radio !important;  -webkit-appearance: radio !important;  -o-appearance: radio !important;  -ms-appearance: radio !important; }img {  max-width: 100%;  height: auto; }figure {  margin: 0; }p {  margin-bottom: 0px;  font-size: 15px;  color: #777; }h2 {  line-height: 1.66;  margin: 0;  padding: 0;  font-weight: bold;  color: #222;  font-family: Poppins;  font-size: 36px; }.main {  background: #f8f8f8;  padding: 150px 0; }.clear {  clear: both; }body {  font-size: 13px;  line-height: 1.8;  color: #222;  background: #f8f8f8;  font-weight: 400;  font-family: Poppins; }.container {  width: 900px;  background: #fff;  margin: 0 auto;  box-shadow: 0px 15px 16.83px 0.17px rgba(0, 0, 0, 0.05);  -moz-box-shadow: 0px 15px 16.83px 0.17px rgba(0, 0, 0, 0.05);  -webkit-box-shadow: 0px 15px 16.83px 0.17px rgba(0, 0, 0, 0.05);  -o-box-shadow: 0px 15px 16.83px 0.17px rgba(0, 0, 0, 0.05);  -ms-box-shadow: 0px 15px 16.83px 0.17px rgba(0, 0, 0, 0.05);  border-radius: 20px;  -moz-border-radius: 20px;  -webkit-border-radius: 20px;  -o-border-radius: 20px;  -ms-border-radius: 20px; }.display-flex {  justify-content: space-between;  -moz-justify-content: space-between;  -webkit-justify-content: space-between;  -o-justify-content: space-between;  -ms-justify-content: space-between;  align-items: center;  -moz-align-items: center;  -webkit-align-items: center;  -o-align-items: center;  -ms-align-items: center; }.display-flex-center {  justify-content: center;  -moz-justify-content: center;  -webkit-justify-content: center;  -o-justify-content: center;  -ms-justify-content: center;  align-items: center;  -moz-align-items: center;  -webkit-align-items: center;  -o-align-items: center;  -ms-align-items: center; }.position-center {  position: absolute;  top: 50%;  left: 50%;  transform: translate(-50%, -50%);  -moz-transform: translate(-50%, -50%);  -webkit-transform: translate(-50%, -50%);  -o-transform: translate(-50%, -50%);  -ms-transform: translate(-50%, -50%); }.signup {  margin-bottom: 150px; }.signup-content {  padding: 75px 0; }.signup-form, .signup-image, .signin-form, .signin-image {  width: 50%;  overflow: hidden; }.signup-image {  margin: 0 55px; }.form-title {  margin-bottom: 33px; }.signup-image {  margin-top: 45px; }figure {  margin-bottom: 50px;  text-align: center; }.form-submit {  display: inline-block;  background: #6dabe4;  color: #fff;  border-bottom: none;  width: auto;  padding: 15px 39px;  border-radius: 5px;  -moz-border-radius: 5px;  -webkit-border-radius: 5px;  -o-border-radius: 5px;  -ms-border-radius: 5px;  margin-top: 25px;  cursor: pointer; }  .form-submit:hover {    background: #4292dc; }#signin {  margin-top: 16px; }.signup-image-link {  font-size: 14px;  color: #222;  display: block;  text-align: center; }.term-service {  font-size: 13px;  color: #222; }.signup-form {  margin-left: 75px;  margin-right: 75px;  padding-left: 34px; }.register-form {  width: 100%; }.form-group {  position: relative;  margin-bottom: 25px;  overflow: hidden; }  .form-group:last-child {    margin-bottom: 0px; }input {  width: 100%;  display: block;  border: none;  border-bottom: 1px solid #999;  padding: 6px 30px;  font-family: Poppins;  box-sizing: border-box; }  input::-webkit-input-placeholder {    color: #999; }  input::-moz-placeholder {    color: #999; }  input:-ms-input-placeholder {    color: #999; }  input:-moz-placeholder {    color: #999; }  input:focus {    border-bottom: 1px solid #222; }    input:focus::-webkit-input-placeholder {      color: #222; }    input:focus::-moz-placeholder {      color: #222; }    input:focus:-ms-input-placeholder {      color: #222; }    input:focus:-moz-placeholder {      color: #222; }input[type=checkbox]:not(old) {  width: 2em;  margin: 0;  padding: 0;  font-size: 1em;  display: none; }input[type=checkbox]:not(old) + label {  display: inline-block;  line-height: 1.5em;  margin-top: 6px; }input[type=checkbox]:not(old) + label > span {  display: inline-block;  width: 13px;  height: 13px;  margin-right: 15px;  margin-bottom: 3px;  border: 1px solid #999;  border-radius: 2px;  -moz-border-radius: 2px;  -webkit-border-radius: 2px;  -o-border-radius: 2px;  -ms-border-radius: 2px;  background: white;  background-image: -moz-linear-gradient(white, white);  background-image: -ms-linear-gradient(white, white);  background-image: -o-linear-gradient(white, white);  background-image: -webkit-linear-gradient(white, white);  background-image: linear-gradient(white, white);  vertical-align: bottom; }input[type=checkbox]:not(old):checked + label > span {  background-image: -moz-linear-gradient(white, white);  background-image: -ms-linear-gradient(white, white);  background-image: -o-linear-gradient(white, white);  background-image: -webkit-linear-gradient(white, white);  background-image: linear-gradient(white, white); }input[type=checkbox]:not(old):checked + label > span:before {  content: \'\f26b\';  display: block;  color: #222;  font-size: 11px;  line-height: 1.2;  text-align: center;  font-family: \'Material-Design-Iconic-Font\';  font-weight: bold; }.agree-term {  display: inline-block;  width: auto; }label {  position: absolute;  left: 0;  top: 50%;  transform: translateY(-50%);  -moz-transform: translateY(-50%);  -webkit-transform: translateY(-50%);  -o-transform: translateY(-50%);  -ms-transform: translateY(-50%);  color: #222; }.label-has-error {  top: 22%; }label.error {  position: relative;  background: url(\'../images/unchecked.gif\') no-repeat;  background-position-y: 3px;  padding-left: 20px;  display: block;  margin-top: 20px; }label.valid {  display: block;  position: absolute;  right: 0;  left: auto;  margin-top: -6px;  width: 20px;  height: 20px;  background: transparent; }  label.valid:after {    font-family: \'Material-Design-Iconic-Font\';    content: \'\f269\';    width: 100%;    height: 100%;    position: absolute;    /* right: 0; */    font-size: 16px;    color: green; }.label-agree-term {  position: relative;  top: 0%;  transform: translateY(0);  -moz-transform: translateY(0);  -webkit-transform: translateY(0);  -o-transform: translateY(0);  -ms-transform: translateY(0); }.material-icons-name {  font-size: 18px; }.signin-content {  padding-top: 67px;  padding-bottom: 87px; }.social-login {  align-items: center;  -moz-align-items: center;  -webkit-align-items: center;  -o-align-items: center;  -ms-align-items: center;  margin-top: 80px; }.social-label {  display: inline-block;  margin-right: 15px; }.socials li {  padding: 5px; }  .socials li:last-child {    margin-right: 0px; }  .socials li a {    text-decoration: none; }    .socials li a i {      width: 30px;      height: 30px;      color: #fff;      font-size: 14px;      border-radius: 5px;      -moz-border-radius: 5px;      -webkit-border-radius: 5px;      -o-border-radius: 5px;      -ms-border-radius: 5px;      transform: translateZ(0);      -moz-transform: translateZ(0);      -webkit-transform: translateZ(0);      -o-transform: translateZ(0);      -ms-transform: translateZ(0);      -webkit-transition-duration: 0.3s;      transition-duration: 0.3s;      -webkit-transition-property: transform;      transition-property: transform;      -webkit-transition-timing-function: ease-out;      transition-timing-function: ease-out; }  .socials li:hover a i {    -webkit-transform: scale(1.3) translateZ(0);    transform: scale(1.3) translateZ(0); }.zmdi-facebook {  background: #3b5998; }.zmdi-twitter {  background: #1da0f2; }.zmdi-google {  background: #e72734; }.signin-form {  margin-right: 90px;  margin-left: 80px; }.signin-image {  margin-left: 110px;  margin-right: 20px;  margin-top: 10px; }@media screen and (max-width: 1200px) {  .container {    width: calc( 100% - 30px);    max-width: 100%; } }@media screen and (min-width: 1024px) {  .container {    max-width: 1200px; } }@media screen and (max-width: 768px) {  .signup-content, .signin-content {    flex-direction: column;    -moz-flex-direction: column;    -webkit-flex-direction: column;    -o-flex-direction: column;    -ms-flex-direction: column;    justify-content: center;    -moz-justify-content: center;    -webkit-justify-content: center;    -o-justify-content: center;    -ms-justify-content: center; }  .signup-form {    margin-left: 0px;    margin-right: 0px;    padding-left: 0px;    /* box-sizing: border-box; */    padding: 0 30px; }  .signin-image {    margin-left: 0px;    margin-right: 0px;    margin-top: 50px;    order: 2;    -moz-order: 2;    -webkit-order: 2;    -o-order: 2;    -ms-order: 2; }  .signup-form, .signup-image, .signin-form, .signin-image {    width: auto; }  .social-login {    justify-content: center;    -moz-justify-content: center;    -webkit-justify-content: center;    -o-justify-content: center;    -ms-justify-content: center; }  .form-button {    text-align: center; }  .signin-form {    order: 1;    -moz-order: 1;    -webkit-order: 1;    -o-order: 1;    -ms-order: 1;    margin-right: 0px;    margin-left: 0px;    padding: 0 30px; }  .form-title {    text-align: center; } }@media screen and (max-width: 400px) {  .social-login {    flex-direction: column;    -moz-flex-direction: column;    -webkit-flex-direction: column;    -o-flex-direction: column;    -ms-flex-direction: column; }  .social-label {    margin-right: 0px;    margin-bottom: 10px; } }/*# sourceMappingURL=style.css.map */</style>'

}; 
mailTransporter.sendMail(mailDetails, function(err, data) { 
  if(err) { 
    console.log(err); 
  } else { 
    console.log('Email sent successfully'); 
  } 
}); 
})
}
})};




app.post('/viewSamples',function(req,res){
	Users.find({Name:req.body.user},function(a,b){var sensor=find(b[0].Actuators,req.body.sensor,'sensor');var toSend=[] ;for(var i=0;i<sensor.data.time.length;i++){toSend[i]={'time':sensor.data.time[i],'sample':sensor.data.Data[i]}} res.end(JSON.stringify(toSend))})
})
app.post('/getDataUser', function(req,res){
      //search sessions with ip address
      Users.find({ipaddress:req.body.ip},function(err,ressult){
	console.log(ressult)
        if(JSON.stringify(ressult)=='[]'){
          console.log("No hay ninguna sesión con esta direccion ip o usuario")
          res.send('err');
	return;
        }
       else if (JSON.stringify(ressult)!='[]' && JSON.stringify(ressult[0].Name)===JSON.stringify(req.body.user)){
	console.log("El usuario ya tiene una sesion iniciada");
         History.find({User: ressult[0].Name}, function(err,history){
         var info ={
        'User': ressult[0].Name,
        'method': 'enter',
        'date': new Date(),
        'ip': req.body.ip,
        'Actuator': null
        }
        updateHistory(info.User,info.method,info.date,info.ip,info.Actuator);
	var objects = ressult;
if(req.body.user!='IDC LAB'){
if(JSON.stringify(objects[0].Actuators)=='[]'){
	console.log("clear");
      res.end('clear');
      } else if (JSON.stringify(objects.Actuators)!='[]' && objects!=null){
        console.log('actuators:',objects);
        var obj = []
        console.log(objects);
        for(var i=0; i<objects[0].Actuators.length;i++){
        obj[i] = {'Name':objects[0].Actuators[i].Name, 'direction':objects[0].Actuators[i].Dir, 'Es': objects[0].Actuators[i].Es, 'Class': objects[0].Actuators[i].Class}};
      Users.find({Name:req.body.user}, function(err,alarms){
      var alarms = alarms[0].Alarms;
      console.log('alarms:',alarms);
	console.log('sending...');
	var data = JSON.stringify({'Objects': JSON.stringify(obj), 'Alarms': JSON.stringify(alarms)});
	setTimeout(()=>{res.end(data)},2000);
	console.log(req.body.user);
})}}
else if(req.body.user==='IDC LAB'){console.log("admi detected");res.status(200).send('admi')}
})}
else if (JSON.stringify(ressult)!='[]' && JSON.stringify(ressult[0].Name)!=JSON.stringify(req.body.user)){
console.log("here");
History.find({User: ressult[0].Name}, function(err,history){
         var info = {
        'User': ressult[0].Name,
        'method': 'enter',
        'date': new Date(),
        'ip': req.body.ip,
        'Actuator': null
        }
         console.log(info);
           updateHistory(info.User,info.method,info.date,info.ip,info.Actuator);
        });
        console.log("El usuario no tiene una sesion inicia pero si existe una registrada a al direccion IP")
	console.log('result:'+ressult[0]);
	res.send(JSON.stringify({request: 'find', user: JSON.stringify(ressult[0].Name) }))
	return;

		};
    })});





function findwithDir(obj,dir){
  var result=undefined;
if (!obj) {
  return undefined
} else {
  for(var i=0;i<obj.length;i++){
    for(var e=0;e<obj[i].Actuators.length;e++){
      if(obj[i].Actuators[e].Dir==dir){
        result=obj[i].Actuators[e];
        return result;
        break;
      } else {
        continue;
      }
	return result;
    }
  }
}
}


function addObject (Name,dir,Es,Class,withSensor,SensorName,SensorDir,SensorType,User){
  Users.find({'Actuators.Dir': dir},(a,b)=>{if(!b[0]){
  var Name=Name; var dir=dir;var Es=Es; var Class=Class; var withSensor=withSensor; var SensorName=SensorName; var SensorDir=SensorDir; var Time=Time; var Data=Data; var User=User; 
    if(withSensor==false){SensorName = null;SensorDir = null;Time = null;Data = null;}; if(SensorType==undefined){SensorType='temp'};console.log(User);
    var data = {'Name':Name, 'Dir': dir, 'Es': Es, 'updateDate': new Date(), 'Type':{'withSensor': withSensor, 'SensorInfo': {'SensorType': SensorType,'SensorName': SensorName, 'SensorDir': SensorDir}, 'data': [], 'lastData': undefined}, 'Class': Class};console.log(data);Users.update({Name: User},{$push:{Actuators: data}},function(err,success){
    if(err){console.log(err);
    } else if(!err){
console.log('res',success);console.log('success')}})} else {console.log("Ya existe un objeto con la misma dirección")}})};
function updateHistory(User,method,date,ip,Actuator){console.log(User+method+date+ip+Actuator);
  History.updateOne({User: User},{$push:{'info.User': User,'info.method': method, 'info.date': date, 'info.ip': ip, 'info.Actuator': Actuator}},function(err,success){console.log('History Update result:',success);
      })}; function findModel(model,options){model.find({},function(a,b){ if(options==null){console.log('model:',b)}else if(options=='Topics'){console.log('model',b[0].Topics)}else if(options=='Actuators'){console.log('model',b[0].Actuators)}})};
function deleteObject(NameObject){
	if(NameObject==null){console.log('error')}else{Users.find({'Actuators.Name':NameObject},function(a,b){if(!a){Users.delete({'Actuators.Name':NameObject},function(c,d){console.log(d)})}})
}};function deleteModel(object){var Model = object;Model.deleteMany({},function(err,res){console.log(res);console.log('modelo eliminado');});};
function updateActuator (model,find,toChange,target,change){
model.find({},function(a,b){console.log(b)})
	if(model==null||toChange==null||change==null){
		console.log('Debe especificar bien los valores');
	} else{ console.log(target); if(target=='Es'){{model.find({},function(a,b){if(a){console.log('error',a)}else if(!a || b.length!=0){model.updateMany({'Actuators.Name':toChange},{$set: {'Actuators.$.Es':change}},function(c,d){if(!c){console.log('callback:',d)}})}})}
			} else if(target=='Dir'){console.log('target is',target);model.find({},function(a,b){if(a){console.log('error',a)}else if(!a || b.length!=0){model.update({'Actuators.Name':toChange},{$set: {'Actuators.$.Dir':change}},function(c,d){if(!c){console.log('callback:',d)}})}})
}}};
function sendmqtt(message,topic){if(topic=='tomaslazolazo1994'){var msg = message;client.publish('tomaslazolazo1994', '/'+msg+'/')
}else{console.log(topic);client.publish(topic,message)}};
function sendmqttWithDir(dir,message){if(dir==null || message==null ){console.log('err')}else{Users.find({},function(err,res){ var obj = find(res[0].Actuators,dir,'dir');
      console.log(message); client.publish(obj.topic,message)})}}
function topic(user,topic,type,location){
if(user==null||topic==null){console.log('error');}else{Users.update({'Name':user},{$push: {'Topics': {'topic': topic, 'type':type, 'location':location}}},function(a,b){if(a){console.log('err',a)}else if(!a){console.log('request:',b)}})}};
function getDataOfModel (model,target1,target2){
 var result=[];model.find({},function(a,b){for(var i=1;i<b.length+1;i++){result[i-1]=JSON.stringify(b[0].Actuators[i])}});console.log(result);return result};
function addTopic (user,actuator,topic){
	Users.find({Name:user},function(a,b){if(a){console.log(a)}else if(b[0]==null){console.log('objeto no encontrado')} else{
		Users.update({'Actuators.Name':actuator,'Name':user},{$set:{'Actuators.$.topic': topic}},function(c,d){if(c){console.log('error')}else{console.log(d)}})
	}})};
function find(obj,tag,type){if(obj==undefined||tag==undefined){return undefined} else {if(type=='dir'){
		for(var i=0; i<obj.length;i++){
		for(var e=0;e<obj[i].Actuators.length;e++){
			if(obj[i].Actuators[e].Dir==tag){return obj[i].Actuators[e]}}
}}else if(type=='index'){for(var i=0;i<obj.length;i++){
	if(obj[i].index==tag){return obj[i]}}
}else if(type=='sensor'){
		for(var e=0;e<obj.length;e++){
		if(obj[e].Type.withSensor==true){
			if(obj[e].Type.SensorInfo.SensorName==tag){
				return obj[e].Type}}}
			} else if(type=='sensorDir'){
				for(var j=0;j<obj.length;j++){				
				for(var e=0;e<obj[j].Actuators.length;e++){
				if(obj[j].Actuators[e].Type.withSensor==true){
				if(obj[j].Actuators[e].Type.SensorInfo.SensorDir==tag){
				return obj[j].Actuators[e].Type}}}}


			}
}};



function zfill(number, width) {
    var numberOutput = Math.abs(number); /* Valor absoluto del número */
    var length = number.toString().length; /* Largo del número */ 
    var zero = "0"; /* String de cero */  
    
    if (width <= length) {
        if (number < 0) {
             return ("-" + numberOutput.toString()); 
        } else {
             return numberOutput.toString(); 
        }
    } else {
        if (number < 0) {
            return ("-" + (zero.repeat(width - length)) + numberOutput.toString()); 
        } else {
            return ((zero.repeat(width - length)) + numberOutput.toString()); 
        }
    }
}







function getDay(day,hour,minutes){
var d= new Date().getDay();var weekday = new Array(7);weekday[0] = "Sunday";weekday[1] = "Monday";weekday[2] = "Tuesday"; weekday[3] = "Wednesday";weekday[4] = "Thursday";weekday[5] = "Friday";weekday[6] = "Saturday"; 
for (var i=0; i <7 ; i++){if (weekday[i] == day){var weekdayNumber = i};var differentDay = (weekdayNumber - d);if (differentDay<0){differentDay = differentDay+7}; if((new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()+day ,hour, minutes, 0, 0)-new Date().getTime())<60000 || differentDay==0){differentDay=differentDay+6};return differentDay;}}
function correctHours(hours){var meridian; var meridianValue = 0;if (hours > 12) { meridian = 'PM'; hours -= 12; meridianValue=12;} else if (hours < 12) {meridian = 'AM';if (hours == 0) {hours = 12;meridianValue = 0;};} else {meridian = 'PM';meridianValue = 12;};return parseInt(hours)+meridianValue;
};
function timeOut(date,method,dir,user,index,loop,times){
		var times = true;
		console.log(times);
		if(times==true){
        var currents_hours = date.getHours();
        var currents_minutes = date.getMinutes();
        var now = new Date().getTime();
        var distance = (date - now);
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        console.log(days+"d"+hours+"h"+minutes+"m"+seconds+"s");
  if (distance < 0 && times==true) {
       Users.find({Name:user},function(a,b){
       if(b[0].Alarms.length!=0){
       times = false;
 	   console.log('index',index);
       var data = find(b[0].Alarms,index,'index');
       console.log('finalizado...');
       if(data.Es=='OFF'){console.log('Alarma desactivada')}else if(data.Es=='ON'){for(var i=0;i<dir.length;i++){sendmqttWithDir(dir[i],'/'+dir[i]+method+'/')}}
       if(loop==true);{console.log('Repitiendo alarma...');var newdate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()+7 , currents_hours, currents_minutes, 0, 0); clearInterval(alarm[index]); console.log(index);alarm[index]=setInterval(()=>{timeOut(newdate,method,dir,user,index,loop)},1000);
       }}});
  };
};
};
function addDoor(door,location,user){
Users.find({Name:user},function(a,b){if(b[0]==undefined){return;} else{Users.update({Name:user},{$push:{'doors': {'door':door,'location':location,'id':'door'+Math.floor(Math.random() * 1000000)}}},function(c,d){if(!c){console.log('add door success!!')}})}})
}
function run_Alarm(delay,index,User){setTimeout(()=>{Users.find({Name:User},function(a,b){var data = find(b[0].Alarms,index,'index'); console.log(data); alarm[index]=setInterval(()=>{timeOut(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()+getDay(data.day,data.hour,data.minutes) ,data.hour, data.minutes, 0, 0),data.method,data.Dirs,User,index,true,0)},1000)})},delay)}
function deleteAlarms(user){Users.update({Name:user},{$set:{Alarms:[]}},function(a,b){console.log(b)})}
function run_All_Alarms (user) {
	Users.find({Name:user},function(a,b){const model = b[0].Alarms;var delay;for(var i=0;i<model.length;i++){delay=i*1000;run_Alarm(delay,b[0].Alarms[i].index,user)}})
};


app.post('/androidUser',function(req,res){Users.find({'Name':req.body.Name},function(a,b){if(b!=undefined  && JSON.stringify(b[0])!='[]' && JSON.stringify(b).length!=2 ){if(b[0].pass===req.body.Pass){console.log('obj',b);console.log(req);var response={'request':'OK'};res.status(200).end(JSON.stringify(response))} else {var response={'request': 'PassErr'};res.status(200).end(JSON.stringify(response));}} else if(b===undefined){
var response={'request':'UserErr'};res.status(200).end(JSON.stringify(response))
}
})
});


app.post('/GetDataAndroid',function(req,res){if(req.body.Pass!=null && req.body.Name!=null){console.log(req.body);Users.find({Name:req.body.Name},function(a,objects){
var obj = [];
var topics= [];
var sensors =[];
var e = 0;
var sensortopic
    for(var i=0;i<objects[0].Actuators.length;i++){
      if(objects[0].Actuators[i].Type.withSensor==true){
	sensortopic=objects[0].Actuators[i].Type.SensorInfo.SensorTopic;
	console.log(sensortopic)   
     sensors[e] = {'SensorName':objects[0].Actuators[i].Type.SensorInfo.SensorName, 'SensorDir':objects[0].Actuators[i].Type.SensorInfo.SensorDir,'SensorTopic': sensortopic};
	e++;

      }
    }

        for(var i=0; i<objects[0].Actuators.length;i++){
        obj[i] = {'Name':objects[0].Actuators[i].Name,'Topic': objects[0].Actuators[i].topic, 'direction':objects[0].Actuators[i].Dir}
};
console.log(sensors);
res.status(200).end(JSON.stringify({'obj':obj, 'sens':sensors}));
})} else if(req.body.Pass===null || req.body.Name===null){res.status(200).end(JSON.stringify({'obj':'Err'})
)}
});


app.post('/rfid',function(req,res){
console.log(req.body);

Users.find({Key: {$all:[req.body.rfid.replace(/\s/g, '')]}},function(a,b){console.log(b[0]);if(b[0]==undefined){res.status(200).end('304')} else {
for(var n=0;n<b[0].doors.length;n++){
console.log('Door is',b[0].doors[n]);
if(b[0].doors[n].door==req.body.door && b[0].doors[n].location==req.body.location){
	var date = new Date();
	res.status(200).send({'User':b[0].Name,'request':"200"});
	console.log("Success!!");
	updateHistory(b[0].Name,"open",date,NaN,b[0].doors[n]);
	return;
} else {continue}} res.status(200).send({'User':b[0].Name,'request':"400"})
	return;
}
})
});

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line',(event)=>{
if(event=="add"){
var user={}
rl.prompt();
rl.question('User Name >>', (name) => {
if(typeof(name)=="string"){user["Name"]=name;rl.question('Password >>', (pass) => {if(pass.length>8){user["pass"]=pass;rl.question('email (optional) >>', (email)=>{user["email"]=email;rl.question('your shure add the user '+user.Name+'? [Y/N] ',(answer)=>{
switch (answer.trim()) {
	case 'Y':
	console.log(user);
		Users.find({Name:user["Name"]},(a,b)=>{if(b[0]==undefined){console.log(b);Users.create({'Name':user["Name"],'pass':user["pass"],email:user["email"]},(c,d)=>{if(!c){console.log("User Created!");    History.create({User: user.Name, info: []},function(err,success){
      if(err) handleError
      console.log(success)
    });
    History.updateOne({User:user["Name"]},{$set:{'info.User': [user["Name"]],'info.method':['create'], 'info.date': [new Date()], 'info.ip': [null], 'info.Actuator': [null]}},function(err,update){
    })} else {console.log(c);}})} else{console.log("error...")}})
		break;
	case 'N':
		console.log("exit...");
		rl.pause();
		break;
	default:
		console.log("Error...");
		rl.pause();
		rl.write("add");
		break;}})
});} else{rl.write("the pass length most be min 8 character")}})}
	})} else if(event=="view"){
	rl.question('User Name >>',(r)=>{if(r){Users.find({'Name':r},(a,b)=>{console.log(b); rl.question("Something more specific... >>",(r1)=>{if(r1){console.log(b[0][r1])}})})} else {Users.find({},(a,b)=>{console.log(b)})}})
} else if(event=="deleteUser"){
rl.question('User Name:',(answer)=>{Users.remove({Name: answer},(e,r)=>{if(!e){console.log('delete answer',r)}})})
}else if (event=="sensorTopic"){rl.question('Enter Sensor Topic info (topic,user,Acuator) >>',(answer)=>{addSensorTopic(answer.split(',')[0],answer.split(',')[1],answer.split(',')[2])})

} else if(event=="addObj"){var obj={};rl.question('Enter the object parameters\nObject Name >>',(answer)=>{if(typeof(answer)=="string"){obj["Name"]=answer;rl.question('Enter [dir,Class,User]',(answer)=>{var response=answer.split(',');obj["dir"]=response[0];obj["User"]=response[2];obj["Class"]=response[1]; rl.question('Object with Sensor? [Y/N] ',(boolean)=>{switch (boolean.trim()) {
	case "N":
		rl.question('You sure add object? [Y/N] ',(res)=>{
				switch (res.trim()) {
					case 'Y':
						addObject(obj.Name,parseInt(obj.dir),0,obj.Class, false,'','','',obj.User);
						break;
					case 'N':
						rl.write("exit...");
						break;
					default:
						rl.write("Wrong answer!!");
						rl.write("addObj");
						break;
				}

		})
		break;
	case "Y":
		rl.question('Enter [Sensor Name, Sensor Dir, Type]',(sensorInfo)=>{if(sensorInfo.length!=0){var info=sensorInfo.split(',');obj["sensorName"]=info[0];obj["sensorDir"]=info[1];obj["sensorType"]=info[2];addObject(obj.Name,parseInt(obj.dir),0,obj.Class, true,obj.sensorName,obj.sensorDir,obj.sensorType,obj.User)}})
		break;
	default:
		rl.write("addObj");
		break;
}})})}else{rl.write("Invalid Name")}})
} else if(event=="topic"){
  rl.question('Enter Topic info (topic,type,location,user) >>',(answer)=>{
    topic(answer.split(',')[3],answer.split(',')[0],answer.split(',')[1],answer.split(',')[2]);
  })
} else if(event=="addTopic"){
  rl.question('Enter Topic info (user,actuator,topic) >>',(answer)=>{
    addTopic(answer.split(',')[0],answer.split(',')[1],answer.split(',')[2]);
  })
} else if(event=="addDoor"){
  rl.question('Enter door data (name,location,user)) >>',(answer)=>{
	addDoor(answer.split(',')[0],answer.split(',')[1],answer.split(',')[2]);
})
} else if(event=='addKey'){
  rl.question('Enter Key data (value,user) >>',(answer)=>{
	addKey(answer.split(',')[1],answer.split(',')[0]);
})
} else if(event=='viewKey'){
  rl.question('Enter User >>',(r)=>{
	Users.find({Name: r},(a,b)=>{console.log(b[0].Key)})
})
} else if(event=='arrKey'){
  rl.question('Enter USer >>',(r)=>{
	arrKey(r)
})
} else if(event=='deleteObj'){
  rl.question('Enter User >>',(r)=>{
	if(r){
	rl.question('Enter Obj Name >>',(r1)=>{
	if(r1){
		rl.question('are you shure? (Y/N) >>',(r2)=>{
				if(r2.toUpperCase()=="Y"){
					Users.find({'Name': r, 'Actuators.Name': r1},(a,b)=>{if(b){Users.update({'Name': r},{$pull:{Actuators:{Name:r1}}},{multe: true},(err,res)=>{if(!err){console.log(res)}})}})
				} else {console.log("close...")}
			})
		}
})
} else {console.log("Introduzca un usuario valido")}})
}
	})

rl.on('SIGINT', () => {
  rl.question('Are you sure you want to exit? ', (answer) => {
    if (answer.match(/^y(es)?$/i));
  });
});

function addKey(user,value){
Users.find({Key: {$all: [value]}},(a,b)=>{if(b===undefined){Users.update({'Name':user},{$push: {'Key':value}},(r,e)=>{if(!r){console.log('request:',e)} else {console.log(r)}})} else{console.log('unique key error')}})
}
function updateAllhistory(method,date,ip,Actuator){var users=[];Users.find({},(e,r)=>{for(var i=0;i<r.length;i++){for(var e=0;e<r[i].Actuators.length;e++){console.log(r[i].Actuators[e].Name);if(r[i].Actuators[e].Name==Actuator){users.push(r[i].Name);console.log(r[i].Name)} else {continue}}};console.log('users:',users); for(var j=0;j<users.length;j++){console.log(users[j]);updateHistory(users[j],method,date,ip,Actuator)}});
}
function runTakeSamples(){
Users.find({},(a,b)=>{
  for(var i=0;i<b.length;i++){
    for(j=0;j<b[i].Actuators.length;j++){
	if(b[i].Actuators[j].Type.withSensor==true){
      for(k=0;k<b[i].Actuators[j].Type.data.length;k++){
        var now = new Date().getTime()
	var date= new Date(b[i].Actuators[j].Type.data[k].date).getTime()
	var dif=date-now
        if((date - now)>0){
	var name=b[i].Name
	var sample=b[i].Actuators[j].Type.data[k].SampleName
	var limit=new Date(b[i].Actuators[j].Type.data[k].date)
	var dir=b[i].Actuators[j].Type.SensorInfo.SensorDir
	var interval=b[i].Actuators[j].Type.data[k].interval
        Sampleinterval[b[i].Actuators[j].Type.data[k].SampleName+b[i].Name+b[i].Actuators[j].Type.SensorInfo.SensorDir]=setInterval(()=>{
takeSamples(limit, sample,name,dir)},interval)
      }}}}}})}
runTakeSamples()

function arrKey(user){Users.find({'Name':user},(a,b)=>{console.log(typeof(b[0].Key));if(b[0].Key===undefined){Users.update({'Name':user},{'Key':[]},(e,r)=>{console.log(r)})} else if(b[0].Key!=undefined){var arr=[b[0].Key];Users.update({'Name':user},{'Key':arr},(e,r)=>{if(e){console.log(e)} else{console.log('success!!')}})}})}


function addSensorTopic(topic,user,obj){Users.find({'Name':user},function(a,b){for(var i=0;i<b[0].Actuators.length;i++){if(b[0].Actuators[i].Name==obj && b[0].Actuators[i].Type.withSensor==true){console.log('find');Users.update({'Name':user,'Actuators.Name':obj},{$set:{'Actuators.$.Type.SensorInfo.SensorTopic':topic}},function(c,d){console.log(d)})}}})}
Users.find({'Actuators.Dir': 32231},(a,b)=>{if(!b[0]){console.log("undefined")} else {console.log(b)}})
