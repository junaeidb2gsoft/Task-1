const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const schema = mongoose.Schema;

const usersSchema = new schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String , default: 'user' },
    image: { type: String },
    userId : {type : String}
});

usersSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Users", usersSchema);
