// api-routes.js
// Initialize express router
let router_users = require('express').Router();
// Import users Controller
var UsersController = require('./UsersController');
// Contact routes
router_users.route('/Users')
    .get(UsersController.index)
    .post(UsersController.new);
router_users.route('/:users_id')
    .get(UsersController.view)
    .patch(UsersController.update)
    .put(UsersController.update)
    .delete(UsersController.delete);

// Export API routes
module.exports = router_users


