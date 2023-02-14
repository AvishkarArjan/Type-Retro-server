const mongoose = require("mongoose")
const DB = process.env.DB

mongoose.set('strictQuery', true); //if you want to have strict Schemas and store in the database only what is specified in you model, starting with Mongoose v7, you will have to set strict option to true manually.
mongoose.connect(DB,{
    useNewUrlParser:true,
    useUnifiedTopology:true,

})
.then(()=>{
    console.log("Successfully connected to Database")
})
.catch((err)=>{
    console.log(err)
})