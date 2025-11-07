import jwt from 'jsonwebtoken';
import User from '../Model/userModel.js'
import { json } from 'express';


// Protects Routes

const protect = async (req ,res , next) =>{
    let token;
    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ){
        try{
            token = req.headers.authorization.split(' ')[1].trim();
            const decode = jwt.verify(token,process.env.JWT_SECRET);
            req.user =  await User.findById(decode.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            next(); 

        }catch(error){
            console.error(error);
            res.status(401).json({message:"Not Authorized , Token failed !!!"});
        }
    }
    if(!token){
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
    console.log("Proctection Completed !!");
};

const authorization = (...role) =>{
    return (req , res ,next) =>{
        if(!req.user){
            return res.status(401).json({message:"Not Authorized !!"});
        }
        if(!role.includes(req.user.role)){
            return res.status(403).json({
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    }
}

export {protect, authorization } ; 