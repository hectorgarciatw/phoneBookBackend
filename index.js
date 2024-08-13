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

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

// Get all the persons from MongoDB
app.get("/api/persons", (req, res) => {
    Person.find({}).then((persons) => {
        res.json(persons);
    });
});

// Get a person by id
app.get("/api/persons/:id", async (req, res) => {
    try {
        const person = await Person.findById(req.params.id);
        if (person) {
            res.status(200).json(person);
        } else {
            res.status(404).end();
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve person" });
    }
});

app.get("/api/info", (req, res) => {
    const currentDate = new Date();
    res.send(`Phonebook has info for ${persons.length} people <br> ${currentDate.toString()}`);
});

app.delete("/api/persons/:id", (req, res) => {
    const id = Number(req.params.id);
    persons = persons.filter((person) => person.id !== id);
    res.status(204).end();
});

// Create a new person in MongoDB
app.post("/api/persons", async (req, res) => {
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
        res.status(500).json({ error: "Failed to save person" });
    }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
