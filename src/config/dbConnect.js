const mongoose = require('mongoose')

const DB_USER = process.env.DB_USER
const DB_PASS = process.env.DB_PASS

const dbConnect = () => {
    mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.z0zh7sr.mongodb.net/?retryWrites=true&w=majority`)

    mongoose.connection.on("connected", () => {
        console.log("Connected to database sucessfully");
    });

    mongoose.connection.on("error", (err) => {
        console.log("Error while connecting to database :" + err);
    });

    mongoose.connection.on("disconnected", () => {
        console.log("Mongodb connection disconnected");
    });
}

    

module.exports = dbConnect