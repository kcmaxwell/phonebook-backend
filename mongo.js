const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

if (process.argv.length < 3) {
  console.log("Please provide the password for MongoDB.");
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://fullstackopen:${password}@cluster0.osh30.mongodb.net/phonebook?retryWrites=true&w=majority`;

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

// if there is enough arguments, add a new person
if (process.argv.length === 5) {
  const name = process.argv[3];
  const number = process.argv[4];

  mongoose
    .connect(url)
    .then((result) => {
      const person = new Person({
        name: name,
        number: number,
      });

      return person.save();
    })
    .then(() => {
      console.log("Added", name, "number", number, "to phonebook");
      return mongoose.connection.close();
    })
    .catch((err) => console.log(err));
} else if (process.argv.length === 3) {
  // otherwise, print all entries in the phonebook
  mongoose.connect(url).then((result) => {
    Person.find({}).then((persons) => {
      console.log("phonebook:");
      persons.forEach((person) => {
        console.log(person.name, person.number);
      });

      mongoose.connection.close();
    });
  });
} else {
  console.log("Please provide the correct arguments.");
}
