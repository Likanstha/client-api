require("dotenv").config();
const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const port = process.env.PORT || 3001

//API Security
// app.use(helmet());

//handle CORS error
app.use(cors());

//MongoDB Connection Setup
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

if (process.env.NODE_ENV !== 'production') {
    const mDB = mongoose.connection;
    
    mDB.on("open",()=>{
        console.log("MongoDB is Connected ");
    });
    
    mDB.on("error", (error) => {
        console.log(error)
    });

    //Logger
    app.use(morgan("tiny"));
}
//Set bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//Load Routers
const userRouter = require("./src/routers/user.router")

//Load TicketRouters
const ticketRouter = require("./src/routers/ticket.router")

//Use Routers
app.use("/v1/user", userRouter);

//Use TicketRouters
app.use("/v1/ticket", ticketRouter);

//Error handler
const handleError = require("./src/utils/errorHandler");

app.use((req, res, next) => {
    const error = new Error("Resources not found");
    //res.json({message:"Resources not found "});
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    handleError(error, res);

});

app.listen(port, () => {
    console.log(`Api is ready on http://localhost:${port}`)
});