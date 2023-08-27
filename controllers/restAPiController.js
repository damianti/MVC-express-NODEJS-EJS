const db = require( "../models");
const {Op} = require("sequelize");

// rest Api Comments controllers
// GET
/**
 * Get comments within a given date range and order them
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @throws {Object} status: 500 - Error retrieving comments
 */
async function getComments(req, res) {
    const { session: { email }, query: { start_date, end_date } } = req;
    try {
        const comments = await db.Comment.findAll({
            where: {
                picDate: {
                    [Op.gte]: new Date(start_date),
                    [Op.lte]: new Date(end_date)
                }
            },
            include: [{
                model: db.User,
                attributes: ['firstName', 'lastName'],
                required: true
            }]
        });
        res.json(orderComments(comments, email));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving comments' });
    }
}

// POST
/**
 * Create and save a new comment in the database
 * @param {Object} req - The request object containing the comment data
 * @param {Object} res - The response object used to send a success or error message
 * @param {string} req.body.dateId - The date of the picture that was commented
 * @param {string} req.body.commentTxt - The text of the comment
 * @param {string} req.session.email - The email of the user who is creating the comment
 * @throws {Error} err - if an error occurs while saving the comment
 */
async function postComment(req, res) {
    const { dateId: picDate, commentTxt: text } = req.body;
    const { email } = req.session;
    try {
        const user = await db.User.findOne({ where: { email } });
        const newComment = await db.Comment.build({ picDate: picDate, text: text });
        await newComment.setUser(user)
        await newComment.save()
        return res.status(200).send({ message: "Comment added successfully" });
    } catch (err) {
        console.log("Error saving comment", err);
        return res.status(500).json(err);
    }
}

/**
 * Organize the given comments into a map of dates, with an array of comments for each date
 * @param {Array} unorderedComments - The array of comments to be organized
 * @param {string} email - The email of the user making the request
 * @returns {Object} groupedComments - A map of dates, with an array of comments for each date
 */
function orderComments (unorderedComments, email){

    const groupedComments = unorderedComments.reduce((groupedComments, comment) => {
        const date = comment.picDate.slice(0, 10)
        if (!groupedComments[date]) {
            groupedComments[date] = [];
        }
        if (!comment.deleted){
            const isOwner = email === comment.email
            groupedComments[date].push({firstName:comment.User.firstName, lastName:comment.User.lastName, text: comment.text, owner:isOwner, id:comment.id});
        }
        return groupedComments;
    }, {});
    return groupedComments
}

/**
 * Delete a comment from the database
 * @param {Object} req - The request object containing the comment id
 * @param {Object} res - The response object used to send a success or error message
 * @param {string} req.params.id - The id of the comment to be deleted
 * @param {string} req.session.email - The email of the user making the request
 * @throws {Error} err - if an error occurs while deleting the comment
 */
async function deleteComment(req, res) {
    try {
        const comment = await db.Comment.findOne({ where: { id: req.params.id } });
        if (!comment) {
            throw new Error('Comment not found');
        }
        if (comment.email !== req.session.email) {
            throw new Error('Unauthorized to delete this comment');
        }
        await comment.update({ deleted: true });
        return res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (err) {
        console.log("Error deleting comment", err);
        return res.status(500).json({ message: 'Error deleting comment' });
    }
}

// Export controllers
module.exports = {
    getComments,
    postComment,
    deleteComment,
};