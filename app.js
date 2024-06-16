const express = require("express");
const { collection, Department, Visit, Delivery, Frequent } = require("./mongo");
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
app.get('/api/departments/:userId', authenticateToken, async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await collection.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Utilizar el nombre del edificio del usuario tal cual
      const userBuildingName = user.name;
      // Crear una expresión regular para hacer la búsqueda insensible a mayúsculas
      const regex = new RegExp(`^${userBuildingName}$`, 'i');  // 'i' hace que la búsqueda sea insensible a mayúsculas
  
      // Buscar departamentos cuyo nombre coincida con la expresión regular
      const departments = await Department.find({ name: { $regex: regex } });
  
      res.json(departments);
    } catch (error) {
      console.error(error);
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

// Nueva ruta para manejar las solicitudes de registro de entregas
app.post('/api/deliveries', authenticateToken, async (req, res) => {
    try {
        const newDelivery = new Delivery({
            department: req.body.department,
            name: req.body.Name, // Asegúrate de que coincida con el nombre del campo en el formulario
            date: req.body.Date, // Asegúrate de que coincida con el nombre del campo en el formulario
            time: req.body.Time // Asegúrate de que coincida con el nombre del campo en el formulario
        });

        const savedDelivery = await newDelivery.save();
        res.status(201).json(savedDelivery);
    } catch (error) {
        console.error('Error saving delivery:', error);
        res.status(500).json({ message: 'Error registering delivery' });
    }
});

// Nueva ruta para manejar la colección frequent
app.get('/api/frequent', authenticateToken, async (req, res) => {
    try {
        const frequents = await Frequent.find();
        res.json(frequents);
    } catch (error) {
        console.error('Error retrieving frequents:', error);
        res.status(500).json({ message: 'Error retrieving frequents' });
    }
});

app.post('/api/frequent', authenticateToken, async (req, res) => {
    try {
        const newFrequent = new Frequent({
            Number: req.body.Number,
            nombre: req.body.nombre,
            rut: req.body.rut,
            name: req.user.name // Verifica que el nombre se pase correctamente aquí
        });

        const savedFrequent = await newFrequent.save();
        res.status(201).json(savedFrequent);
    } catch (error) {
        console.error('Error saving frequent:', error);
        res.status(500).json({ message: 'Error registering frequent' });
    }
});

app.listen(8000, () => {
    console.log("Server running on port 8000");
});
