const express = require("express");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const salt = bcrypt.genSaltSync(10);
const cors = require("cors");
const User = require("./models/UserSchema");
const Post = require("./models/PostSchema");
require("./db/conn");
const Authenticate = require("./middlewares/authenticate");

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
const PORT = process.env.PORT;


app.post("/createaccount", async (req, res) => {
  const { username, password, email } = req.body;
  console.log(username, password, email);
  if (!username || !password || !email) {
    res.status(400).json({ error: "one or more field missing !" });
  }

  try {
    const userExist = await User.findOne({ username: username });
    const userExist2 = await User.findOne({ email: email });
    if (userExist) {
      res.status(400).json({ error: "username already exists" });
    } else if (userExist2) {
      res.status(400).json({ error: "email already in use" });
    } else {
      const createUser = await User.create({
        username: username,
        password: bcrypt.hashSync(password, salt),
        email: email,
      });


      const saveUser = await createUser.save();

      if (!saveUser) {
        res.status(400).json({ error: "Failed to create user" });
      }
      res.status(200).json({ message: "User Created successfully" });
    }

    // console.log("Post request recieved")
    // res.send("post request recieVed")
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "hag diya" });
  }

  try {
    const userExists = await User.findOne({ username: username });
    if (userExists) {
      const passwordMatch = bcrypt.compareSync(password, userExists.password);

      if (passwordMatch) {
        // res.status(200).send(userExists)

        //token
        console.log("login token is")
        const token = await userExists.generateAuthToken();
        
        // cookie
        const options = {
          expires: new Date(Date.now() + 1000 * 3600 * 24 * 30),
          httpOnly: true,
        };
        res.status(200).cookie("typeretrotoken", token, options);

        res.status(200).json({ message: "all good - logged in" });
      } else {
        res.status(400).json({ error: "wrong credentials" });
      }
    } else {
      res.status(400).json({ error: "User does not exist" });
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/createpost", async (req, res) => {
  const { title, postContent } = req.body;
  // console.log(req.body)

  if (!title || !postContent) {
    res.status(400).json({ error: "Hag diya kuch to" });
  }

  try {
    const postExists = await Post.findOne({ title: title });
    if (postExists) {
      res.status(400).send({ Error: "title already exists" });
    } else {

      const token = req.cookies.typeretrotoken
      const verifyToken = jwt.verify(token, process.env.SECRET_KEY)
      
      const createPost = await Post.create({
        user_id: verifyToken._id,
        title: title,
        postContent: postContent,
      });


      const savePost = await createPost.save();
      if (!savePost) {
        res.status(400).json({ error: "Failed to publish post" });
      } else {
        res.status(200).json({ message: "Post published successfully" });
      }
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/manageposts", Authenticate, async (req, res) => {

  const token = req.cookies.typeretrotoken
    if(token){
      const verifyToken = jwt.verify(token, process.env.SECRET_KEY)

      Post.find({user_id: verifyToken._id}, (err, data) => {
        if (err) {
          res.status(500).send(err.message);
        } else {
          res.status(200).send(data);
        }
      });
    }else{
      throw new Error("manageposts- no token")
    }

  
});

app.post("/manageposts", async (req, res) => {
  const { action, _id } = req.body;
  try {

    

    if (action == "delete") {
      let result;
      const postExists = await Post.findOne({ _id: _id });
      if (postExists) {
        result = await Post.deleteOne({ _id: _id });
        console.log(result);
      }

      if (result) {
        res.status(201).json({ message: "post deleted succesfully" });
      } else {
        res.status(400).json({ message: "Failed to delete project" });
      }
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server running successfully at port : ${PORT}`);
});
