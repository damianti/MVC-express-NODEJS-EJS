// Load modules
const db = require('../models');
const AuthError = require("./AuthError");

/**
 * Validate user input for email address
 * @param {string} email - the email address to be validated
 * @returns {Promise}
 * @throws {AuthError} if the email address is already in use
 */
const emailValidation = async (email) => {
    const aUser = await db.User.findOne({where: {email: email}})

    if (aUser) {
        throw new AuthError("register",'Email already in use. Please, choose another one');
    }
    return {};
};

/**
 * Validate user input for password and confirm password
 * @param {Object} userInfo - The user information from request
 * @param {string} password - The password to be validated
 * @param {string} confirmPassword - The confirmation password to be validated
 * @returns {Promise}
 * @throws {AuthError} if the passwords do not match or if session has expired
 */
const registerPassword = async (userInfo, password, confirmPassword) => {
    if (!userInfo) {
        throw new AuthError("register", "Your session has expired. Please log in again to continue.");
    } else if (password !== confirmPassword) {
        throw new AuthError("register-password", "Your Passwords do not match.");
    }
    await emailValidation(userInfo.email);
    return {};
};

// Export userValidation function
module.exports = {
    emailValidation,
    registerPassword,
};
