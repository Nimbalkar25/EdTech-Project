const mongoose = require("mongoose")

const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(process.env.DB_URI);
        console.log(`Connected to Local DB... ${conn.connection.host}`);
        console.log(`Connected to  DB... ${conn.connection.name}`);

    } catch (error) {
        console.log("Error in connecting to DB");
        console.log(error.message);
        process.exit(1);
    }

}

module.exports = dbConnect;