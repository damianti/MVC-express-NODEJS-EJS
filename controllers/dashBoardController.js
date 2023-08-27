/**
 * Render the dashboard page for a logged-in user
 * @param {Object} req - The request object containing the user's session data
 * @param {Object} res - The response object used to render the dashboard view
 */
function getDashBoard(req, res) {
    const { session: { firstName, lastName } } = req;
    res.render('dashboard', { message: null, firstName, lastName });
}
// Export controllers
module.exports = {
    getDashBoard
};
