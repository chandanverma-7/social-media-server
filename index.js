const express =  require('express');
const dotenv= require('dotenv');
const app = express()
const dbConnect=require('./dbConnect')
const authRouter=require('./routers/authRouter')
const postrouter=require('./routers/postRouter')
const userRouter=require('./routers/userRouter')
const morgan =require('morgan');
const cookieparser = require('cookie-parser')
const cors=require('cors')
dotenv.config({path:'./.env'})
const cloudinary = require('cloudinary').v2;


// Configuration 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


app.use(express.json({limit:'5mb'}))
app.use(morgan('common'))
app.use(cookieparser());
app.use(cors({
    credentials:true,
    origin:'https://chandan-verma.netlify.app'
}))
app.use("/auth",authRouter)
app.use("/post",postrouter)
app.use('/user',userRouter)
app.get("/",(req,res)=>{
    res.status(200).send("ok from server");
})

const PORT= process.env.PORT || 4001;

dbConnect();

app.listen (PORT,()=>{
    console.log('server is listing on port '+PORT);
})
