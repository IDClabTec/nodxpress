


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


	var selectedObjects = []
	var Objects = []
	var length
	var ip = []
	const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

getHistory();

function getHistory(datainfo){
		$.ajax({
		type: 'post',
		data: {user: urlParams.get('user')},
		url: '/getHistoryData',
		beforeSend: function(){
			console.log("loading...")
		}
	}).done(function(res){
        console.log(res)
        var data = JSON.parse(res);
	console.log(data)
        for (var key in data){
            if(data.hasOwnProperty(key)){console.log(key); console.log(data.key)}
        }
		var optionVal = "Desde el más antiguo";
        var length = data.User.length;
        var history = ''
        console.log(JSON.parse(res))
		 for (var i=1; i<length; i++){
        if(datainfo==undefined){
		Objects[i] = {'method':data.method[data.User.length-i],'date':data.date[data.User.length-i],'Actuator':data.Actuator[data.User.length-i], 'ip': data.ip[data.User.length-i], index: i}
		} else {}
    	if(Objects[i].method == 'exit'){
    		var date = new Date(Objects[i].date);
    		history += '<tr><td><div class="col-6 col-12-small"><input type="checkbox" id="checkbox-alpha'+i+'" onclick="selectOne(this.id)" name="checkbox"><label for="checkbox-alpha'+i+'"></label></div></td><td>Cerraste sesión el '+zfill(date.getDate(),2)+'/'+zfill(date.getMonth(), 2)+'/'+date.getFullYear()+' a las '+zfill(date.getHours(),2)+':'+zfill(date.getMinutes(),2)+':'+zfill(date.getMinutes(),2)+'</td></tr>'
        } else if (Objects[i].method == 'enter'){
    		var date = new Date(Objects[i].date);
    		history += '<tr><td><div class="col-6 col-12-small"><input type="checkbox" id="checkbox-alpha'+i+'" onclick="selectOne(this.id)" name="checkbox"><label for="checkbox-alpha'+i+'"></label></div></td><td>Entraste a la pagina el '+zfill(date.getDate(),2)+'/'+zfill(date.getMonth(), 2)+'/'+date.getFullYear()+' a las '+zfill(date.getHours(),2)+':'+zfill(date.getMinutes(),2)+':'+zfill(date.getSeconds(),2)+'</td></tr>'
    	} else if (Objects[i].method == 'OFF'){
    		var date = new Date(Objects[i].date);
                if(Objects[i].ip=='local'){
	console.log("local")
    		history += '<tr><td><div class="col-6 col-12-small"><input type="checkbox" id="checkbox-alpha'+i+'" onclick="selectOne(this.id)" name="checkbox"><label for="checkbox-alpha'+i+'"></label></div></td><td>Apagaste a "'+Objects[i].Actuator+'" desde el interruptor el '+zfill(date.getDate(),2)+'/'+zfill(date.getMonth(), 2)+'/'+date.getFullYear()+' a las '+zfill(date.getHours(),2)+':'+zfill(date.getMinutes(),2)+':'+zfill(date.getSeconds(),2)+'</td></tr>'
    	       } else if(Objects[i].ip!='local'){
            history += '<tr><td><div class="col-6 col-12-small"><input type="checkbox" id="checkbox-alpha'+i+'" onclick="selectOne(this.id)" name="checkbox"><label for="checkbox-alpha'+i+'"></label></div></td><td>Apagaste a "'+Objects[i].Actuator+'" desde la pagina el '+zfill(date.getDate(),2)+'/'+zfill(date.getMonth(), 2)+'/'+date.getFullYear()+' a las '+zfill(date.getHours(),2)+':'+zfill(date.getMinutes(),2)+':'+zfill(date.getSeconds(),2)+'</td></tr>'
               }
        } else if (Objects[i].method == 'ON'){
    		var date = new Date(Objects[i].date);
                if(Objects[i].ip=='local'){
    		history += '<tr><td><div class="col-6 col-12-small"><input type="checkbox" id="checkbox-alpha'+i+'" onclick="selectOne(this.id)" name="checkbox"><label for="checkbox-alpha'+i+'"></label></div></td><td>Encendiste a "'+Objects[i].Actuator+'" desde el interruptor el '+zfill(date.getDate(),2)+'/'+zfill(date.getMonth(), 2)+'/'+date.getFullYear()+' a las '+zfill(date.getHours(),2)+':'+zfill(date.getMinutes(),2)+':'+zfill(date.getSeconds(),2)+'</td></tr>'
                } else if (Objects[i].ip!='local'){
            history += '<tr><td><div class="col-6 col-12-small"><input type="checkbox" id="checkbox-alpha'+i+'" onclick="selectOne(this.id)" name="checkbox"><label for="checkbox-alpha'+i+'"></label></div></td><td>Encendiste a "'+Objects[i].Actuator+'" desde la pagina el '+zfill(date.getDate(),2)+'/'+zfill(date.getMonth(), 2)+'/'+date.getFullYear()+' a las '+zfill(date.getHours(),2)+':'+zfill(date.getMinutes(),2)+':'+zfill(date.getSeconds(),2)+'</td></tr>'
                }
     	} else if (Objects[i].method == 'MQTT ERROR'){
    		var date = new Date(Objects[i].date);
    		history += '<tr><td><div class="col-6 col-12-small"><input type="checkbox" id="checkbox-alpha'+i+'" onclick="selectOne(this.id)" name="checkbox"><label for="checkbox-alpha'+i+'"></label></div></td><td>Ocurrio un error al intentar conectar con "'+Objects[i].Actuator+'" el '+zfill(date.getDate(),2)+'/'+zfill(date.getMonth(), 2)+'/'+date.getFullYear()+' a las '+zfill(date.getHours(),2)+':'+zfill(date.getMinutes(),2)+':'+zfill(date.getSeconds(),2)+'</td></tr>'
    	}else if (Objects[i].method == 'open'){
                var date = new Date(Objects[i].date);
		var door = Objects[i].Actuator;
		history += '<tr><td><div class="col-6 col-12-small"><input type="checkbox" id="checkbox-alpha'+i+'" onclick="selectOne(this.id)" name="checkbox"><label for="checkbox-alpha'+i+'"></label></div></td><td>'+door.door+' de '+door.location+' fue abierta el '+zfill(date.getDate(),2)+'/'+zfill(date.getMonth(), 2)+'/'+date.getFullYear()+' a las '+zfill(date.getHours(),2)+':'+zfill(date.getMinutes(),2)+':'+zfill(date.getSeconds(),2)+'</td></tr>'
    }

}        
        console.log(Objects)
      	var table = document.createElement('table')
  		table.setAttribute('style', 'width: 100% ')
   	 	table.setAttribute('id', 'AlarmTable')
    	table.innerHTML += '<tr><th><div class="col-6 col-12-small"><input type="checkbox" id="checkbox-all-input" onclick="selectAll(this.id)" name="checkbox"><label for="checkbox-all-input"></label></div></th><th>ORDENAR POR: <input list="order" align="left" style="margin-top: 10px" name="optionOrder" value="Desde el más nuevo" id="optionOrder"><span id="refresh" onclick="getHistory()" class="button" style="margin: 10px 0px 0px 250px">Actualizar</span><span id="deleteBtn" onclick="deleteBtn(this.id)" class="button primary disabled" style="margin: 10px 0px 0px 10px">Borrar seleccion</span></th></tr>'+history    	
    	$('#History').html(table)        
		console.log($('#optionOrder').val())
	})};

