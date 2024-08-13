if (process.argv.length < 3) {
    console.log("Usage: node <script> <password> [name number]");
    process.exit(1);
}

// Obtain the data
const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://dreamallica:${password}@cluster0.uphka.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", false);

mongoose
    .connect(url, {
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

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
    id: String,
});

const Person = mongoose.model("Person", personSchema);

// Creates a new Person
const savePerson = async (name, number) => {
    try {
        const person = new Person({
            name,
            number,
            id: new mongoose.Types.ObjectId().toString(),
        });
        await person.save();
        console.log(`Added person: ${name} with number: ${number}`);
    } catch (error) {
        console.error("Error saving person:", error.message);
    } finally {
        mongoose.connection.close();
    }
};

// List all the persons
const listPersons = async () => {
    try {
        const persons = await Person.find({});
        console.log("Phonebook:");
        persons.forEach((person) => {
            console.log(`${person.name} ${person.number}`);
        });
    } catch (error) {
        console.error("Error retrieving persons:", error.message);
    } finally {
        mongoose.connection.close();
    }
};

// The list of actions
if (name && number) {
    savePerson(name, number);
} else {
    listPersons();
}
