const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://Programacion:enter@proyect.t0wuu2a.mongodb.net/Proyect?retryWrites=true&w=majority")
    .then(() => {
        console.log("mongodb connected");
    })
    .catch(() => {
        console.log('failed');
    });

    const newSchema = new mongoose.Schema({
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
          required: true,
          set: v => v.toLowerCase()
        }
      });
      
      const collection = mongoose.model("users", newSchema);
      
      // Esquema de departamentos
      const departmentSchema = new mongoose.Schema({
        Number: {
          type: String,
          required: true
        },
        name: {
          type: String,
          required: true,
          set: v => v.toLowerCase()
        }
      });
      
      const Department = mongoose.model('departments', departmentSchema);

const visitSchema = new mongoose.Schema({
    departamento: String,
    nombre: String,
    fecha: Date,
    hora: String
});

const Visit = mongoose.model('Visit', visitSchema);



const deliverySchema = new mongoose.Schema({
    department: String,
    name: String,
    date: Date,
    time: String
});

const Delivery = mongoose.model('Delivery', deliverySchema);

module.exports = {collection, Department, Visit, Delivery };


