//import the pool into the server
const pool = require('./config/connect_database.js');
const express = require('express');



//call the express function to create the server and assigne it to app object 
const app=express();

//assign port for the server to listen on
const port = 8080;

//we include the express.json() middleware function so the server can read data in requests
app.use(express.json());
//we import and mount userroutes
const userRoutes=require('./features/users/routes/userRoutes.js');
app.use('/api', userRoutes);
//we import and mount authroutes
const authRoutes=require('./features/auth/routes/authroutes.js');
app.use('/api',authRoutes);




// Define a route for GET requests to the root URL
app.get('/',(req,res)=>{

    res.send('hello world');
});

//test shoow all user in the initial database
/*app.get('/get_users',async (req,res)=>{
     const result = await pool.query('select * from users');
        res.json(result.rows);
    
});*/

//another test get one user
/*app.get('/get_users/:id',async(req,res)=>{
    const result=await pool.query('select* from users where user_id=$1',[req.params.id]);
    res.json(result.rows);
    console.log([req.params.id]);

});
*/
// test create new user
/*
app.post('/register',async (req, res) => {
    const user_data = req.body;
    console.log(user_data);
    console.log(user_data);
    console.log(req.headers["content-type"]);
    const querry=await pool.query('insert into users(first_name, last_name, email, phone_number, password_hash, role) values($1,$2,$3,$4,$5,$6)',[user_data.first_name,user_data.last_name,user_data.email,user_data.phone_number,user_data.password_hash,user_data.role]);
    res.json({ message: 'received', data: user_data });
});
*/

//dont forget to delete:  SELECT * FROM users WHERE email = 'med@test.com';


//update one user
/*
app.put('/update_user/:id', async(req,res)=>{

    const user_id = req.params.id;
    const data = req.body;

    console.log(data);
    console.log(req.headers["content-type"]);

    const update_query = await pool.query(
        `UPDATE users 
         SET first_name=$1,
             last_name=$2,
             email=$3,
             phone_number=$4,
             password_hash=$5,
             role=$6
         WHERE user_id=$7`,
        [
            data.first_name,
            data.last_name,
            data.email,
            data.phone_number,
            data.password_hash,
            data.role,
            user_id
        ]
    );

    return res.json({
        message: "User updated successfully",
        user_id: user_id
    });

});
*/
// delete a user
/*
app.delete('/delete_user/:id', async(req,res)=>{

    const user_id = req.params.id;

    const delete_query = await pool.query(
        'DELETE FROM users WHERE user_id=$1',
        [user_id]
    );

    return res.json({
        message: "User deleted successfully",
        user_id: user_id
    });

});
*/

//start server
app.listen(port,()=>{
  console.log(`Example app listening at http://localhost:${port}`);
});


