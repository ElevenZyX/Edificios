const express = require("express");
const { collection, Department, Visit } = require("./mongo");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const JWT_SECRET = '1234'; // Simple secret key for this project

// Endpoint for login
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await collection.findOne({ username: username });

        if (user) {
            // Compare provided password with hashed password in the database
            const passwordIsValid = await bcrypt.compare(password, user.password);

            if (passwordIsValid) {
                // Create a JWT token
                const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
                res.json({ token });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' }); // It's better to send an appropriate HTTP status code
    }
});

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });

        req.user = user;
        next();
    });
};

// Protected routes
app.get('/api/departments', authenticateToken, async (req, res) => {
    try {
        const departments = await Department.find(); // This should be your Mongoose model
        res.json(departments);
    } catch (error) {
        console.error("Error retrieving departments:", error);
        res.status(500).json({ message: 'Error retrieving departments' });
    }
});

app.post('/api/visitas', authenticateToken, async (req, res) => {
    try {
        const newVisit = new Visit({
            departamento: req.body.departamento,
            nombre: req.body.nombre,
            fecha: req.body.fecha,
            hora: req.body.hora
        });

        const savedVisit = await newVisit.save();
        res.status(201).json(savedVisit);
    } catch (error) {
        console.error('Error saving visit:', error);
        res.status(500).json({ message: 'Error registering visit' });
    }
});

app.listen(8000, () => {
    console.log("Server running on port 8000");
});
