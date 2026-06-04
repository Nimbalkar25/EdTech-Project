const express = require("express");
const dotenv = require("dotenv")

dotenv.config();
const app = express();
const cors = require("cors")
app.use(express.json());
const PORT = process.env.PORT || 8080;
const dbConnect = require("./config/db");
const userRoutes = require("./routes/userRoutes")
dbConnect();
app.use(cors());
app.use("/edtech",userRoutes);

app.listen(PORT,()=>{
    console.log(`Server running on ${PORT}`)
});

app.get("/",(req,res)=>{
    res.send("Hello Bhai");
});

module.exports = app;