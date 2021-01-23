
Users = require('./usersModel');

Users.find({}, function(err, user){
	console.log(user)
})

console.log(Users)
 Users.find({}, function(err,res){
    	console.log(res)
    	console.log('success')
    })

