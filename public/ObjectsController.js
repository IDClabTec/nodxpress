//Objects Controller
var Object = <%-JSON.stringify(data.Objects)%>;
    console.log(Object);
    var user = <%-JSON.stringify(data.user)%>; 
    var element = document.getElementById("UserName")
    console.log(element)
    element.innerHTML=user
    var ObjectType= []
    for(var i = 0; i<Object.length; i++){
        ObjectType[i] = Object[i].Class;
    } 
    console.log(ObjectType)
    for(var i = 0; i<ObjectType.length-1; i++){
        var ObjectTypeA = []
        ObjectTypeA[i] = ObjectType[i+1]
        console.log(ObjectTypeA[i])
        if(ObjectType[i]===ObjectTypeA[i]){
            console.log("Objecto repetido")
            ObjectType.splice(i, 1)
        }
        if(ObjectType[i]!=ObjectTypeA[i]){
            console.log("Objecto no repetido")
        }
    }

    console.log("arreglo de "+"{"+ObjectType+"}")
    console.log(ObjectType)
    function Accordion(){
                //accordion
        for (var i = 0; i<ObjectType.length; i++){
            var Accordion = document.createElement("div")
            var AccordionName = document.createTextNode(ObjectType[i])
                //add attibutes
                Accordion.setAttribute("class", "accordion")
        }
    }
$(document).ready(function(){
    var Buttons = ''
    var ObjectFilter = []
    for(var i=0; i<ObjectType.length; i++){
    Buttons = ''

    ObjectFilter = Object.filter(function(obj) {
    return obj.Class == ObjectType[i];
    });        
    console.log(ObjectFilter)
    for(var e = 0; e<ObjectFilter.length;e++){
    Buttons +='<h5><strong>Accionador: </strong><strong id="buttonName'+i+e+'" value="'+ObjectFilter[e].Name+'">'+ObjectFilter[e].Name+'</strong><strong>|Estado: </strong> '+'<strong id="buttonStatus'+i+e+'">ENCENDIDO</strong></p><p>'+'<button id="buttonON'+i+e+'" class="btn btn-success" value="'+ObjectFilter[e].direction+'1'+'" type="submit">ON</button><button id="buttonOFF'+i+e+'" class="btn btn-inverse" value="'+ObjectFilter[e].direction+'0'+'" type="submit">OFF</button><h4>TIEMPO: <strong id="time'+i+e+'">00:00:00</strong></h4><div id="err'+i+e+'""></div></h5>'
    }
    console.log(Buttons)    
    var accordions = []
    accordions[i] = document.createElement("div")
    accordions[i].innerHTML += '<div class="accordion" id="accordion2'+i+'"><div class="accordion-group"><div class="accordion-heading"><a class="accordion-toggle active" data-toggle="collapse" data-parent="#accordion2'+i+'" href="#collapseOne'+i+'"><i class="icon-minus"></i>'+ObjectType[i]+'</a></div><div id="collapseOne'+i+'" class="accordion-body collapse in"><div class="accordion-inner">'+Buttons+'</div></div></div>';

    console.log(accordions[i]);
    $('#ACCIONADORES').append(accordions[i])
    }
});