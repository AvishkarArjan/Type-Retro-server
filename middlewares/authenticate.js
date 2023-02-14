const jwt = require("jsonwebtoken")
const User = require("../models/UserSchema")

const Authenticate = async(req,res,next)=>{
    try{
        const token = req.cookies.typeretrotoken
        let verifyToken,userAuth
        if(token){
            console.log("token found")
            verifyToken = jwt.verify(token, process.env.SECRET_KEY)
            console.log(verifyToken._id)

            userAuth = await User.findOne({
                _id:verifyToken._id,
                "tokens.token": token,
            })
        }else{
            throw new Error("token does not exist")
        }
        

        if(!userAuth){
            throw new Error("User not found")
        }
        else{
            req.token = token;
            req.userAuth = userAuth;
            req.userID = userAuth._id
            next();
        }
    }
    catch(error){
        res.status(400).send("Unauthorized - No token provided")
        console.log(error)
    }
}

module.exports = Authenticate