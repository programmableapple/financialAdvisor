const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;