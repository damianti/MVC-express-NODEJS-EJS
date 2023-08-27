/**
 * Render the login page
 * @param {Object} req - The request object
 * @param {Object} res - The response object used to render the login view
 */
function getLogin(req, res) {
    res.render('login', { message: null });
}


/**
 * Authenticate the login process and set session data for the user
 * @param {Object} req - The request object containing the login form data and user object
 * @param {Object} res - The response object used to redirect to the home page
 */
function postLogin(req, res) {
    const { user: { email, firstName, lastName } } = req;
    req.session.isAuth = true;
    req.session.email = email;
    req.session.firstName = firstName;
    req.session.lastName = lastName;
    console.log('Login successful.');
    return res.redirect('/');
}

/**
 * Handle user logout and redirect to the home page
 * @param {Object} req - The request object
 * @param {Object} res - The response object used to redirect to the home page
 */
function postLogout (req, res) {
    console.log('User logout.');
    return res.redirect('/');
};

// Export controllers
module.exports = {
    getLogin,
    postLogin,
    postLogout,
};
