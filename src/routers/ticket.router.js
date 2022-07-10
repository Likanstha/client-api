const express = require("express")
const router = express.Router();
const {   insertTicket  } = require("../modle/ticket/Ticket.model");
const { userAuthorization } = require("../middlewares/authorization.middleware");

router.all('/',(req,res,next)=>{
   // res.json({message: "return form ticket router"})
    next();
});

// create new ticket
router.post("/",userAuthorization, async (req, res) => {
      try {
        const { subject, sender, message } = req.body;
  
       const userId = req.userId;
  
        const ticketObj = {
          clientId: userId,
          subject,
          conversations: [
            {
              sender,
              message,
            },
          ],
        };
  
        const result = await insertTicket(ticketObj);
  
        if (result._id) {
          return res.json({
            status: "success",
            message: "New ticket has been created!",
          });
        }
  
        res.json({
          status: "error",
          message: "Unable to create the ticket , please try again later",
        });
      } catch (error) {
        res.json({ status: "error", message: error.message });
      }
    }
  );


module.exports =router;