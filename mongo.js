// mongo.js
const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://Programacion:enter@proyect.t0wuu2a.mongodb.net/Proyect?retryWrites=true&w=majority")
  .then(() => {
    console.log("mongodb connected");
  })
  .catch(() => {
    console.log('failed');
  });

<<<<<<< HEAD
const userSchema = new mongoose.Schema({
=======
const newSchema = new mongoose.Schema({
>>>>>>> delivery-suazo
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  }
});

<<<<<<< HEAD
const User = mongoose.model("users", userSchema);
=======
const collection = mongoose.model("users", newSchema);
>>>>>>> delivery-suazo

const departmentSchema = new mongoose.Schema({
  Number: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
<<<<<<< HEAD
=======
  },
  phone: {
    type: String,
    required: true
>>>>>>> delivery-suazo
  }
});

const Department = mongoose.model('departments', departmentSchema);

const visitSchema = new mongoose.Schema({
  departamento: {
    type: String,
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    required: true
  },
  hora: {
    type: String,
    required: true
<<<<<<< HEAD
  },
  name: {
    type: String,
    required: true
=======
>>>>>>> delivery-suazo
  }
});

const Visit = mongoose.model('Visit', visitSchema);

const deliverySchema = new mongoose.Schema({
<<<<<<< HEAD
  department: String,
  name: String,
  date: Date,
  time: String
=======
  department: {
    type: String,
    required: true
  },
  typeOfPackage: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  buildingName: { // Nuevo campo
    type: String,
    required: false
  }
>>>>>>> delivery-suazo
});

const Delivery = mongoose.model('Delivery', deliverySchema);

const frequentSchema = new mongoose.Schema({
  Number: {
    type: String,
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  rut: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
<<<<<<< HEAD
  },
  car: {
    type: String,
    required: true
=======
>>>>>>> delivery-suazo
  }
});

const Frequent = mongoose.model('frequent', frequentSchema, 'frequent');

<<<<<<< HEAD
const parkingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  spaces: {
    type: Number,
    required: true,
  },
  occupiedSpaces: [
    {
      licensePlate: {
        type: String,
        required: true,
      },
      nombre: {
        type: String,
        required: true,
      },
      department: {
        type: String,
        required: true,
      },
      parkedAt: {
        type: Date,
        default: Date.now,
        required: true,
      },
    },
  ],
});

const Parking = mongoose.model('Parking', parkingSchema, 'parking');

module.exports = { User, Department, Visit, Delivery, Frequent, Parking };
=======
module.exports = { collection, Department, Visit, Delivery, Frequent };
>>>>>>> delivery-suazo
