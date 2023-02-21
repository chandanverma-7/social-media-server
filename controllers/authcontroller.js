const bcrypt=require('bcrypt');
const { JsonWebTokenError } = require('jsonwebtoken');
const User=require('../models/User')
const jwt=require('jsonwebtoken');
const { error, success } = require('../utils/responsewraper');

const signupcontroller=async (req,res)=>{
    try {

        const {name,email,password}=req.body;
        if( !email || !password || !name ){
            // return res.status(400).send('all fields are required');
            return res.send(error(400,'All fields are required'))
        }
        const olduser = await User.findOne({email});
        
        if(olduser){
            //   return   res.status(409).send('this user already exists')
            return res.send(error(409,'this user already exists'))
        }

        const hashedpassword = await bcrypt.hash(password,10)

        const user =await User.create({
            name,
            email,
            password:hashedpassword
        })

        // return res.status(201).json({
        //     user
        // });
        return res.send(success(201,'User Created Successfully'))


    } catch (e) {
        // console.log(error);
        return res.send(error(500,e.message))
    }
}
const logincontroller=async (req,res)=>{
    try {
        const {email,password}=req.body;

        if( !email || !password  ){
            // return res.status(400).send('all fields are required');
            return res.send(error(400,'all fields are required'))
        }
        const user = await User.findOne({email}).select('+password');
        
        if(!user){
            // res.status(404).send('User is not found')
            return res.send(error(404,'User is not found'))
        }        
        const matched = await bcrypt.compare(password,user.password);
        
        if(!matched){
            // return res.status(403).send('Incorrect password')
            return res.send(error(403,'Incorrect password'))
        }
        const accesstoken=generateaccesstoken({_id:user._id})
        const refreshtoken=generaterefreshtoken({_id:user._id})

        res.cookie('jwt',refreshtoken,{
            httpOnly:true,
            secure:true
        })

        // return res.json({accesstoken})
        return res.send(success(201,accesstoken))
    } catch (e) {
        console.log(e);
        return res.send(error(500,e.message))
    }  
}
// this api will check the validty of access token and will generate a new access token


const refershaccesstokencontroller=(req,res)=>{
    const cookie=req.cookies;
    if(!cookie.jwt){
        // res.status(401).send('Refresh token in cookie is required');
        return res.send(error(401,'Refresh token in cookie is required'))
    }
    const refreshtoken=cookie.jwt
    
    try {
        const decoded=jwt.verify(
            refreshtoken,
            process.env.REFRESH_TOKEN_PRIVATE_KEY
            )
            const _id =decoded._id
            const newaccesstoken=generateaccesstoken({_id})
            return res.status(201).json({newaccesstoken})
        } catch (e) {
            console.log(e);
            // return res.status(401).send('Invalid refresh token')
            return res.send(error(401,'Invalid refresh token'))
    }
}

const logoutController=async(req,res)=>{
    try {
        res.clearCookie('jwt',{
            httpOnly:true,
            secure:true  
        })
        return res.send(success(200,'user logged out'))
    } catch (e) {
        console.log(e);
        return res.send(error(500,e.message))
        
    }
}

// internal function
const generateaccesstoken=(data)=>{
    try {
        const token =jwt.sign(data,process.env.ACCESS_TOKEN_PRIVATE_KEY,{expiresIn:"1d"})
        // console.log(token);
        return token;
    } catch (e) {
        console.log(e);
        // return res.send(error(500,e.message))
    }
}
const generaterefreshtoken=(data)=>{
    try {
        const token =jwt.sign(data,process.env.REFRESH_TOKEN_PRIVATE_KEY,{expiresIn:'1y'})
        // console.log(token);
        return token;
    } catch (e) {
        console.log(e);
        // return res.send(error(500,e.message))
    }
}
module.exports={
    signupcontroller,
    logincontroller,
    refershaccesstokencontroller,logoutController
}