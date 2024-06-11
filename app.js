const express = require("express");
const { Department, Delivery } = require("./mongo");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

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
            const passwordIsValid = await bcrypt.compare(password, user.password);

            if (passwordIsValid) {
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
        res.status(500).json({ message: 'Server error' });
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
        const departments = await Department.find();
        res.json(departments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving departments' });
    }
});

app.post('/api/deliveries', authenticateToken, async (req, res) => {
    try {
        console.log('Received delivery:', req.body);
        const newDelivery = new Delivery({
            department: req.body.department,
            name: req.body.Name,
            date: req.body.Date,
            company: req.body.Company,
            description: req.body.Description
        });

        const savedDelivery = await newDelivery.save();

        // Generate PDF
        const doc = new PDFDocument();
        const fileName = `delivery-${savedDelivery._id}.pdf`;
        const filePath = path.join(__dirname, 'pdfs', fileName);

        doc.pipe(fs.createWriteStream(filePath));

        doc.fontSize(25).text('Package Delivery Information', { align: 'center' });
        doc.moveDown();
        doc.fontSize(18).text(`Department: ${savedDelivery.department}`);
        doc.text(`Name: ${savedDelivery.name}`);
        doc.text(`Date: ${savedDelivery.date}`);
        doc.text(`Company: ${savedDelivery.company}`);
        doc.text(`Description: ${savedDelivery.description}`);

        doc.end();

        res.status(201).json({ savedDelivery, pdfPath: filePath });
    } catch (error) {
        console.error('Error saving delivery:', error);
        res.status(500).json({ message: 'Error registering delivery' });
    }
});

// Nueva ruta para manejar las solicitudes de descarga de PDF de entregas
app.get('/api/deliveries/:id/pdf', authenticateToken, async (req, res) => {
    try {
        const deliveryId = req.params.id;
        const delivery = await Delivery.findById(deliveryId);
        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found' });
        }

        // Generate PDF on the fly
        const doc = new PDFDocument();
        const fileName = `delivery-${deliveryId}.pdf`;
        const filePath = path.join(__dirname, 'pdfs', fileName);
        
        doc.pipe(fs.createWriteStream(filePath));

        doc.fontSize(25).text('Package Delivery Information', { align: 'center' });
        doc.moveDown();
        doc.fontSize(18).text(`Department: ${delivery.department}`);
        doc.text(`Name: ${delivery.name}`);
        doc.text(`Date: ${delivery.date}`);
        doc.text(`Company: ${delivery.company}`);
        doc.text(`Description: ${delivery.description}`);

        doc.end();

        // Envía el archivo PDF como respuesta
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error downloading PDF:', error);
        res.status(500).json({ message: 'Error downloading PDF' });
    }
});

app.listen(8000, () => {
    console.log("Server running on port 8000");
});
