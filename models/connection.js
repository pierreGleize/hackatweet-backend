const mongoose = require("mongoose");

// const connectionString = process.env.CONNECTION_STRING;
const connectionString =
  "mongodb+srv://admin:8KrtAsEVmjtKbmaW@admin.3ss6o.mongodb.net/hackatweet";

mongoose
  .connect(connectionString, { connectTimeoutMS: 2000 })
  .then(() => console.log("Database connected"))
  .catch((error) => console.error(error));
