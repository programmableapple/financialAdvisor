const express = require('express');
const router = express.Router();
const recurringController = require('../controllers/recurringController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', recurringController.getRecurring);
router.post('/', recurringController.createRecurring);
router.delete('/:id', recurringController.deleteRecurring);
router.get('/detect', recurringController.detectRecurring);

module.exports = router;
