function generatePlan() {
  // Retrieve the value of the input field where users enter their major/minor
  const majorMinor = document.getElementById('major-minor').value;

  // Make a fetch request to the backend endpoint to generate the course plan
  fetch(`/course-plan?majorMinor=${encodeURIComponent(majorMinor)}`)
      .then(response => {
          // Check if the fetch request was successful (status code 200)
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          // Parse the JSON response
          return response.json();
      })
      .then(data => {
          // Access the course plan data from the response
          const coursePlanDiv = document.getElementById('course-plan');
          coursePlanDiv.innerHTML = ''; // Clear previous content

          // Check if the response contains an error message
          if (data.error) {
              coursePlanDiv.textContent = data.error; // Display error message
          } else {
              const coursePlan = data.coursePlan;

              // Calculate the number of courses per year
              const coursesPerYear = Math.ceil(coursePlan.length / 4);

              // Initialize variables to keep track of the displayed year title
              let currentYearIndex = -1;
              let yearTitleDisplayed = false;

              // Loop through the course plan data and display each course
              for (let i = 0; i < coursePlan.length; i++) {
                  // Calculate the year index based on the current index and courses per year
                  const yearIndex = Math.floor(i / coursesPerYear);

                  // Check if we need to display the year title for the current year group
                  if (yearIndex !== currentYearIndex) {
                      // Display the year title only once per year group
                      currentYearIndex = yearIndex;
                      yearTitleDisplayed = false;
                  }

                  // Display the year title if it hasn't been displayed yet for the current year group
                  if (!yearTitleDisplayed) {
                      coursePlanDiv.innerHTML += `<h2>${getYearName(yearIndex)}:</h2>`;
                      yearTitleDisplayed = true;
                  }

                  // Append the course information to the coursePlanDiv
                  coursePlanDiv.innerHTML += `<p>- ${coursePlan[i].COURSE_ID}: ${coursePlan[i].COURSE_TITLE}</p>`;
              }
          }
      })
      .catch(error => {
          // Handle fetch errors
          console.error('Fetch error:', error);
          // Display an error message on the webpage
          document.getElementById('course-plan').textContent = 'An error occurred while generating the course plan. Please try again later.';
      });
}

// Function to get the year name based on the year index
function getYearName(yearIndex) {
  // Define year names (customize as needed)
  const yearNames = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
  // Return the year name corresponding to the year index
  return yearNames[yearIndex] || 'Other';
}



document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generateButton');
    const coursePlanOutput = document.getElementById('coursePlanOutput');
  
    generateButton.addEventListener('click', async () => {
      try {
        const majorMinor = document.getElementById('majorMinor').value;
  
        const response = await fetch(`/course-plan?majorMinor=${majorMinor}`);
        if (!response.ok) {
          throw new Error('Failed to fetch course plan');
        }
  
        const data = await response.json();
        console.log(data);
  
        // Clear previous course plan output
        coursePlanOutput.innerHTML = '';
  
        // Display course plan data
        data.coursePlan.forEach(course => {
          const courseItem = document.createElement('li');
          courseItem.textContent = `${course.COURSE_ID}: ${course.COURSE_TITLE}`;
          coursePlanOutput.appendChild(courseItem);
        });
      } catch (error) {
        console.error('An error occurred:', error.message);
        // Display an error message to the user
      }
    });
  });
  
  