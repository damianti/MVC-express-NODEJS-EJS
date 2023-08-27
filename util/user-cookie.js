
// Set the expiration time for the cookie to 30 seconds
const cookieExpirationTime = 30 * 1000;
//Class to handle user cookies
class UserCookie {
    // Constructor to set req and res variables
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }

    // Function to create a cookie with user information
    createCookie() {
        const email = this.req.body.email.trim();
        const firstName = this.req.body.firstName.trim();
        const lastName = this.req.body.lastName.trim();

        // Create an object to store the user information in the cookie
        const userInfo = {
            email: email,
            firstName: firstName,
            lastName: lastName,
        };
        // Set the expiration date for the cookie
        const expirationDate = new Date(Date.now() + cookieExpirationTime);

        // Set the cookie with the user information and expiration date
        this.res.cookie("user", userInfo, { expires: expirationDate , httpOnly: true});
    }

    getUserInfo() {
        // Get the user information from the cookie
        return this.req.cookies.user;
    }
}

module.exports = UserCookie;