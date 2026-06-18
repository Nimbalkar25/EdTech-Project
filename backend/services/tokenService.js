const jwt = require("jsonwebtoken");

exports.generateToken = async(user)=>{

    const token = jwt.sign(
            {
                id: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "5m"
            }
        );

        return token;


}