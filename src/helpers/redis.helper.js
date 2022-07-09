const redis = require("redis");
const client = redis.createClient(process.env.REDIS_URL);

//redis protocol


const setJWT = (key, value) => {

    console.log(typeof key,typeof value);
    return new Promise((resolve, reject) => {


        try {
            client.set(key, value, (err, res) => {
                if (err) reject(err);
                resolve(res);
            });
        } catch (error) {
            reject(errror);
        }


    });

};

const getJWT = (key) => {
    return new Promise((resolve, reject) => {


        try {
            client.set("key",(err, res) => {
                if (err) reject(err);
                resolve(res);
            });
        } catch (error) {
            reject(errror);
        }


    });

};

module.exports={
    setJWT,
    getJWT

}