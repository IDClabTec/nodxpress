$("#boton-usuarios").on("click", getUsers);

function getUsers() {
  $.ajax({
    url: 'https://localhost:8080/pagw2',
    success: function(respuesta) {

      var listaUsuarios = $("#lista-usuarios");
      $.each(respuesta.data, function(index, elemento) {
        listaUsuarios.append(
            '<div>'
          +     '<p>' + elemento.first_name + ' ' + elemento.last_name + '</p>'
          +     '<img src=' + elemento.avatar + '></img>'
          + '</di}v>'
        );    
      });
    },
    error: function() {
      console.log("No se ha podido obtener la información");
    }
  });
}