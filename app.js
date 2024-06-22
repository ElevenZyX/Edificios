const express = require("express");
const { collection, Department, Visit, Delivery, Frequent } = require("./mongo");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PDFDocument } = require('pdf-lib');
const twilio = require('twilio');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const JWT_SECRET = '1234'; // Simple secret key for this project

const accountSid = 'AC67444ea956f96df2af70ddc11ae55d61'; // Obtén esto de tu consola de Twilio
const authToken = '6601faf6d91787bda760226634eafff1'; // Obtén esto de tu consola de Twilio
const twilioClient = new twilio(accountSid, authToken);

// Endpoint for login
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await collection.findOne({ username: username });

        if (user) {
            const passwordIsValid = await bcrypt.compare(password, user.password);
            if (passwordIsValid) {
                const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
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

const validateRut = (rut) => {
    const rutRegex = /^[0-9]{7,9}-[0-9Kk]{1}$/;
    return rutRegex.test(rut);
};

app.get('/api/pdf/:id', authenticateToken, async (req, res) => {
    try {
        const doc = await generatePDF(req.params.id);
        const pdfBytes = await doc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBytes);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: 'Error generating PDF' });
    }
});

app.get('/api/departments/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await collection.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const userBuildingName = user.name;
        const regex = new RegExp(`^${userBuildingName}$`, 'i');
        const departments = await Department.find({ name: { $regex: regex } });

        res.json(departments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving departments' });
    }
});

app.get('/api/department/:number', authenticateToken, async (req, res) => {
    const { number } = req.params;
    try {
        const department = await Department.findOne({ Number: number });
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.send(department);
    } catch (error) {
        console.error('Error fetching department information:', error);
        res.status(500).send('Error fetching department information');
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

app.post('/api/frecuentes', authenticateToken, async (req, res) => {
    try {
        const { nombre, apellido, rut, patente } = req.body;
        if (!validateRut(rut)) {
            return res.status(400).json({ message: 'Invalid RUT' });
        }
        const newFrequent = new Frequent({
            nombre,
            apellido,
            rut,
            patente
        });

        const savedFrequent = await newFrequent.save();
        res.status(201).json(savedFrequent);
    } catch (error) {
        console.error('Error saving frequent visitor:', error);
        res.status(500).json({ message: 'Error registering frequent visitor' });
    }
});

app.post('/api/deliveries', authenticateToken, async (req, res) => {
    try {
        const { department, typeOfPackage, company, date, time } = req.body;

        const newDelivery = new Delivery({
            department,
            typeOfPackage,
            company,
            date,
            time
        });

        const savedDelivery = await newDelivery.save();

        // Generar el contenido del PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();

        // Contenido del PDF
        page.drawText(`Department: ${savedDelivery.department}`, { x: 50, y: height - 100 });
        page.drawText(`Type of Package: ${savedDelivery.typeOfPackage}`, { x: 50, y: height - 120 });
        page.drawText(`Company: ${savedDelivery.company}`, { x: 50, y: height - 140 });
        page.drawText(`Date: ${savedDelivery.date.toDateString()}`, { x: 50, y: height - 160 });
        page.drawText(`Time: ${savedDelivery.time}`, { x: 50, y: height - 180 });

        // Serializar el PDF a bytes
        const pdfBytes = await pdfDoc.save();

        // Obtener el número de teléfono del departamento
        const departmentInfo = await Department.findOne({ Number: department });
        if (!departmentInfo) {
          return res.status(404).json({ message: 'Department not found' });
        }
        
        if (!departmentInfo.phone) {
          return res.status(400).json({ message: 'Phone number not found for department' });
        }

        // Enviar SMS utilizando Twilio
        const message = `Your package has has arrived`;
        await twilioClient.messages.create({
            body: message,
            to: departmentInfo.phone,
            from: '+19123912063'
        });

        // Establecer los encabezados de la respuesta para indicar que se enviará un archivo PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=delivery.pdf');
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Error saving delivery:', error);
        res.status(500).json({ message: 'Error registering delivery' });
    }
});

app.listen(8000, () => {
    console.log("Server running on port 8000");
});
