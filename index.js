require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const host = process.env.HOST;
const port = process.env.PORT;

app.use(cors());
app.use(express.json()); //enable parsing JSON body data

// routing middleware for resource accommodations
app.use("/users", require("./routes/usersRoutes.js"));

// routing middleware for resource accommodations
app.use("/accommodations", require("./routes/accommodationsRoutes.js"));

// routing middleware for resource events
app.use("/events", require("./routes/eventsRoutes.js"));

// handle invalid routes
app.all("*", function (req, res) {
  res.status(404).json({ message: "Invalid route, try again" });
});

app.listen(
  port,
  host,
  () => console.log(`App listening at http://${host}:${port}/`) // Listening requests
);
