# EX6 - MVC (NodeJS-Express-EJS) and database
# Authors: Ori Vered And Damian Tissembaum
<p>Email: <br>
orive@edu.hac.ac.il <br>
damiati@hac.ac.il</p>
<h1>Execution</h1>
<p>
run "npm install" for node_modules<br>
run "node_modules/.bin/sequelize db:migrate" for initialize DB<br>
Then submission is an express project that can be run directly from the IDE.
</p>
<h1>Assumptions</h1>
<p>
  The site use bootstap CDN therefore assumes an internet connection is available.
</p>
<h2> program description </h2> 
<p>
 register-login system:
 user need to register successfully and login
 after login successfully will show dashboard:<br>
 gets from NASA api picture of the day (one per day). 
 The user must login, he can choose the last day from the pictures that will be shown. <br>
 The user can add a comment to a picture shown, delete his own comment, and see the comments from other users <br>
 comments are updated every 15 secs, Note - we pull the comments and update all comments every 15 seconds
 </p>
