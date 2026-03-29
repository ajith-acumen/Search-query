const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));
const searchRoute = require("./routes/search");
app.use("/search", searchRoute);

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});