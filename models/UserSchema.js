const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    tokens: [
        {
          token: {
            type: String,
            required: true,
          },
        },
      ],
  },
  {
    timestamps: true,
  }
);

userSchema.methods.generateAuthToken = async function () {
    try {
      let tokenString = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
      this.tokens = this.tokens.concat({token:tokenString})
      await this.save();
      return tokenString;
    } catch (error) {
      console.log(error);
    }
  };

const User = mongoose.model("USER", userSchema);
module.exports = User;
