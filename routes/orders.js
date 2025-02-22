const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware'); // Импорт защиты

// Получить все заказы (только для авторизованных пользователей)
router.get('/', protect, async (req, res) => {
    try {
        const orders = await Order.find().populate('user').populate('products.product');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Создать новый заказ (только для авторизованных пользователей)
router.post("/", protect, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({ message: "Товар не найден" });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ message: "Недостаточно товара на складе" });
        }

        const order = new Order({
            user: req.user.id,
            products: [{ product: productId, quantity }],
            total_price: product.price * quantity
        });

        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера" });
    }
});


module.exports = router;
