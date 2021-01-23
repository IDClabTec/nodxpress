
var pauseTIme = []
var countDownDate = []
var now = []
var x = []
var distance = []
var days = []
var hours = []
var minutes = []
var seconds = []
var countDownTime = []
var a = []
var now2 = []
var x2 = []
var distance2 = []
var days2 = []
var hours2 = []
var minutes2 = []
var seconds2 = []
var msg1 = []
var msg2 = []
var AllDataTIme = []


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


$(document).ready(function(){
$("#loginBtn").click(function(){
    $.get('http://ip-api.com/json', function(data){       
     var uname  = $("#your_name").val();
     var upass = $("#your_pass").val();
     var loginData ={'Name': uname,'Pass':upass, 'ip': data.query};
     $.ajax({
         type : 'POST',
         url : '/loginUser',
         data : loginData,
         beforeSend: function(){
            $("#load").html("Conectando...")
         },
       }).done(function(data){
        if(data != 'err') {

        window.location.href="page?user="+data.replace(/['"]+/g, '') 

        } else if (data=='err'){
        $('#load').html("Contraseña o nombre de usuario no valido")
        }
            })})})
$('#saveBtn').click(function(){
     var re_password = $("#re_pass").val()
     var email = $("#email").val()

     var NewUser = {
            Name: $("#name").val(),
            email:$("#email").val(),
            password:$("#pass").val(),
        }
     var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
     if(email.match(mailformat))
{

 if(re_password== $('#pass').val()){
 if($('#pass').val().length>6){   

  $.ajax({
    type : 'POST',
    url : '/registerUser',
    data : NewUser
        }).done(function(res){
            if(res=='err'){
                alert('El nombre de usuario o el correo ya estan registrados')
            } else {
                $("#regStatus").html("¡Usuario creado con exito!...")

                window.location.href="loginError?err="+'relogin'

            }

        })

} else if ($('#pass').val().length>6){
    alert('La contraseña es demasiado corta')
}


} else if (re_password != $('#pass').val()){

    $("#regStatus").html("Las contraseñas no coinciden")

        }
    } else {

$("#regStatus").html("El correo no es valido")
return false;
            };

    });

$("#exitBtn").click(function(){
    if (confirm("¿Seguro que quiere salir y cerrar sesión?")) {
    var data = {'user':user, 'ip': ip, 'date': new Date()}
  $.ajax({
    type: 'POST',
    url: '/exit',
    data: data,
    success: function(){
         window.location.href= "/"
    }
  })
} else {

}    

    })
$("#deletehistory").click(function(){
    var historyAlert = document.createElement('div')
    historyAlert.innerHTML = '<div class="alert alert-info"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>El historial fue borrado</strong>.</div>'
    $('#lightsHistory').html(historyAlert)
})
$('#completeHistory').click(function(){


    $.ajax({
        url: '/authorizing',
        type: 'post',
        data: {'User': user},
        beforeSend : function(){
            console.log({'User': user})
        }

    }).done(function(res){

        if(res=='success'){
            console.log(res)
            window.open("/history?user="+user)
        } 

    }).fail(function(err){
        console.log(err)
    });
    
    });
});
  
