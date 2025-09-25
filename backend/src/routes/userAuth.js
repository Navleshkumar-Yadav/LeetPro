const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const authRouter =  express.Router();
const {register, login,logout, adminRegister,deleteProfile, forgotPassword, resetPassword} = require('../controllers/userAuthent')
const userMiddleware = require("../middleware/userMiddleware.js");
const adminMiddleware = require('../middleware/adminMiddleware.js');

// Register
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', userMiddleware, logout);
authRouter.post('/admin/register', adminMiddleware ,adminRegister);
authRouter.delete('/deleteProfile',userMiddleware,deleteProfile);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password/:token', resetPassword);
authRouter.get('/check',userMiddleware,(req,res)=>{

    const reply = {
        firstName: req.result.firstName,
        emailId: req.result.emailId,
        _id:req.result._id,
        role:req.result.role,
    }

    res.status(200).json({
        user:reply,
        message:"Valid User"
    });
})
// Google OAuth
// Initiate Google login
authRouter.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
authRouter.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    async (req, res) => {
        // Generate JWT for the user
        const token = jwt.sign(
            { _id: req.user._id, role: req.user.role },
            process.env.JWT_KEY,
            { expiresIn: '7d' }
        );
        // Set token as cookie - consistent with regular login
        res.cookie('token', token, {
            httpOnly: true,
            secure: true, // set to true for HTTPS
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        // Redirect to frontend
        res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
    }
);
// authRouter.get('/getProfile',getProfile);


module.exports = authRouter;

// login
// logout
// GetProfile

