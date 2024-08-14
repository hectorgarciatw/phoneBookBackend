const mongoose = require("mongoose");

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
    },
    number: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^\d{2,3}-\d+$/.test(v) && v.length >= 8;
            },
            message: (props) => `${props.value} is not a valid number!`,
        },
    },
    id: String,
});

// Transformar el id en la salida JSON
personSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

const Person = mongoose.model("Person", personSchema);
module.exports = Person;
