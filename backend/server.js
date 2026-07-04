const express = require("express");
const dotenv = require("dotenv")

dotenv.config();
const app = express();
const cors = require("cors")
app.use(express.json());
const PORT = process.env.PORT || 8080;
const dbConnect = require("./config/db");
const {cloudinaryConnect} = require("./config/cloudinary")
const userRoutes = require("./routes/userRoutes")
const instructorRoutes = require("./routes/instructorRoutes")
dbConnect();
cloudinaryConnect();
app.use(cors());
app.use("/edtech",userRoutes);
app.use("/edtech/instructor",instructorRoutes);

app.listen(PORT,()=>{
    console.log(`Server running on ${PORT}`)
});

app.get("/",(req,res)=>{
    res.send("Hello Bhai");
});

module.exports = app;