// contactController.js
// Import contact model
Contact = require('./contactModel');
// Handle index actions
exports.index = function (req, res) {
    Contact.get(function (err, contacts) {
        if (err) {
            res.json({
                status: "error",
                message: err,
            });
        }
        res.json({
            data: contacts
        });
    });
};
// Handle create contact actions
exports.new = function (req, res) {
    var contact = new Contact();
    contact.Name = req.body.Name ? req.body.Name : contact.Name;
    contact.direction = req.body.direction;
    contact.Es = req.body.Es;
    contact.User = req.body.User;
    contact.Class = req.body.Class
    contact.Consume = req.body.Consume
// save the contact and check for errors
    contact.save(function (err) {
         //if (err)
        //    res.json(err);
res.json({
            message: 'New Object create!',
            data: contact
        });
    });
    contact.save()
    .then(() => {
        res.redirect('/page2');
    })
};
// Handle view contact info
exports.view = function (req, res) {
    Contact.findById(req.params.contact_id, function (err, contact) {
        if (err)
            res.send(err);
        res.json({
            message: 'Object details loading..',
            data: contact
        });
    });
};
// Handle update contact info
exports.update = ('/:id', function (req, res) {

})
// Handle delete contact
exports.delete = function (req, res) {
    Contact.remove({
        _id: req.params.contact_id
    }, function (err, contact) {
        if (err)
            res.send(err);
res.json({
            status: "success",
            message: 'Object deleted'
        });
    });
};
