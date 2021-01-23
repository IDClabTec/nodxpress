// contactController.js
// Import contact model
Users = require('./usersModel');
// Handle index actions
exports.index = function (req, res) {
    Users.get(function (err, users) {
        if (err) {
            res.json({
                status: "error",
                message: err,
            });
        }
        res.json({
            data: users
        });
    });
};



// Handle create contact actions
exports.new = function (req, res) { 
    var users = new Users();
    users.Name = req.body.Name ? req.body.Name : users.Name;
    users.email = req.body.email;
    users.password = req.body.password;
// save the contact and check for errors
    users.save(function (err) {
         //if (err)
        //    res.json(err);
res.json({
            message: 'New Object create!',
            data: users
        });
    });

};
// Handle view contact info
exports.view = function (req, res) {
    Users.findById(req.params.Users_id, function (err, users) {
        if (err)
            res.send(err);
        res.json({
            message: 'Object details loading..',
            data: users
        });
    });
};
// Handle update contact info
exports.update = ('/:id', function (req, res) {

})
// Handle delete contact
exports.delete = function (req, res) {
    Users.remove({
        _id: req.params.users_id
    }, function (err, users) {
        if (err)
            res.send(err);
res.json({
            status: "success",
            message: 'Object deleted'
        });
    });
};
