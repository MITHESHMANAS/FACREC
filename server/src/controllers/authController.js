const authService = require("../services/authService");
const generateToken = require("../utils/jwt");

const register = async (req, res) => {

    try {

        const user = await authService.registerUser(req.body);

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

const login = async (req, res) => {

    try {

        const user = await authService.loginUser(req.body);

        const token = generateToken(user._id, user.role);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        res.status(401).json({
            success: false,
            message: error.message
        });

    }

};

const getProfile = async (req, res) => {

    res.status(200).json({
        success: true,
        user: {
            id: req.user.id,
            role: req.user.role
        }
    });

};

module.exports = {
    register,
    login,
    getProfile
};