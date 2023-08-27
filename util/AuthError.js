/**
 * Custom error class for authentication-related errors.
 * @class AuthError
 * @extends {Error}
 */
class AuthError extends Error {
    constructor(render, message) {
        super(message);
        this.name = "AuthError";
        this.render = render;
        this.message = message;
    }
}
module.exports = AuthError;