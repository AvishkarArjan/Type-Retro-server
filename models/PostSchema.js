const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    user_id:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    postContent:{
        type:String,
        required:true
    }
},
{
    timestamps:true
})

const Post = mongoose.model("POST",postSchema)
module.exports = Post;