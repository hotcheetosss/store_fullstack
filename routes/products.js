const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware'); 


router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, description, price, category, stock, images } = req.body;
        const product = await Product.findByIdAndUpdate(req.params.id, 
            { name, description, price, category, stock, images },
            { new: true }
        );
        if (!product) return res.status(404).json({ message: 'Товар не найден' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка обновления товара' });
    }
});
router.delete('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Товар не найден' });
        res.json({ message: 'Товар удален' });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка удаления товара' });
    }
});


router.post('/', protect, async (req, res) => { 
    try {
        const { name, description, price, category, stock, images } = req.body;
        const product = new Product({ name, description, price, category, stock, images });
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        console.log("Получен запрос на товар с ID:", req.params.id);

        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Неверный формат ID" });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            console.log("Товар не найден в базе.");
            return res.status(404).json({ message: 'Товар не найден' });
        }

        res.json(product);
    } catch (error) {
        console.error("Ошибка при получении товара:", error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});



module.exports = router;
