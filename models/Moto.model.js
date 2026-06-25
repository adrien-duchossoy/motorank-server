const { Schema, model } = require("mongoose")


const motoSchema = new Schema ( 
    {

    }
)


const User = model("User", userSchema);

module.exports = User