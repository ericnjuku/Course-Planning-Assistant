const mysql = require('mysql');
const readline = require('readline');

const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Use static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for requests to URL
app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Establish MySQL connection
const connection = mysql.createConnection({
    host: 'localhost', // MySQL host
    user: 'root', // MySQL username
    password: 'Kareithi15', // MySQL password
    database: 'Pepperdine_Database' // MySQL database name
});

// Create interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Connect to MySQL
connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
    // Prompt user for major/minor input
    rl.question('Enter your major or minor: ', (input) => {
        // Query database for required courses for major/minor
        connection.query(`SELECT c.COURSE_ID, c.COURSE_TITLE, c.COURSE_CREDITS
                          FROM Courses c
                          JOIN Courses_Has_Majors_Minors chmm ON c.COURSE_ID = chmm.COURSE_ID
                          JOIN Majors_Minors mm ON chmm.M_TITLE = mm.M_TITLE
                          WHERE mm.M_TITLE = ?`, [input], (err, results) => {
            if (err) throw err;
            // Calculate total credits required for major/minor
            let totalCredits = 0;
            const coursePlan = [];
            results.forEach(row => {
                totalCredits += row.COURSE_CREDITS;
                coursePlan.push(row);
            });

            // Calculate remaining credits for GEs
            const remainingCredits = 128 - totalCredits;

            // Query database for GEs
            connection.query(`SELECT COURSE_ID, COURSE_TITLE, COURSE_CREDITS
                              FROM Courses WHERE IS_GE = 'Y' ORDER BY COURSE_ID LIMIT ${remainingCredits}`, (err, geResults) => {
                if (err) throw err;
                // Add GEs to plan
                geResults.forEach(row => {
                    coursePlan.push(row);
                });

                // Output plan
                console.log(`Course plan for ${input}:`);
                const years = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
                let yearIndex = 0;
                let totalCourses = coursePlan.length;
                let coursesPerYear = Math.ceil(totalCourses / years.length);
                let coursesAssigned = 0;
                for (let i = 0; i < years.length; i++) {
                    console.log(`${years[i]}:`);
                    for (let j = 0; j < coursesPerYear && coursesAssigned < totalCourses; j++) {
                        console.log(`- ${coursePlan[coursesAssigned].COURSE_ID}: ${coursePlan[coursesAssigned].COURSE_TITLE}`);
                        coursesAssigned++;
                    }
                }

                // Close connection
                connection.end();
                // Close readline interface
                rl.close();
            });
        });
    });
});

app.get('/course-plan', (req, res) => {
    // Retrieve the major/minor from query
    const majorMinor = req.query.majorMinor;

    // Query database for course plan
    connection.query(`
        SELECT c.COURSE_ID, c.COURSE_TITLE
        FROM Courses c
        JOIN Courses_Has_Majors_Minors chmm ON c.COURSE_ID = chmm.COURSE_ID
        JOIN Majors_Minors mm ON chmm.M_TITLE = mm.M_TITLE
        WHERE mm.M_TITLE = ?`, [majorMinor], (err, results) => {
        if (err) {
            console.error('Error fetching course plan from database:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        // Send generated course plan
        res.json({ coursePlan: results });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
