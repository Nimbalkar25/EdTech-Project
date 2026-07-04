const jwt = require("jsonwebtoken");

exports.generateToken = async(user,expiresIn="5m")=>{

    const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role:user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn
            }
        );

        return token;


}