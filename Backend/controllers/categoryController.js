const Category = require('../models/Category');
const logger = require('./logger');

exports.createCategory = async (req, res) => {
  try {
    const { name, type, icon } = req.body;
    const newCategory = new Category({
      userId: req.userId,
      name,
      type,
      icon
    });
    await newCategory.save();
    logger.info(`Category created for user ${req.userId}: ${name}`);
    res.status(201).json({ message: 'Category created', category: newCategory });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.userId });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
