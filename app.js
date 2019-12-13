const express = require('express');
const app = express();
const fs   = require('fs');
const jwt  = require('jsonwebtoken');





app.post('/api/token',   (req,res,next) => {

    res.end("hello 1")

});



app.post('/api/justify',   (req,res,next) => {

    res.end("hello 1")

});




app.listen(4000, function () {
    console.log('Server listening on port 4000!')
});
