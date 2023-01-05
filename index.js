const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
require("dotenv").config();

const Person = require("./models/person");

app.use(cors());
app.use(express.json());
/*
// removed for fly.io
morgan.token("post-data", (req) => {
  return JSON.stringify(req.body);
});
app.use(
  morgan("tiny", {
    skip: (req) => req.method === "POST",
  })
);
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :post-data",
    {
      skip: (req) => req.method !== "POST",
    }
  )
);
*/
app.use(express.static("build"));

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

const infoPageCode = `<div><p>Phonebook has info for ${
  persons.length
} people.</p><p>${new Date()}</p></div>`;

const generateId = () => {
  return Math.floor(Math.random() * 1000000000000);
};

// HTTP GET route for all persons
app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

// HTTP GET route for a single person
app.get("/api/persons/:id", (req, res) => {
  Person.findById(req.params.id).then((person) => {
    res.json(person);
  });
});

// HTTP GET route for info page
app.get("/info", (req, res) => {
  res.send(infoPageCode);
});

// HTTP POST route to add a person
app.post("/api/persons", (req, res) => {
  const body = req.body;

  // if there is no content in the body, return 400 status code
  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "content missing",
    });
  }

  // if the name already exists, return 400 status code, else add a new person
  Person.findOne({ name: body.name }).then((person) => {
    if (person) {
      return res.status(400).json({
        error: "name must be unique",
      });
    } else {
      const person = new Person({
        name: body.name,
        number: body.number,
      });

      person.save().then((savedPerson) => {
        res.json(savedPerson);
      });
    }
  });
});

// HTTP DELETE route for a person
app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);

  res.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
