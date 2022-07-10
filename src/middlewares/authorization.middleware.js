const { verifyAccessJWT } = require("../helpers/jwt.helper");
const { getJWT, deleteJWT } = require("../helpers/redis.helper");



const userAuthorization = async (req, res, next) => {
    //1.vERIFY JWT IS ValidityState
    const { authorization } = req.headers;

    console.log(authorization);

    const decoded = await verifyAccessJWT(authorization);
   
    if (decoded.email) {
        
    //2.JWT IN REDIS
        const userId = await getJWT(authorization);
        
        if (!userId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        req.userId = userId;

        return next();
    }

    deleteJWT(authorization);
    //3.EXTRACT USERID
    //4.GET USR PROFILE BASED ON USERID

    return res.status(403).json({ message: "Forbidden" });
};

module.exports = {
    userAuthorization,
};