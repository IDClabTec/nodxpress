function create_user(e){
	e.preventDefault();
	console.log('')
	var name = $('#name').val();
	var Direcion = $('#Direccion').val();
	var Estado = $('#Estado').val();


	$.ajax({
		url: "api/Objects",
		data: JSON.parse({
			"name": name,
			"Direcion": Direcion,
			"Estado": Estado
			}),
		method: "POST",
		contentYpe: "aplication/json"
		success: function(data){
			window.location.href="registro.html"
		}
	})
}