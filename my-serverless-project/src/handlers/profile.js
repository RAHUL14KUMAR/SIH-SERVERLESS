const jwt = require("jsonwebtoken");
const userModel=require('../models/userSchema');
const complaint=require('../models/complaintSchema');
const connectDatabase=require('../Database/db');

const myFunction = async (event) => {
    let token;
    if (
      event.headers.authorization &&
      event.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = event.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user =
          (await userModel.findById(decoded.id).select("-password")) ;
        if (!user) {
            throw new Error("!user");
        }
        return user;
      } catch(error) {
        throw new Error(error);
      }
    }
};

module.exports.handler=async(event,context)=>{
    context.callbackWaitsForEmptyEventLoop=false;
    try{
        await connectDatabase();
        const requser=await myFunction(event);
        const {name, email, _id,complaints}=requser;
        const complain=await complaint.find({complaintBy:email});
        return{
            statusCode:200,
            body:JSON.stringify({
                id: _id,
                name,
                type: 'user',
                email,
                complaints,
                complain:complain
            })
        }

    }catch(error){
        console.log(error);

        return{
            statusCode:500,
            body:JSON.stringify(error)
        }
    }
}