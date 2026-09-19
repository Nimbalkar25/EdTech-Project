const express = require("express");
const dotenv = require("dotenv")

dotenv.config();
const app = express();
const cors = require("cors")
// Required if hosted on Render, Railway, Vercel, Heroku, or behind Nginx
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 8080;
const dbConnect = require("./config/db");
const {cloudinaryConnect} = require("./config/cloudinary")
const userRoutes = require("./routes/userRoutes")
const instructorRoutes = require("./routes/instructorRoutes")
const studentRoutes = require("./routes/studentRoutes");
const reviewRoutes = require("./routes/reviewRoutes")
require("./config/redis");
dbConnect();
cloudinaryConnect();
app.use(cors({
    origin: ["http://localhost:5173", "https://your-production-frontend.vercel.app"],
    credentials: true, // Required to allow cookies to travel through CORS
  }));
app.use("/edtech",userRoutes);
app.use("/edtech/instructor",instructorRoutes);
app.use("/edtech/student",studentRoutes);
app.use("/edtech/reviews",reviewRoutes)

app.listen(PORT,()=>{
    console.log(`Server running on ${PORT}`)
});

app.get("/",(req,res)=>{
    res.send("Hello Bhai");
});

module.exports = app;