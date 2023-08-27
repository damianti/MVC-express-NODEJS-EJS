const db = require( "../models");
const AuthError = require('../util/AuthError');
const UserCookie = require( "../util/user-cookie");
const userValidation = require("../util/userValidation");
const bcrypt = require('bcrypt');
// Register controllers
// GET
/**
 * Render the registration page and pre-fill form fields if session data exists
 * @param {Object} req - The request object containing the user's session data
 * @param {Object} res - The response object used to render the registration view
 */
function getRegister(req, res) {
    const userCookie = new UserCookie(req, res);
    const userInfo = userCookie ? userCookie.getUserInfo() : null;
    return res.render('register', { message: null, userInfo });
}


// POST
/**
 * Handle user registration and create a cookie for the next registration step
 * @param {Object} req - The request object containing the registration form data
 * @param {Object} res - The response object used to render the next registration view or error messages
 * @throws {Object} error - if validation fails
 */
async function postRegister(req, res) {
    // Get user input
    const userInfo = {
        email: req.body.email.trim(),
        firstName: req.body.firstName.trim(),
        lastName: req.body.lastName.trim(),
    };
    try {
        // Check for validation errors
        await userValidation.emailValidation(req.body.email)
        const userCookie = new UserCookie(req, res);
        userCookie.createCookie();
        res.render('register-password', {userInfo: userInfo, message: null});
    } catch (error) {
        if (error instanceof AuthError) {
            return res.render(error.render, {message: error.message, userInfo: userInfo});
        } else {
            console.log(error);
            //server error - render register
            res.render("register", {message: error.message, userInfo: null});
        }
    }
}

/**
 * Render the registration password page and block entry without session data
 * @param {Object} req - The request object containing the user's session data
 * @param {Object} res - The response object used to render the registration password view or error messages
 * @throws {Object} error - if session not exist
 */
function getRegisterPassword (req, res)  {
    try {
        const userCookie = new UserCookie(req, res);
        let userInfo = userCookie.getUserInfo();
        if(!userInfo)
            throw AuthError('register',  "Enter user detail before");

        res.render('register-password', { userInfo: userInfo, message: null });
    }
    catch (error) {
        if(error instanceof AuthError){
            return res.render(error.render, { message: error.message , userInfo: userInfo});
        }
        else {
            console.log(error);
            //server error- render register
            return res.render("register", { message: error.message, userInfo: null });
        }
    }
}

/**
 * Handle user registration password validation, encryption, and storage in the database
 * @param {Object} req - The request object containing the registration form data
 * @param {Object} res - The response object used to render the next registration view or error messages
 * @throws {Object} error - if validation fails or an error occurs while storing the user data
 */
const postRegisterPassword = async (req, res) => {
    const saltRounds = 10;
    const userCookie = new UserCookie(req, res);
    const userInfo = userCookie.getUserInfo();
    const { password, confirmPassword } = req.body;

    try {
        // check if password and confirm password are match and if email is dosnt exist
        await userValidation.registerPassword(userInfo, password, confirmPassword);
        //create user, also validate db storing
        const result = await createUser(userInfo, password, saltRounds);
        res.render(result.render, { message: result.message });
        }
    catch (error) {
        if(error instanceof AuthError){
            return res.render(error.render, { message: error.message , userInfo: userInfo});
            }
        else {
            console.log(error);
            //server error- render register
            res.render("register", { message: error.message, userInfo: null });
            }
        }
};

/**
 * Store user in the database, encrypt the password, and return a message of success or failure
 * @param {Object} userInfo - The user's information
 * @param {string} password - The user's plaintext password
 * @param {number} saltRounds - The number of rounds to use for password encryption
 * @returns {{render: string, message: string}} - Result object with render page and message
 * @throws {Object} error - if an error occurs while storing the user data
 */
const createUser = async (userInfo, password, saltRounds) => {
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        userInfo.password = hash;
        await db.User.create(userInfo);
        return { render: "login", message: "Registration successful, you can now login!" };
    } catch (error) {
        console.log("error to create user in db:", error.message)
        throw new AuthError("register", "An error occurred in register, please try again");
    }
};

// Export controllers
module.exports = {
    getRegister,
    postRegister,
    getRegisterPassword,
    postRegisterPassword,
};