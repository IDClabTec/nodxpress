//Alarm Controller.js
 function alarm(){
        //clear table
        var SelectObjects = $('#ObjectsList').val()
        console.log(SelectObjects)
        var AlarmDay = $('#alarm').val()
        var AlarmHour = $('#Alarmhour').val()
        var method
        var msg
        if ($('#AlarmOptions').val()== 'APAGAR'){
        	method=0
        	msg = 'apagaran'
        } else if ($('#AlarmOptions').val()=='ENCENDER'){
        	method=1
        	msg = 'encenderan'
        }         
        console.log(method)
        var AlarmData = {"day": AlarmDay, "Hour": AlarmHour, 'User': user, 'Objects': SelectObjects, 'method': method};
        console.log(AlarmData)
        $.ajax({
            type: 'post',
            url: '/alarm',
            data: AlarmData

        }).fail(function(err){
            console.log(err)
        }).done(function(res){
            var data = JSON.parse(res);
            var index = data.index;
            var demo = document.createElement('tr')
      		  demo.innerHTML += '<td>'+data.day+','+data.hour+':'+data.minutes+'</td>'
        	  demo.innerHTML += '<td><a title="Se '+msg+' los siguientes Accionadores:'+JSON.stringify(data.Actuators).replace(/['",0-9]+/g, '||')+'">ver</a></td>'
        	  demo.innerHTML += '<td id="Es '+index+'"><button class="btn btn-small btn-danger btn-rounded" id="'+index+',OFF" style="margin-left: 50px" onclick="AlarmStatus(this.id)">OFF</button>'
        	$('#AlarmTable').append(demo)
        

        })
        
}
    function deleteAlarms(){
    	var data = {'User' : user}
        $.ajax({
            type: 'post',
            url: '/deleteAlarms',
            data: data,
            beforeSend: function(){
            	var loadingGIF = document.createElement('img')
            	loadingGIF.setAttribute('src','img/loading.gif')
            	loadingGIF.setAttribute('class','center')
            	$('#AlarmTable').html(loadingGIF)
            }
        }).done(function(){
        	$('#AlarmTable').html('<div id="AlarmTable"></div>')
        var table = document.createElement('table')
            table.setAttribute('style', 'width: 100% ')
            table.setAttribute('id', 'AlarmTable')
            table.innerHTML += '<tr><th>HORA Y DIA</th><th>ACCIONADORES</th><th>ON/OFF</th><tr>'
            $('#AlarmTable').html(table)
        var historyAlertDeteleAlarm = document.createElement('div')
        historyAlertDeteleAlarm.innerHTML += '<div class="alert alert-error"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Se han borrado todas las alarmas</strong>.</div>'
        $('#lightsHistory').prepend(historyAlertDeteleAlarm)
        })
        .fail(function(){
        	 var historyAlertDeteleAlarm = document.createElement('div')
        historyAlertDeteleAlarm.innerHTML += '<div class="alert alert-error"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>ERROR! no se pudo contactar con el servidor para eliminar las alarmas</strong>.</div>'
        $('#lightsHistory').prepend(historyAlertDeteleAlarm)

        })
    }
  function AlarmStatus(index){
  		var data = index.split(',');
      console.log(data)
  		$.ajax({
  			
  			type: 'post',
  			url: 'AlarmStatus',
  			data: {'index': data[0], 'method': data[1], 'User': user}

  		}).fail(function(){
  			alert('ERROR')
  		}).done(function(){
      console.log('success')
  		var btn = document.getElementById("Es "+data[0])
  		if (data[1] == 'OFF'){
  		console.log('ON');
  		$(btn).html('<button class="btn btn-small btn-success btn-rounded" id="'+data[0]+',ON" style="margin-left: 50px" onclick="AlarmStatus(this.id)">ON</button>')
  		}else if(data[1] == 'ON'){
  		console.log('OFF');
  		$(btn).html('<button class="btn btn-small btn-danger btn-rounded" id="'+data[0]+',OFF" style="margin-left: 50px" onclick="AlarmStatus(this.id)">OFF</button>')	
  		}



  	})
  }



