const express = require("express");
const { User, Department, Visit, Delivery, Frequent, Parking } = require("./mongo");
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
        const user = await User.findOne({ username: username });

        if (user) {
            const passwordIsValid = await bcrypt.compare(password, user.password);

            if (passwordIsValid) {
                const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: '12h' });
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
    console.log(`Received token: ${token}`);
    if (!token) {
        console.log('No token provided');
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Invalid token');
            return res.status(403).json({ message: 'Invalid token' });
        }

        console.log(`Authenticated user: ${user.name}`);
        req.user = user;
        next();
    });
};

// Función para validar RUT
const validateRut = (rut) => {
    const rutRegex = /^[0-9]{7,8}-[0-9Kk]{1}$/;
    return rutRegex.test(rut);
};

// Obtener la configuración del administrador
app.get('/api/users/:userId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      hour: user.hour,
      alert: user.alert
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ message: 'Error fetching user settings' });
  }
});

// Protected routes
app.get('/api/departments/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);

        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        const userBuildingName = user.name;
        const regex = new RegExp(`^${userBuildingName}$`, 'i');
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
            hora: req.body.hora,
            name: req.user.name
        });

        const savedVisit = await newVisit.save();
        res.status(201).json(savedVisit);
    } catch (error) {
        console.error('Error saving visit:', error);
        res.status(500).json({ message: 'Error registering visit' });
    }
});

app.post('/api/deliveries', authenticateToken, async (req, res) => {
    try {
        const newDelivery = new Delivery({
            department: req.body.department,
            name: req.body.name,
            date: req.body.date,
            time: req.body.time
        });

        const savedDelivery = await newDelivery.save();
        res.status(201).json(savedDelivery);
    } catch (error) {
        console.error('Error saving delivery:', error);
        res.status(500).json({ message: 'Error registering delivery' });
    }
});

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
        const { Number, nombre, rut, car } = req.body;

        if (!validateRut(rut)) {
            return res.status(400).json({ message: 'El RUT ingresado no es válido. Debe tener el formato xxxxxxxx-x.' });
        }

        const newFrequent = new Frequent({
            Number,
            nombre,
            rut,
            name: req.user.name,
            car: car || 'N/A'
        });

        const savedFrequent = await newFrequent.save();
        res.status(201).json(savedFrequent);
    } catch (error) {
        console.error('Error saving frequent:', error);
        res.status(500).json({ message: 'Error registering frequent' });
    }
});

app.get('/api/frequent/rut/:rut', authenticateToken, async (req, res) => {
    try {
        const rut = req.params.rut;
        const frequentUser = await Frequent.findOne({ rut });

        if (frequentUser) {
            res.json(frequentUser);
        } else {
            res.status(404).json({ message: 'RUT not found in frequent collection' });
        }
    } catch (error) {
        console.error('Error retrieving RUT from frequent:', error);
        res.status(500).json({ message: 'Error retrieving RUT' });
    }
});

app.get('/api/frequent/car/:licensePlate', authenticateToken, async (req, res) => {
    try {
        const licensePlate = req.params.licensePlate.toUpperCase(); // Convierte a mayúsculas la patente recibida
        const frequentUser = await Frequent.findOne({ car: { $regex: new RegExp(`^${licensePlate}$`, 'i') }, name: req.user.name });

        if (frequentUser) {
            res.json(frequentUser);
        } else {
            res.status(404).json({ message: 'License plate not found in frequent collection' });
        }
    } catch (error) {
        console.error('Error retrieving license plate from frequent:', error);
        res.status(500).json({ message: 'Error retrieving license plate' });
    }
});

// Rutas de estacionamiento

// Obtener el estado del estacionamiento
app.get('/api/parking/:name', authenticateToken, async (req, res) => {
    console.log(`Fetching parking data for ${req.params.name}`);
    try {
      const parking = await Parking.findOne({ name: req.params.name });
      if (!parking) {
        console.log(`Parking not found for ${req.params.name}`);
        return res.status(404).json({ message: 'Parking not found' });
      }
      console.log(`Parking data: ${parking}`);
      res.json(parking);
    } catch (error) {
      console.error('Error fetching parking data:', error);
      res.status(500).json({ message: 'Error fetching parking data' });
    }
  });
  
  // Registrar la entrada de un vehículo
app.post('/api/parking/:name/enter', authenticateToken, async (req, res) => {
    console.log(`Registering vehicle with license plate ${req.body.licensePlate} for ${req.params.name}`);
    try {
      const { licensePlate, nombre, department } = req.body;
      const parking = await Parking.findOne({ name: req.params.name });
      if (!parking) {
        console.log(`Parking not found for ${req.params.name}`);
        return res.status(404).json({ message: 'Parking not found' });
      }
  
      if (parking.occupiedSpaces.length >= parking.spaces) {
        console.log(`No available spaces for ${req.params.name}`);
        return res.status(400).json({ message: 'No available spaces' });
      }
  
      const user = await User.findById(req.user.id);
      const maxHours = user.hour;
      const notificationMinutes = user.alert;
  
      parking.occupiedSpaces.push({ licensePlate, nombre, department, parkedAt: new Date(), maxHours, notificationMinutes });
      await parking.save();
      console.log(`Vehicle registered: ${licensePlate}`);
      res.json(parking);
    } catch (error) {
      console.error('Error registering vehicle:', error);
      res.status(500).json({ message: 'Error registering vehicle' });
    }
  });
  
  // Registrar la salida de un vehículo
  app.post('/api/parking/:name/exit', authenticateToken, async (req, res) => {
    console.log(`Removing vehicle with license plate ${req.body.licensePlate} for ${req.params.name}`);
    try {
      const { licensePlate } = req.body;
      const parking = await Parking.findOne({ name: req.params.name });
      if (!parking) {
        console.log(`Parking not found for ${req.params.name}`);
        return res.status(404).json({ message: 'Parking not found' });
      }
  
      parking.occupiedSpaces = parking.occupiedSpaces.filter(space => space.licensePlate !== licensePlate);
      await parking.save();
      console.log(`Vehicle removed: ${licensePlate}`);
      res.json(parking);
    } catch (error) {
      console.error('Error removing vehicle:', error);
      res.status(500).json({ message: 'Error removing vehicle' });
    }
  });

app.listen(8000, () => {
    console.log("Server running on port 8000");
});
