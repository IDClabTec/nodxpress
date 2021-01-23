function createObject(){
    var ObjectJSON = {
            Name : "aaa",
            direction : "aaa",
            Es : "aa",
            User : "aaa",
            Class : "aaaaa"
            }
    $.ajax({
        url: "api/Objects",
        type: "post",
        dataType: "json",
        contentType: "application/json",
        succes: function (data){
            $('#target').html(data.msg);
        },
        data: JSON.stringify(ObjectJSON)

    })
}
