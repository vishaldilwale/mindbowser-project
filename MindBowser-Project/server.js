const express = require('express');
const app = express();
const dotEnv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// configure express to receive the form data
app.use(express.json());
app.use(express.urlencoded({extended : false}));

// configure dotEnv
dotEnv.config({path : './config/config.env'});

// configure port
const port = process.env.PORT || 5000 ;

// configure cors
app.use(cors());

// connect to Mongo DB Database
mongoose.connect(process.env.MONGO_DB_CLOUD_URL, {
    useUnifiedTopology : true,
    useNewUrlParser : true,
    useFindAndModify : false,
    useCreateIndex : true
}).then((response) => {
    console.log(`Connected to Mongo DB Successfully...........`);
}).catch((err) => {
    console.error(err);
    process.exit(1); // stop the node js process if unable to connect to mongodb
});

// set static path to index.html
app.use(express.static(path.join(__dirname  , 'client' , 'build')));
app.get('/', function (req, res) {
    const index = path.join(__dirname, 'client' , 'build' , 'index.html');
    res.sendFile(index);
});

// In development mode
if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname , 'client' , 'build')));
    app.get('/', function (req, res) {
        const index = path.join(__dirname, 'client' , 'build' , 'index.html');
        res.sendFile(index);
    });
}

// configure the router
app.use('/', require('./router/userRouter'));

app.listen(port, () => {
    console.log(`Express Server is started : .................`);
});

