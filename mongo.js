// mongo.js
const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://Programacion:enter@proyect.t0wuu2a.mongodb.net/Proyect?retryWrites=true&w=majority")
    .then(() => {
        console.log("mongodb connected");
    })
    .catch(() => {
        console.log('failed');
    });

const userSchema = new mongoose.Schema({
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

const User = mongoose.model("users", userSchema);

const departmentSchema = new mongoose.Schema({
  Number: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
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
  },
  name: {
    type: String,
    required: true
  }
});

const Visit = mongoose.model('Visit', visitSchema);

const deliverySchema = new mongoose.Schema({
  department: String,
  name: String,
  date: Date,
  time: String
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
  },
  car: {
    type: String,
    required: true
  }
});

const Frequent = mongoose.model('frequent', frequentSchema, 'frequent');

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
    },
  ],
});

const Parking = mongoose.model('Parking', parkingSchema, 'parking'); 

module.exports = { User, Department, Visit, Delivery, Frequent, Parking };