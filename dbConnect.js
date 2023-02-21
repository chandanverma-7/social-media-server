const mongoose=require('mongoose');

module.exports= async()=>{
    const mongouri='mongodb+srv://chandan-verma:jkwjJw30g4D11yqp@cluster1.1fpmdl4.mongodb.net/?retryWrites=true&w=majority'

    try{
    const connect = await mongoose.connect(mongouri,  { 
        useNewUrlParser: true,
        useUnifiedTopology: true
     } );
    console.log(`MongoDB connected : ${connect.connection.host}`);
    }catch(error){
         console.log(error);
         process.exit(1);
     }
}