function selectOne(id){
var index = id.match(/\d+/)[0]
console.log(index)
if($('#checkbox-alpha'+index).prop("checked") == true){

	selectedObjects[index-1] = index
	document.getElementById('deleteBtn').setAttribute("class", "button primary")
    console.log(selectedObjects)
	} else if ($('#checkbox-alpha'+index).prop("checked") == false){

	selectedObjects.splice(index-1, 1)	
	var a = selectedObjects.filter(function (el) { 
  	return el != null;
    })
	if(a.length==0){
		document.getElementById('deleteBtn').setAttribute("class", "button primary disabled")
		}
	}  
}


function deleteBtn(id){
	var filterObject = selectedObjects.filter(function (filter) {
  	return filter != null; 
    });
    console.log(filterObject);

     
        $.ajax({
        	url: '/refreshHistory',
        	type: 'post',
        	data: {'user': urlParams.get('user'), 'info': filterObject},
        	beforeSend: function(data){
        		console.log(data)
        	}
        }).done(function(respuesta){
            if(respuesta=='success'){
                location.reload(true)

            }


        }).fail(function(err){
            console.log(err)
        });        
		
}



function selectAll(id){
	length=Objects.length;
	if($('#checkbox-all-input').prop("checked") == true){
		console.log(length)
		for(var i=1; i<length; i++){
		
			if($('#checkbox-alpha'+i).prop("checked") == true) {
				selectedObjects[i] = i
			} else if ($('#checkbox-alpha'+i).prop("checked") == false){
				$('#checkbox-alpha'+i).prop("checked", true)
				selectedObjects[i] = i
				console.log(selectedObjects)
				document.getElementById('deleteBtn').setAttribute("class", "button primary")
			}
		}} else if ($('#checkbox-all-input').prop("checked") == false){
			for(var i=1; i<length; i++){
		
			if($('#checkbox-alpha'+i).prop("checked") == false) {
			} else if ($('#checkbox-alpha'+i).prop("checked") == true){
				$('#checkbox-alpha'+i).prop("checked", false)
				selectedObjects = []
				console.log(selectedObjects)
				document.getElementById('deleteBtn').setAttribute("class", "button primary disabled")
			}
		}}	
	};






function seconds(Actuator){
    var off = []
    var on = []
    var distance = 0
    for(var i=1;i<Objects.length;i++){
        if(Objects[i].method=='OFF' && Objects[i].Actuator==Actuator){
            off[i] = Objects[i];
        } else if(Objects[i].method=='ON' && Objects[i].Actuator==Actuator){
            on[i] = Objects[i];
        }
        

        }
    var n;
    off = off.filter(function (off) { 
    return off != null;
    });
    on = on.filter(function (on) { 
    return on != null;
    });
	n=on.length-off.length;
if(n<0){n=on.length;} else if(n>0){n=off.length;} else if(on.length==off.length){n=off.length;}
    console.log(off);
    console.log(on);
    console.log(parseInt((on.length+off.length)/2));
    for(var i=0; i<n; i++){
    distance += parseInt((new Date(on[i].date) - new Date(off[i].date)));
    console.log (distance);
    if (distance<0){
        distance=0
            };
    };

    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    alert(Actuator+' estuvo encendido por '+days+" dias,"+hours+" horas"+minutes+" minutos y"+seconds+" segundos")


  };
