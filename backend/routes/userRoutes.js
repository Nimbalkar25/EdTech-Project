const express = require("express");
const { registerUser,
    getUserById,
    loginUser,
    verifyEmail,
    resendOTP,
    getUsers,
    editAvatar,
    editProfile,
    deleteAccount } = require("../controllers/userControllers");
const { resetPasswordLink } = require("../controllers/resetPasswordController");
const { resetPassword } = require("../controllers/resetPasswordController");
const router = express.Router();
const { isAuthenticated, isAdmin } = require("../middleware/authMiddleware")
const upload = require("../middleware/multer");


router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyEmail);
router.post("/resend-otp", resendOTP);
router.post("/reset-passwordlink", resetPasswordLink);
router.post("/reset-password/:token", resetPassword);
router.get("/profile/users", isAuthenticated, isAdmin, getUsers);

router.get("/profile/me", isAuthenticated, getUserById);
router.put("/edit/avatar", isAuthenticated, upload.single("avatar"), editAvatar);
router.put("/edit/profile", isAuthenticated, editProfile);
router.delete("/delete", isAuthenticated, deleteAccount);



module.exports = router;