const express = require("express");
const dotenv = require("dotenv")

dotenv.config();
const cors = require("cors")
const app = express();
const PORT = process.env.PORT || 8080;
const dbConnect = require("./config/db");
dbConnect();
app.use(cors());
app.use(express.json());

app.listen(PORT,()=>{
    console.log(`Server running on ${PORT}`)
});

app.get("/",(req,res)=>{
    res.send("Hello Bhai");
});

module.exports = app;