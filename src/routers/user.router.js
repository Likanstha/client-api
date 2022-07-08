const express = require("express")
const router = express.Router()
const { insertUser, getUserByEmail } = require("../modle/user/User.model")
const { hashPassword, comparePassword } = require("../helpers/bcrypt.helper");
const { json } = require("body-parser");

router.all('/', (req, res, next) => {

    //res.json({message: "return form user router"})
    next();
});



//Create new user route
router.post('/', async (req, res) => {
    // console.log(req.body);
    // res.json(req.body);
    const { name, company, address, phone, email, password } = req.body;
    try {
        //hash password
        const hashedPass = await hashPassword(password);
        const newUserObj = {
            name, company, address, phone, email, password: hashedPass
        }
        const result = await insertUser(newUserObj);
        console.log(result);

        res.json({ message: "new user created", result })




    } catch (error) {
        console.log(error);
        res.json({ statux: "error", message: error.message });
    }



});


//User Sigin in Router
router.post("/login", async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;

    //get user with email from db
    //hash our email and compare with the db

    if (!email || !password) {
        res.json({ status: "error", message: "Invalid Form Submisiion" });
    }
    //get user with email from db
    const user = await getUserByEmail(email);

    const passFromDb = user && user._id ? user.password : null;
    if (!passFromDb)
        return res.json({ status: "error", message: "Email or password is invalid" });
    const result = await comparePassword(password, passFromDb);
    console.log(result);


    res.json({ status: "success", message: "Login Successfullu!" })
});

module.exports = router;