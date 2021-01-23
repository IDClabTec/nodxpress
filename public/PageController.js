$(document).ready(function(){
$('#viewSensors').click(function(){
    window.open("/sensors?user="+user)
})

})

function setAlarm(id){
    var id = id
    var idSplit = id.split(',')
    var index = idSplit[0]
    var direction = idSplit[1]
    var AllDataTime = new Array(3)
    var ButtonName = document.getElementById('buttonName'+index).getAttribute("value") 
    if(document.getElementById(id).getAttribute("value")=="Realizado"){
        if($('#method2'+index).val()!= '' && $('#minutes'+index).val()!= ''){
        var CountDownMinutes = parseInt($('#minutes'+index).val())
        var CountDownhours = parseInt($('#hours'+index).val())  
        var method1 = $('#method1'+index).val()
        var method2= $('#method2'+index).val()
        AllDataTime[index] = [CountDownhours,CountDownMinutes, $('#method2'+index).val()]
        var CountDownMinutes = parseInt($('#minutes'+index).val())
        var CountDownhours = parseInt($('#hours'+index).val())
        if(CountDownMinutes<0){
            CountDownMinutes=0
        } else if (CountDownMinutes>60){
            CountDownMinutes = 60
        }
        if(CountDownhours<0){
            CountDownhours=0
        } else if (CountDownhours==''){
            CountDownhours=0
        }
        var time = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours()+parseInt(CountDownhours), new Date().getMinutes()+parseInt(CountDownMinutes), new Date().getSeconds(), 0);    


            if(method2 == 'ENCENDER'){
                msg2[index] = {'value': direction+'1', 'User': user, 'ip': ip, 'date': new Date(), 'Actuator': ButtonName }
            } else if (method2 =='APAGAR'){
                msg2[index] = {'value': direction+'0', 'User': user, 'ip': ip, 'date': new Date(), 'Actuator': ButtonName }
             }
        clearInterval(a[index])
        countDownTime[index] = time
        document.getElementById('method2'+index).value = ''
        document.getElementById('minutes'+index).value = '00'
        document.getElementById('hours'+index).value = '0'
        a[index] = setInterval(function()
            {
  // Get today's date and time
        now2[index] = new Date().getTime();
  // Find the distance between now and the count down date
        distance2[index] = countDownTime[index] - now2[index];

  // Time calculations for days, hours, minutes and seconds
        days2[index] = Math.floor(distance2[index] / (1000 * 60 * 60 * 24));
        hours2[index] = Math.floor((distance2[index] % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        minutes2[index] = Math.floor((distance2[index] % (1000 * 60 * 60)) / (1000 * 60));
        seconds2[index] = Math.floor((distance2[index] % (1000 * 60)) / 1000);

        document.getElementById("Btntime2"+index).innerHTML =days2[index] + "d, " + zfill(hours2[index],2) + ":"
        + zfill(minutes2[index],2) + ":" + zfill(seconds2[index],2);

  // If the count down is finished, write some text
        if (distance2[index] < 0) {
        document.getElementById("Btntime2"+index).innerHTML = "0d, 00:00:00";
        countDownTime[index]='';
        clearInterval(a[index])
            $.ajax({
            url: '/sendmqtt',
            type: 'post',
            data: msg2[index]
        })
        .done(function() {
            console.log("success");
        })
        .fail(function() {
            console.log("error");
        })    

  }
}

            ,1000)


        var historyAlertProgram01 = document.createElement('div')
        historyAlertProgram01.innerHTML += '<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Se programó a '+ButtonName+' para un tiempo de '+zfill(CountDownhours,2)+':'+zfill(CountDownMinutes,2)+'</strong>.</div>'
        $('#lightsHistory').prepend(historyAlertProgram01)


} else if ($('#method2'+index).val()== '' && $('#minutes'+index).val()== ''){
        var historyAlertProgram01 = document.createElement('div')
        historyAlertProgram01.innerHTML += '<div class="alert alert-warning"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Debe rellenar todos los espacios</strong>.</div>'
        $('#lightsHistory').prepend(historyAlertProgram01)         
        
        } else if ($('#minutes'+index).val()<0)
        {
        var historyAlertProgram01 = document.createElement('div')
        historyAlertProgram01.innerHTML += '<div class="alert alert-warning"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Debe ingresar un tiempo mayor a 0</strong>.</div>'
        $('#lightsHistory').prepend(historyAlertProgram01)         
        

        }

        console.log(index)
        console.log($('#method1'+index).val())
        console.log($('#datatime-local1'+index).val())
        if($('#method1'+index).val()!= ''){
            if($('#method1'+index).val() == 'ENCENDER'){
                msg1[index] = {'value': direction+'1', 'User': user, 'ip': ip, 'date': new Date(), 'Actuator': ButtonName }
                console.log('ON')
            } else if ($('#method1'+index).val() =='APAGAR'){
                msg1[index] = {'value': direction+'0', 'User': user, 'ip': ip, 'date': new Date(), 'Actuator': ButtonName}
                console.log('OFF')
                }
        console.log(msg1[index])

        clearInterval(x[index])   
        var date = new Date($('#datetime-local'+index).val())
        document.getElementById('datetime-local'+index).value = ''
        document.getElementById('method1'+index).value = ''     
        countDownDate[index] = date
// Update the count down every 1 second
        if (countDownDate[index] != 'Invalid Date'){
        var historyAlertProgram01 = document.createElement('div')
        historyAlertProgram01.innerHTML += '<div class="alert alert-info"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Se programó a '+ButtonName+' para el '+zfill(countDownDate[index].getDay(),2)+'/'+zfill(countDownDate
        [index].getMonth(),2)+'/'+zfill(countDownDate[index].getFullYear(),2)+' a las '+zfill(countDownDate[index].getHours(),2)+':'+zfill(countDownDate[index].getMinutes(),2)+':'+zfill(countDownDate[index].getSeconds(),2)+'.</strong></div>'
        $('#lightsHistory').prepend(historyAlertProgram01)
        x[index] = setInterval(function() {
  // Get today's date and time
        now[index] = new Date().getTime();
  // Find the distance between now and the count down date
        distance[index] = countDownDate[index] - now[index];

  // Time calculations for days, hours, minutes and seconds
        days[index] = Math.floor(distance[index] / (1000 * 60 * 60 * 24));
        hours[index] = Math.floor((distance[index] % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        minutes[index] = Math.floor((distance[index] % (1000 * 60 * 60)) / (1000 * 60));
        seconds[index] = Math.floor((distance[index] % (1000 * 60)) / 1000);

        document.getElementById("Btntime"+index).innerHTML =days[index] + "d, " + zfill(hours[index],2) + ":"
        + zfill(minutes[index],2) + ":" + zfill(seconds[index],2);

  // If the count down is finished, write some text
        if (distance[index] < 0) {
        countDownDate[index]='';
        clearInterval(x[index])
        console.log(msg1[index])
        document.getElementById("Btntime"+index).innerHTML = "0d, 00:00:00";
        var historyAlertProgram01 = document.createElement('div')
        historyAlertProgram01.innerHTML += '<div class="alert alert-info"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Finalizado...</strong>.</div>'
        $('#lightsHistory').prepend(historyAlertProgram01)
        $.ajax({
            url: '/sendmqtt',
            type: 'post',
            data: msg1[index]
        })
        .done(function() {
            console.log("success");
        })
        .fail(function() {
            console.log("error");
        })
        
  }
}, 1000);
} else {
        var historyAlertProgram01 = document.createElement('div')
        historyAlertProgram01.innerHTML += '<div class="alert alert-error"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>La fecha no es valida</strong>.</div>'
        $('#lightsHistory').prepend(historyAlertProgram01)
                    };
                };
            };
        }



function pause(id){

        var index = id.split(',')    
        if (document.getElementById("Btntime2"+index[1]).innerText != "0d, 00:00:00" ){
        console.log(index[1])
        document.getElementById(id).setAttribute("value", "unpause")
        document.getElementById(id).setAttribute("src", "img/unpause.png")
        document.getElementById(id).setAttribute("onclick", "unpause(this.id)")
        clearInterval(a[index[1]])
        console.log(index)
        pauseTIme[index[1]] = new Date()
        console.log(pauseTIme[index[1]])
       

        }
}

function unpause(id){
        
        var index = id.split(',')  
        if (document.getElementById("Btntime2"+index[1]).innerText != "0d, 00:00:00" ){
        document.getElementById(id).setAttribute("value", "pause")
        document.getElementById(id).setAttribute("src", "img/pause.png")
        document.getElementById(id).setAttribute("onclick", "pause(this.id)")
        if(method1 == 'ENCENDER'){
            msg2[index[1]] = direction+'1'
        } else if (method1 =='APAGAR'){
            msg2[index[1]] = direction+'0'
            }
        var element = document.getElementById("Btntime2"+index[1]).innerText
        var elementSplit = element.split(",")
        var daysUnpause = elementSplit[0].match(/(\d+)/);
        var SecondElementSplit = elementSplit[1].split(":")
        var hoursUnpause = SecondElementSplit[0]
        var minutesUnpause = SecondElementSplit[1]
        var secondsUnpause = SecondElementSplit[2]
        console.log(days)
        console.log('{'+daysUnpause+'} {'+hoursUnpause+'} {'+minutesUnpause+'} {'+secondsUnpause+'}')
        console.log(element)
        console.log(index[1])
        var time = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()+parseInt(daysUnpause[0]), new Date().getHours()+parseInt(hoursUnpause), new Date().getMinutes()+parseInt(minutesUnpause), new Date().getSeconds()+parseInt(secondsUnpause), 0);    
        console.log(time)
        countDownTime[index[0]] = time
        a[index[1]] = setInterval(function()
            {
  // Get today's date and time
        now2[index[1]] = new Date().getTime();
  // Find the distance between now and the count down date
        distance2[index[1]] = countDownTime[index[1]] - now2[index[1]];

  // Time calculations for days, hours, minutes and seconds
        days2[index[1]] = Math.floor(distance2[index[1]] / (1000 * 60 * 60 * 24));
        hours2[index[1]] = Math.floor((distance2[index[1]] % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        minutes2[index[1]] = Math.floor((distance2[index[1]] % (1000 * 60 * 60)) / (1000 * 60));
        seconds2[index[1]] = Math.floor((distance2[index[1]] % (1000 * 60)) / 1000);

        document.getElementById("Btntime2"+index[1]).innerHTML =days2[index[1]] + "d, " + zfill(hours2[index[1]],2) + ":"
        + zfill(minutes2[index[1]],2) + ":" + zfill(seconds2[index[1]],2);

  // If the count down is finished, write some text
        if (distance2[index[1]] < 0) {
        document.getElementById("Btntime2"+index[1]).innerHTML = "0d, 00:00:00";
        countDownTime[index[1]]='';
        clearInterval(a[index[1]])
            $.ajax({
            url: '/sendmqtt',
            type: 'post',
            data: msg2[index[1]]
        })
        .done(function() {
            console.log("success");
        })
        .fail(function() {
            console.log("error");
        })    

  }
}

            ,1000)


 }      
    

    }

 function cancel1(id){   
    var index = id.split(',')
    console.log(index)
    clearInterval(x[index[1]])  
        
    document.getElementById("Btntime"+index[1]).innerHTML = "0d, 00:00:00"
        
                    } 




function cancel2(id){                    

    var index = id.split(',')
    clearInterval(a[index[1]])  
    document.getElementById("Btntime2"+index[1]).innerHTML = "0d, 00:00:00"

                    } 


function interruptor (id) {
var element = document.getElementById(id)
    var btn = id.replace(/[0-9]/g, ''); 
    var index = id.match(/(\d+)/)
    var NewDate = new Date();
    var day = NewDate.getFullYear()+"/"+NewDate.getMonth()+"/"+NewDate.getDay()
    var time = NewDate.getHours()+":"+NewDate.getMinutes()+":"+NewDate.getSeconds()
    var ButtonName = document.getElementById('buttonName'+index[0]).getAttribute("value")
    var mqttMSG = {'value': element.getAttribute("value"), 'User': user, 'ip': ip, 'date': new Date(), 'Actuator': ButtonName }
     $.ajax({
        type:'post',
        url: '/sendmqtt',
        data: mqttMSG,
        beforSend: function(){
            console.log("Enviando"+mqttMSG+"al mqtt")
        }
    }).fail(function(err){
        console.log(err)
        var alertError = document.createElement('div')
        alertError.innerHTML += '<div class="alert alert-error"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>ERROR!</strong> No se pudo conectar con el controlador de '+ButtonName+'.</div>' 
        $('#lightsHistory').append(alertError)

        })
    .done(function(data){
        if(data=='success'){
        console.log('Se a enviado '+mqttMSG+' al servidor mqtt')
       if (btn==="buttonON" && ButtonName != null){

        var info = {'User': user, 'ip': ip, method: 'ENCENDER', date: new Date()}
        console.log(info)
        document.getElementById("buttonStatus"+index[0]).innerHTML = "ENCENDIDO"
        var historyAlert = document.createElement('div')
        historyAlert.innerHTML += '<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>'+ButtonName+' fue abierto(a) el '+day+' a las '+time+'</strong>.</div>' 
        $('#lightsHistory').prepend(historyAlert)   
            }

        if (btn==="buttonOFF" && ButtonName != null){

        document.getElementById("buttonStatus"+index[0]).innerHTML = "APAGADO"
        var info = {'User': user, 'ip': ip, method: 'APAGAR', date: new Date()}
        var historyAlert = document.createElement('div')
        historyAlert.innerHTML += '<div class="alert alert"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>'+ButtonName+' fue cerrado(a) el '+day+' a las '+time+'</strong>.</div>' 
        $('#lightsHistory').prepend(historyAlert)
           }    
    } else if (data=='mqttErr'){
        var alertError = document.createElement('div')
        alertError.innerHTML += '<div class="alert alert-error"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>ERROR!</strong> no se pudo completar la accion con el controlador de '+ButtonName+'.</div>' 
        $('#lightsHistory').append(alertError)

    }})
}
