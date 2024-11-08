const app = require("./app");
const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION! shutting down");
  process.exit(1);
});

const port = process.env.PORT || 3000;
const dbUrl = process.env.DB_URL 

mongoose.connect(dbUrl).then(()=>console.log(`DB connected`))
const server = app.listen(port, () =>
  console.log(`server is connected on ${port}`)
);

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDELED REJECTION! shutting down");
  server.close(() => process.exit(1));
});
