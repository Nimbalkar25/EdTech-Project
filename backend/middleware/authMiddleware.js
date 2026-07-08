const jwt = require("jsonwebtoken");

exports.isAuthenticated = async (req, res, next) => {
    try {

        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Please login first"
            });
        }

        const decoded = await jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;


        next();



    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });

    }
}


//Instructor middleware

exports.isInstructor = async (
    req,
    res,
    next
) => {

    try {



        if (
            req.user?.role !== "Instructor"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only instructors can access"
            });
        }

        next();

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// student middleware

exports.isStudent = async (
    req,
    res,
    next
) => {

    if (
        req.user.role !== "Student"
    ) {
        return res.status(403).json({
            success: false,
            message:
                "Only students can access"
        });
    }

    next();
};

//Admin Middleware

exports.isAdmin = async (
    req,
    res,
    next
) => {

    if (
        req.user.role !== "Admin"
    ) {
        return res.status(403).json({
            success: false,
            message:
                "Only admin can access"
        });
    }

    next();
};  