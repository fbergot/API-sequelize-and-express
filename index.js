require('dotenv').config();

const express = require('express');
const apiRouter = require('./router/apiRouter');

// instanciate server
const app = express();

// port :
const port = process.env.PORT || 3000;


// middleware express-parser au lieu de body-parser depuis express 4.16 et +
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// header
app.use((req, res, next) => {
  // supprime le header x-poxered-by (important en prod)
  res.removeHeader("x-powered-by");
  // définition de header
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  next();
});

// routage
app.use('/api/', apiRouter);


// listen
app.listen(port, () => {
    console.log(`Server ready on : ${port}`);
})