const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
const redisClient = require("../config/redis.js")

const adminMiddleware = async (req,res,next)=>{

    try{
       
        const {token} = req.cookies;
        if(!token)
            throw new Error("Token is not persent");

        const payload = jwt.verify(token,process.env.JWT_KEY);

        const {_id} = payload;

        if(!_id){
            throw new Error("Invalid token");
        }

        const result = await User.findById(_id);

        if(!result){
            throw new Error("User Doesn't Exist");
        }

        // Use DB role (source of truth), not JWT — old cookies still say role:user after MongoDB promotion to admin
        if(result.role !== 'admin'){
            return res.status(403).json({ message: 'Admin privileges required' });
        }

        const isBlocked = await redisClient.get(`token:${token}`);

        if(isBlocked === 'Blocked')
            throw new Error("Invalid Token");

        req.result = result;


        next();
    }
    catch(err){
        res.status(401).send("Error: "+ err.message)
    }

}


module.exports = adminMiddleware;
