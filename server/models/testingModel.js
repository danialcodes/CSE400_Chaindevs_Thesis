const {
    Schema,
    model
  } = require("mongoose");
  
const TestingSchema = new Schema({
    network: {
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