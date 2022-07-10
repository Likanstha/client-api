const { token } = require("morgan");
const { ResetPinSchema } = require("./ResetPin.schema");
const { randomPinNumber } = require("../../utils/randomGenerator");
const { resolveContent } = require("nodemailer/lib/shared");
const setPasswordRestPin = async (email) => {
  //reand 6 digit
  const pinLength = 6;
  const randPin = await randomPinNumber(pinLength);
  console.log(randPin);

  const restObj = {
    email,
    pin: randPin,
  };

  return new Promise((resolve, reject) => {
    ResetPinSchema(restObj)
      .save()
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
};

const getPinByEmail = (email, pin) => {
  return new Promise((resolve, reject) => {
    try {

      ResetPinSchema.findOne({ email, pin }, (error, data) => {
        if (error) {
          resolveContent(false);
          console.log;
        }
        resolve(data);

      });

    } catch (error) {
      reject(error);

    }
  });
};
const deletePin = (email, pin) => {
  try {
    ResetPinSchema.findOneAndDelete({ email, pin }, (error, data) => {
      if (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  setPasswordRestPin,
  getPinByEmail,
  deletePin,

};