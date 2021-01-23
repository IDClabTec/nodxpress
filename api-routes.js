// api-routes.js
// Initialize express router
let router = require('express').Router();
// Import contact controllerº
var contactController = require('./contactController');
// Contact routes

router.route('/Objects')
    .get(contactController.index)
    .post(contactController.new);
router.route('/:contact_id')
    .get(contactController.view)
    .patch(contactController.update)
    .put(contactController.update)
    .delete(contactController.delete);
// Export API routes
module.exports = router