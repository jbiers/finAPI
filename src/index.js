const express = require("express");

const app = express();

app.get('/', (request, response) => {
    response.send("hello");
});

app.listen(3131);