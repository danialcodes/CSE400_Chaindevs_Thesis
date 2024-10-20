const {
    Schema,
    model
  } = require("mongoose");
  
const UserSchema = new Schema({
    email: {
      type: String,
      required: true,
    },
  },
    {
        timestamps: true,
    }
);
  
  const UserModel = model("user", UserSchema)
  
  module.exports = UserModel