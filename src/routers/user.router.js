const express = require("express");
const router = express.Router();
const { insertUser, getUserByEmail, getUserById, updatePassword } = require("../modle/user/User.model");
const { hashPassword, comparePassword } = require("../helpers/bcrypt.helper");
const { json } = require("body-parser");
const { crateAccessJWT, crateRefreshJWT } = require("../helpers/jwt.helper");
const { userAuthorization } = require("../middlewares/authorization.middleware");
const { setPasswordRestPin, getPinByEmail,deletePin } = require("../modle/resetpin/ResetPin.model");
const { emailProcessor } = require("../helpers/emailhelper");
const {resetPassReqValidation,updatePassValidation} =require("../middlewares/formValidation.middileware");


//create new user
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
        };
        const result = await insertUser(newUserObj);
        console.log(result);

        res.json({ message: "new user created", result });




    } catch (error) {
        console.log(error);
        res.json({ statux: "error", message: error.message });
    }



});

//get user profile router
router.get("/", userAuthorization, async (req, res) => {

    const _id = req.userId;
    const userProf = await getUserById(_id);
    res.json({ user: userProf });
});


//User Sign in Router
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


    if (!result) {
        res.json({ status: "error", message: "Password did not matched" });
    }


    //JWT
    //console.log(typeof user._id);
    const accessJWT = await crateAccessJWT(user.email, `${user._id}`);
    const refreshJWT = await crateRefreshJWT(user.email, `${user._id}`);
    res.json({
        status: "success",
        message: "Login Successfull!",
        accessJWT, refreshJWT
    });
});

router.post("/reset-password",resetPassReqValidation, async (req, res) => {
    const { email } = req.body;
    const user = await getUserByEmail(email);
    if (user && user._id) {
        const setPin = await setPasswordRestPin(email);
        await emailProcessor({email,pin: setPin.pin,type: "request-new-password"});
        
            return res.json({ status: "success", message: "Email in db then will send code" });
        
        

    }
    return res.json({ status: "error", message: "Email not found on db" });
});

router.patch("/reset-password",updatePassValidation, async (req, res) => {
    const { email, pin, newPassword } = req.body;
    console.log(email);
    console.log(pin);
	const getPin = await getPinByEmail(email, pin);
   
    if(getPin?._id){
        const dbDate = getPin.addedAt;
		const expiresIn = 1;

		let expDate = dbDate.setDate(dbDate.getDate() + expiresIn);

		const today = new Date();

		if (today > expDate) {
			return res.json({ status: "error", message: "Invalid or expired pin." });
		}
        // encrypt new password
		const hashedPass = await hashPassword(newPassword);
		const user = await updatePassword(email, hashedPass);
        if (user._id) {
			//send email notification
            await emailProcessor({ email, type:"update-password-success" });

			////delete pin from db
			deletePin(email, pin);


			return res.json({
				status: "success",
				message: "Your password has been updated",
			});
		}
    }
    res.json({
		status: "error",
		message: "Unable to update your password. plz try again later",
	});

});
module.exports = router;

/* Done in password reset
 A.Create and send password reset pin number
    1. receive email
    2.check if email exist in db
    3.create unique 6 digit pin
    4. save pin and email in db
    5.email the pin
    
    done in patch password reset
    B.Update password in Db
    1.receive email, piin and new password
    2.validate pin
    3.encrypt new password
    4.update password in db
    5.send email notification

    C.Server side form validation
    1.client middleware to validate form data
*/