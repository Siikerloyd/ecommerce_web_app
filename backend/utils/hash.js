//first import bcrypt
const bcrypt= require('bcryptjs');
//computational difficulty of the hashing function
const saltRounds = 10;

const HashPassword=async (plainPassword)=>{
    try{
        const hashedPassword=await bcrypt.hash(plainPassword,saltRounds);
        return hashedPassword;
    }catch(error){
        console.error("hashing failed;",error);
        throw error;
    }
};
module.exports=HashPassword;
