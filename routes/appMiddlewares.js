const bcrypt = require('bcrypt');
const db = require( "../models");
// User is not authenticated
/**
 * Middleware function that checks if a user is not authenticated and redirects them to the specified page
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns
 */
function isNotAuth (req, res, next) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    if (!req.session.isAuth) {
        next();
    } else {
        res.redirect('/api');
    }
};

// User is authenticated
/**
 *  Middleware function that checks if a user is authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
function isAuth (req, res, next) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    if (req.session.isAuth) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Current user
/**
 * Middleware function that sets the currently logged in user's email to the locals of the response object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
function currentUser (req, res, next) {
    if (req.session.userEmail) {
        res.locals.userEmail = req.session.userEmail;
        next();
    } else {
        res.locals.userEmail = null;
        next();
    }
};

//Authenticate user
/**
 * Middleware function that authenticates a user's credentials
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const authenticate = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await db.User.findOne({ where: { email } });
        if (!user) {
            return res.render('login', { message: 'Email not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { message: 'Invalid password' });
        }
        req.user = user;
        next();
    } catch (err) {
        console.error(err);
        return res.render('login', { message: 'An error occurred in login, please try later' });
    }
};

/**
 * Middleware function that logs a user out and destroys the session.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns
 */
function unauthenticate(req, res, next) {
    try {
        req.session.destroy()
        next();
    }
    catch (error)
    {
        return res.render('/')
    }

}

module.exports = {
    isNotAuth,
    isAuth,
    currentUser,
    authenticate,
    unauthenticate,
};