function generatePlan() {
  // Retrieve major/minor from user input
  const majorMinor = document.getElementById('major-minor').value;

  // Make fetch request to backend to generate course plan
  fetch(`/course-plan?majorMinor=${encodeURIComponent(majorMinor)}`)
      .then(response => {
          // Check if fetch was successful
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          // Parse response
          return response.json();
      })
      .then(data => {
          // Access course plan data from response
          const coursePlanDiv = document.getElementById('course-plan');
          coursePlanDiv.innerHTML = ''; // Clear previous content

          // Check if response contains error message
          if (data.error) {
              coursePlanDiv.textContent = data.error; // Display error message
          } else {
              const coursePlan = data.coursePlan;

              // Calculate number of courses per year
              const coursesPerYear = Math.ceil(coursePlan.length / 4);

              // Initialize variables for displayed year title
              let currentYearIndex = -1;
              let yearTitleDisplayed = false;

              // Loop through course plan and display each course
              for (let i = 0; i < coursePlan.length; i++) {
                  // Calculate year index based on the current index and courses per year
                  const yearIndex = Math.floor(i / coursesPerYear);

                  // Check if need to display the year title for the current year group
                  if (yearIndex !== currentYearIndex) {
                      // Display year title only once per year group 
                      currentYearIndex = yearIndex;
                      yearTitleDisplayed = false;
                  }

                  // Display year title if not displayed for current year group
                  if (!yearTitleDisplayed) {
                      coursePlanDiv.innerHTML += `<h2>${getYearName(yearIndex)}:</h2>`;
                      yearTitleDisplayed = true;
                  }

                  // Append course information
                  coursePlanDiv.innerHTML += `<p>- ${coursePlan[i].COURSE_ID}: ${coursePlan[i].COURSE_TITLE}</p>`;
              }
          }
      })
      .catch(error => {
          // Handle fetch errors
          console.error('Fetch error:', error);
          // Display an error message on webpage
          document.getElementById('course-plan').textContent = 'An error occurred while generating the course plan. Please try again later.';
      });
}

function getYearName(yearIndex) {
  const yearNames = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
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
        // Display error message
        console.error('An error occurred:', error.message);
      }
    });
  });
  
  
