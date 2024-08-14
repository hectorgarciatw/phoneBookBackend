const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const Person = require("./models/person");

// Load environment for MongoDB password
require("dotenv").config();
const mongodb_uri = process.env.MONGODB_URI;

const app = express();
app.use(express.static(path.join(__dirname, "dist")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

morgan.token("body", (req) => {
    return JSON.stringify(req.body);
});

const errorHandler = (error, request, response, next) => {
    console.error(error.message);

    if (error.name === "CastError" && error.kind === "ObjectId") {
        return response.status(400).send({ error: "malformatted id" });
    } else if (error.name === "ValidationError") {
        return response.status(400).json({ error: error.message });
    }

    next(error);
};

app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"));

mongoose.set("strictQuery", false);

mongoose
    .connect(mongodb_uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
    });

// Get all the persons from MongoDB
app.get("/api/persons", (req, res) => {
    Person.find({}).then((persons) => {
        res.json(persons);
    });
});

// Update the person from MongoDB
app.put("/api/persons/:id", async (req, res, next) => {
    const { number } = req.body;

    // Verificar si el número fue proporcionado
    if (!number) {
        return res.status(400).json({
            error: "Number is missing",
        });
    }

    // Crear un objeto con el nuevo número
    const updatedPerson = { number };

    try {
        // Buscar la persona por ID y actualizar el número
        const result = await Person.findByIdAndUpdate(req.params.id, updatedPerson, {
            new: true, // Devuelve el documento modificado en lugar del original
            runValidators: true, // Ejecuta las validaciones del esquema
            context: "query", // Requerido para que Mongoose valide correctamente
        });

        if (result) {
            res.status(200).json(result); // Responde con la persona actualizada
        } else {
            res.status(404).json({ error: "Person not found" }); // Si no se encuentra la persona
        }
    } catch (error) {
        next(error); // Maneja los errores
    }
});

// Delete a person from MongoDB
// Get a person by id
app.delete("/api/persons/:id", async (req, res, next) => {
    try {
        const person = await Person.findByIdAndDelete(req.params.id);
        if (person) {
            res.status(204).end(); // No Content, la eliminación fue exitosa
        } else {
            res.status(404).end(); // Not Found, no se encontró el ID
        }
    } catch (error) {
        next(error); // Manejo de errores
    }
});

// Get a person by id
app.get("/api/persons/:id", async (req, res, next) => {
    try {
        const person = await Person.findById(req.params.id);
        if (person) {
            res.status(200).json(person);
        } else {
            res.status(404).end();
        }
    } catch (error) {
        next(error);
    }
});

app.get("/api/info", async (req, res, next) => {
    try {
        const personsCount = await Person.countDocuments({}); // Cuenta los documentos en la colección 'persons'
        const currentDate = new Date();
        res.send(`Phonebook has info for ${personsCount} people <br> ${currentDate.toString()}`);
    } catch (error) {
        next(error); // Maneja los errores
    }
});

// Create a new person in MongoDB
app.post("/api/persons", async (req, res, next) => {
    const { name, number } = req.body;

    // Check if data is empty
    if (!name || !number) {
        return res.status(400).json({
            error: "Name or number is missing",
        });
    }

    try {
        const newPerson = new Person({
            name,
            number,
        });
        const savedPerson = await newPerson.save();
        res.status(201).json(savedPerson);
    } catch (error) {
        if (error.name === "ValidationError") {
            // Si la validación de Mongoose falla, devolver un error 400
            return res.status(400).json({ error: error.message });
        }
        next(error); // Maneja otros tipos de errores
    }
});

app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
