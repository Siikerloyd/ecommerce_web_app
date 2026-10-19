//import cors
const cors = require("cors");
//import the pool into the server
const pool = require('./config/connect_database.js');
const express = require('express');
//import cookie parser 
const cookieParser = require("cookie-parser");

//import error handler 
const errorHandler = require('./features/middleware/errorMiddleware.js');



//call the express function to create the server and assigne it to app object 
const app = express();
//allow request coming from this origin(frontend)
app.use(cors({
  origin: "http://localhost:5173",
    credentials: true
}));

//assign port for the server to listen on
const port = 8080;

//we include the express.json() middleware function so the server can read data in requests
app.use(express.json());
// Parse incoming cookies so the server can read them through req.cookies
app.use(cookieParser());
//we import and mount userroutes
const userRoutes = require('./features/users/routes/userRoutes.js');
app.use('/api', userRoutes);
//we import and mount authroutes
const authRoutes = require('./features/auth/routes/authroutes.js');
app.use('/api', authRoutes);
//we import and mount product routes
const productRoutes=require('./features/products/routes/productRoutes.js');
app.use('/api',productRoutes);
//import and mount category routes
const catRoutes=require('./features/category/routes/category_routes.js');
app.use('/api',catRoutes);
//import brand routes and mount to server
const brandRoutes=require('./features/brands/routes/brandRoutes.js');
app.use('/api',brandRoutes);
//import addresses routes and mount
const addressesRoutes=require('./features/adresses/routes/addressRoutes.js');
app.use('/api',addressesRoutes);
const productImagesRoutes=require('./features/product_images/routes/productImageRoutes.js');
app.use('/api',productImagesRoutes);
//import and mount cartRoutes 

const cartRoutes=require('./features/cart/routes/cartRoutes.js');
app.use('/api',cartRoutes);

//import and mount order routes
const orderRoutes=require('./features/orders/routes/orderRoutes.js');
app.use('/api',orderRoutes);

//import and mount review routes 
const reviewRoutes = require("./features/reviews/routes/reviewRoutes.js");
app.use("/api", reviewRoutes);

//import and mount wishlist routes
const wishlistRoutes = require("./features/wishlist/routes/wishlistRoutes.js");
app.use("/api", wishlistRoutes);

//mount and import notifications routes

const notificationsRoutes=require('./features/notifications/routes/notificationsRoutes.js');
app.use("/api",notificationsRoutes);

//mount and import deliveryRoutes
const deliveryRoutes=require('./features/delivery/routes/deliveryRoutes.js');
app.use("/api",deliveryRoutes);
//must be after routes:add error handler to the server
app.use(errorHandler);
//start server
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});


