
(function () {

    //--------------------------------- Const's ---------------------------------
    const nasaUrl = 'https://api.nasa.gov/planetary/apod?api_key='
    const apiUrl = '/api/comments/'
    const apiKey = 'h2oPbugkQQs6iVqVrFZ41Q8Auqy0lyvCPggjEbCy'
    const cardContainer = document.getElementById("datesList");
    const loaderContainer = document.querySelector('.loader-container');
    const apiErrorAddComment= "have problem with add comment";
    const apiErrorLoadComments = "have problem to load comments";
    const apiErrorDeleteComment = "have problem with deletion";
    const updateSeconds = 15000;
    //--------------------------------- DOM functions ---------------------------------
    /**
     * Initialize the date input with the current date on page load
     * @event - load event on the window object
     */
    window.addEventListener("load", (event) => {
        event.preventDefault();
        let defaultDate = document.getElementById("date")
        let today = new Date()
        defaultDate.value = today.toISOString().slice(0, 10)
        fetchData(today)

    });

    /**
     * Bind event handlers to the form and button on page load
     * @event - DOMContentLoaded event on the document object
     */
    document.addEventListener("DOMContentLoaded", () => {
        //Nasa-api listener
        document.getElementById("date").addEventListener('input', resetDate)
        document.addEventListener("scroll", handleInfiniteScroll);

        //Our own rest-api listener
        cardContainer.addEventListener('submit', addComment)
        setInterval(fetchComments, updateSeconds);
    });


    /**
     * handle of infinite scroll,
     * when client go to end of page (and some delay for loading)
     * api fetch 3 dates more
     */
    const handleInfiniteScroll = () => {

        throttle(() => {
            const endOfPage = document.documentElement.scrollTop + window.innerHeight >= document.body.scrollHeight;

            let lastDisplayed = new Date(cardContainer.lastChild.id);
            let newLast = new Date(lastDisplayed.getTime())
            newLast.setDate(newLast.getDate() - 1)

            if (endOfPage) {
                fetchData(newLast);
            }

        }, 1000);
    };

    /**
     * delay time for infinite scroll
     */
    let throttleTimer;
    const throttle = (callback, time) => {
        if (throttleTimer) return;

        throttleTimer = true;

        setTimeout(() => {
            callback();
            throttleTimer = false;
        }, time);
    };

//--------------------------------- REST API functions ---------------------------------
    /**
     * Add a comment to the server.
     * It prepares the necessary data and sends a POST request.
     * *@param event - The event that triggers the function.
     */
    function addComment(event) {
        event.preventDefault();

        const comment = event.target.firstChild.value
        const date = event.target.parentNode.parentNode.id
        event.target.firstChild.value = ""
        if(comment.length > 0)
            postComment(date, comment)

    }

    /**
     * Posts a new comment to a REST API.
     * @param {string} date - The date associated with the comment.
     * @param {string} comment - The text of the comment.
     * @returns {void}
     */
    async function postComment(date, comment) {
        try {
            displayLoading();
            const response = await fetch(`${apiUrl}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dateId: date, commentTxt: comment }),
            });
            if (!response.ok) { throw new Error(response.statusText) }

            //post succeed - fetch get comments from server for loading the new comment
            await fetchComments();
        } catch (error) {
            console.error(error);
            displayError(apiErrorAddComment);
        }
        finally {hideLoading()}
    }

    /**
     * Fetches comments from a REST API within a specified date range.
     */
    async function fetchComments() {
        const startDate = cardContainer.lastChild.id;
        const endDate = cardContainer.firstElementChild.id;
        try {
            displayLoading();
            const response = await fetch(`${apiUrl}?start_date=${startDate}&end_date=${endDate}`);
            const data = await response.json();
            loadComments(data);
        } catch (error) {
            console.error(error);
            displayError(apiErrorLoadComments);
        }
        finally {hideLoading()}
    }

    /**
     * Deletes a comment from a REST API.
     * @param {Event} event - The event that triggers the function. The event's target's id is used as the comment id.
     * @returns {void}
     */
    async function deleteComment(event) {
        event.preventDefault();
        let commentId = event.target.id;
        try {
            displayLoading();
            const response = await fetch(`${apiUrl}${commentId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            const data = await response.json();
            if(data.error) {
                throw new Error(data.error);
            }
            await fetchComments();
        } catch (error) {
            console.error(error);
            displayError(apiErrorDeleteComment);
        }
        finally {hideLoading();}

    }

    /**
     * Loads comments into the UI.
     * @param {Object} groupedComments - An object that contains comments grouped by date.
     * @returns {void}
     */
    function loadComments(groupedComments) {

        // iterate over grouped comments
        Object.keys(groupedComments).forEach(date => {
            const comments = groupedComments[date];
            const cardElement = document.getElementById(date)
            const comList = cardElement.querySelector('.comments-list');
            comList.style = "height: 300px; max-height: 500px; overflow-y: auto;"
            comList.innerHTML = ''

            comments.forEach(comment => {
                const commentRow = document.createElement('div');
                commentRow.className = "card-body bg-light rounded-4 m-4"
                const commentTxt = document.createElement('p');
                commentTxt.innerHTML = `<b>${comment.firstName} ${comment.lastName}:</b> ${comment.text}`;
                commentRow.appendChild(commentTxt)

                if (comment.owner){

                    const comDeleteBtn = document.createElement("button")
                    comDeleteBtn.className = "btn btn-block"
                    comDeleteBtn.id = comment.id
                    comDeleteBtn.textContent = "Delete"

                    commentRow.appendChild(comDeleteBtn);
                    comDeleteBtn.addEventListener('click', deleteComment)
                }
                comList.appendChild(commentRow);
            });
        });
    }
//--------------------------------- NASA API functions ---------------------------------
    /**
     * Resets the date range for the comments and fetches new data from the API.
     * @param {Event} event - The event that triggers the function. The event's target's value is used as the new end date.
     * @returns {void}
     */
    function resetDate(event) {
        event.preventDefault();
        cardContainer.innerHTML = '';
        let endDate = new Date(event.target.value);
        fetchData(endDate)
    }
    /**
     * Fetches data from the NASA API and displays it in the UI.
     * @param {Date} chosenDate - The date chosen by the user.
     * @returns {void}
    */
    async function fetchData(chosenDate) {
        try {
            let { startDate, endDate } = getStartEndDates(chosenDate);
            displayLoading();

            const response = await fetch(`${nasaUrl}${apiKey}&start_date=${startDate}&end_date=${endDate}`);
            const jsonResponse = await response.json();
            if (response.ok) {
                displayAtDate(jsonResponse);
                await fetchComments();
            } else {
                throw jsonResponse;
            }
        } catch (error) {
            console.error("error nasa", error.msg);
            displayError(error.msg);
        } finally {
            hideLoading();
        }
    }


    /**
     * Calculates the start and end dates for the comments based on the chosen date.
     * @param {Date} endDate - The end date chosen by the user.
     * @returns {Object} An object containing the start and end dates in ISO string format.
     */
    function getStartEndDates(endDate)
    {
        let startDate = new Date(endDate.getTime())
        startDate.setDate(startDate.getDate() - 2);
        startDate = startDate.toISOString().slice(0, 10)
        endDate = endDate.toISOString().slice(0, 10)
        return {startDate, endDate}
    }


    /**
     * Displays the data from the NASA API in the UI.
     * @param {Object} data - The data returned from the NASA API
     * @returns {void}
     */
    function displayAtDate(data){
        for(let dataImg of data.reverse()){
            const card = document.createElement("div")
            card.className = "card card-body h-10 p-2 rounded-4 mb-3 wrapper"
            card.id = dataImg.date

            const cardImgRow = document.createElement("div")
            cardImgRow.className = "row g-0 p-2 rounded-4"

            const cardComRow = document.createElement("div")
            cardComRow.className = "row g-0 p-1 rounded-4"

            const ComForm = document.createElement("form")
            ComForm.className = "form-outline mb-4"


            const ComInput = document.createElement("input")
            ComInput.className = "form-control"
            ComInput.type = "text"

            ComInput.placeholder = "Type comment..."

            const ComLabel = document.createElement("label")
            ComLabel.className = "form-label"
            ComLabel.type = "submit"
            ComLabel.value = "+ Add a comment"

            const comSubmitBtn = document.createElement("button")
            comSubmitBtn.className = "btn btn-block m-2"
            comSubmitBtn.textContent = "+ Add a comment"

            const comList = document.createElement("ul")
            comList.className = "comments-list mx-4"

            const cardColImg = document.createElement("div")
            cardColImg.className = "col-md-4 p-2 rounded-4"

            let cardImg = ''
            if(dataImg.media_type === "video"){
                cardImg = document.createElement("div")
                const video = document.createElement("iframe")
                cardImg.className = "img-fluid rounded-4 "
                video.src = dataImg.url
                cardImg.style = "height: 200px; max-height: 200px; overflow-y: auto;"
                cardImg.href = dataImg.hdurl
                cardImg.appendChild(video)
            }
            else{
                cardImg = document.createElement("img")
                cardImg.className = "img-fluid rounded-4 "
                cardImg.src = dataImg.url
                cardImg.style = "height: 200px; max-height: 200px; overflow-y: auto;"
                cardImg.href = dataImg.hdurl

            }

            const cardColText = document.createElement("div")
            cardColText.className = "col-md-8"

            const cardBody = document.createElement("div")
            cardBody.className = "card-body"
            cardBody.style = "height: 200px; max-height: 200px; overflow-y: auto;"


            const cardDate = document.createElement("h5")
            cardDate.className = "card-title text-muted"
            cardDate.textContent = dataImg.date

            const cardTitle = document.createElement("h5")
            cardTitle.className = "card-title"
            cardTitle.textContent = dataImg.title

            const cardExplanation = document.createElement("p")
            cardExplanation.className = "card-text"
            cardExplanation.textContent = dataImg.explanation

            const cardCopyright = document.createElement("p")
            cardCopyright.className = "card-text"
            cardCopyright.textContent = dataImg.copyright

            cardColImg.appendChild(cardImg)

            cardBody.appendChild(cardDate)
            cardBody.appendChild(cardTitle)
            cardBody.appendChild(cardExplanation)
            cardBody.appendChild(cardCopyright)

            cardColText.appendChild(cardBody)

            cardImgRow.appendChild(cardColImg)
            cardImgRow.appendChild(cardColText)

            ComForm.appendChild(ComInput)
            ComForm.appendChild(ComLabel)
            ComForm.appendChild(comSubmitBtn)
            ComForm.append(comList)
            cardComRow.appendChild(ComForm)


            card.appendChild(cardImgRow)
            card.appendChild(cardComRow)
            cardContainer.appendChild(card)
        }

    }

    /**
     * Displays an error message in the UI.
     * @param {String} data - The error message to be displayed.
     * @returns {void}
     */
    function displayError(data){
        document.removeEventListener("scroll", handleInfiniteScroll);
        clearInterval(fetchComments);

        cardContainer.innerHTML = '';
        const card = document.createElement("div")
        card.className = "card card-body h-10 p-2 rounded-4 mb-3 bg-danger"

        const cardRow = document.createElement("div")
        cardRow.className = "row g-0 p-2 mb-3 rounded-4"

        const cardErrorMessage = document.createElement("p")
        cardErrorMessage.className = "card-text text-white"
        cardErrorMessage.textContent = data

        cardRow.appendChild(cardErrorMessage)
        card.appendChild(cardRow)
        cardContainer.appendChild(card)
    }

    /**
     * Displays a loading spinner in the UI
     * @returns {void}
     */
    const displayLoading = () => {
        cardContainer.style.display = 'none';
        loaderContainer.style.display = 'block';
    };

    /**
     * Hide a loading spinner in the UI
     * @returns {void}
     */
    const hideLoading = () => {
        loaderContainer.style.display = 'none';
        cardContainer.style.display = 'block';

    };

})();
