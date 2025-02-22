const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Email уже зарегистрирован" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        
        const isFirstUser = (await User.countDocuments()) === 0;
        
        
        const assignedRole = isFirstUser ? "admin" : role === "admin" ? "admin" : "user";

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: assignedRole
        });

        await user.save();

        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });

    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера" });
    }
});




router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Введите email и пароль" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Пользователь не найден" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Неверный пароль" });
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token, user: { name: user.name, email: user.email, role: user.role } });

    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера" });
    }
});


module.exports = router;
