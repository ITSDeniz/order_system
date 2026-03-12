const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');

router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurantById);
router.get('/:id/products', restaurantController.getRestaurantProducts);
router.get('/:id/categories', restaurantController.getRestaurantCategories);

module.exports = router;
