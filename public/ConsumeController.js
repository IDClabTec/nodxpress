//Consume Controller
function refreshConsume () {
$.ajax({
	url: '/refreshConsumeAll',
	type: 'POST'
})
.done(function(data) {
	var data = JSON.parse(data)
	var Names = JSON.parse(data.Names)
	var Directions = JSON.parse(data.Directions)
	var Consume = JSON.parse(data.Consume)
	console.log(Names)
	console.log(Directions)
	console.log(Consume)
	for(var i = 0; i<data.Consume.length; i++){
		console.log(Names[i]+Directions[i])
	var element = document.getElementById(Names[i]+':'+Directions[i])
	$(element).html('<strong> '+Consume[i]+' </strong>')
	}

})
.fail(function() {
	console.log("error");
})

}

function refreshConsumeOne(id){
console.log(id)
var data = id.split(',')
$.ajax({
	type: 'post',
	url: 'refreshConsumeOne',
	data: {Name: data[0], direction: data[1]},
	beforeSend : function(data){
		console.log('sending '+data)
	}
}).fail(function(){

}).done(function(res){
	console.log(res)
	var element = document.getElementById(data[0]+':'+data[1])
	$(element).html('<strong> '+res+' </strong>')

})


}