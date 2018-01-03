var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/EmployeeDB");
mongoose.connection.on("error", error => {
  throw error;
});
mongoose.connection.on("connect", () => {
  console.log("DB Connected");
});
require('./model');
