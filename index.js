const express = require('express');
const cors = require('cors');

const app = express();
require('dotenv').config();

const Person = require('./models/person');

app.use(express.json());
app.use(cors());
app.use(express.static('build'));

const infoPageCode = (personCount) => `<div><p>Phonebook has info for ${personCount} people.</p><p>${new Date()}</p></div>`;

// HTTP GET route for all persons
app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.json(persons);
    })
    .catch((err) => {
      next(err);
    });
});

// HTTP GET route for a single person
app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((err) => {
      next(err);
    });
});

// HTTP GET route for info page
app.get('/info', (req, res, next) => {
  Person.countDocuments({})
    .then((count) => {
      res.send(infoPageCode(count));
    })
    .catch((err) => {
      next(err);
    });
});

// HTTP POST route to add a person
app.post('/api/persons', (req, res, next) => {
  const { body } = req;

  // if there is no content in the body, return 400 status code
  if (!body.name || !body.number) {
    res.status(400).json({
      error: 'content missing',
    });
  } else {
    // if the name already exists, return 400 status code, else add a new person
    Person.findOne({ name: body.name })
      .then((person) => {
        if (person) {
          res.status(400).json({
            error: 'name must be unique',
          });
        } else {
          const newPerson = new Person({
            name: body.name,
            number: body.number,
          });

          newPerson.save()
            .then((savedPerson) => {
              res.json(savedPerson);
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => {
        next(err);
      });
  }
});

// HTTP PUT route to edit an existing person
app.put('/api/persons/:id', (req, res, next) => {
  const { body } = req;

  // if there is no content in the body, return 400 status code
  if (!body.name || !body.number) {
    res.status(400).json({
      error: 'content missing',
    });
  } else {
    Person.findOne({ _id: req.params.id })
      .then((person) => {
        if (!person) {
          res.status(400).json({
            error: 'Incorrect id',
          });
        } else {
          const update = {
            name: person.name,
            number: body.number,
          };

          Person.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true, context: 'query' })
            .then((updatedPerson) => {
              res.json(updatedPerson);
            })
            .catch((err) => {
              next(err);
            });
        }
      })
      .catch((err) => {
        next(err);
      });
  }
});

// HTTP DELETE route for a person
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch((err) => next(err));
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'Unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (err, req, res, next) => {
  console.error(err.message);

  if (err.name === 'CastError') {
    res.status(400).send({ error: 'Malformatted id' });
  } else if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
  } else { next(err); }
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
