const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

morgan.token("body", (req) => {
    return JSON.stringify(req.body);
});
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"));

let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456",
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523",
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345",
    },
    {
        id: 4,
        name: "Mary Poppendieck",
        number: "39-23-6423122",
    },
];

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.get("/api/persons", (req, res) => {
    res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
    const id = Number(req.params.id);
    const person = persons.find((person) => person.id === id);
    person ? res.status(200).json(person) : res.status(404).end();
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

app.post("/api/persons", (req, res) => {
    const body = req.body;
    //Check if some important data is empty
    if (!body.name || !body.number) {
        return res.status(400).json({
            error: "Name or number is missing",
        });
    }
    //Check if the person is already stored
    if (persons.some((person) => person.name === body.name)) {
        return res.status(400).json({
            error: `${body.name} is already on the Phonebook`,
        });
    }

    const newPerson = {
        id: persons.length > 0 ? Math.max(...persons.map((n) => n.id)) + 1 : 1,
        name: body.name,
        number: body.number,
    };

    persons = [...persons, newPerson];
    res.status(201).json(newPerson);
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
