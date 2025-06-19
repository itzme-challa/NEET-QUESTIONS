// Main application router
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  
  // Handle routing
  function render() {
    const path = window.location.hash.substr(1);
    const parts = path.split('/');
    
    app.innerHTML = '';
    
    if (path === '') {
      renderHome();
    } else if (parts[0] === 'subject') {
      const subject = parts[1];
      if (parts.length === 2) {
        renderQuizTypes(subject);
      } else if (parts.length === 3) {
        const quizType = parts[2];
        renderChapters(subject, quizType);
      } else if (parts.length === 4) {
        const chapter = parts[3];
        renderUnits(subject, quizType, chapter);
      } else if (parts.length === 5) {
        const unit = parts[4];
        renderTopics(subject, quizType, chapter, unit);
      }
    } else if (parts[0] === 'play') {
      const id = parts[1];
      renderQuizQuestion(id);
    }
  }
  
  // Initial render
  render();
  window.addEventListener('hashchange', render);
  
  // Render home page
  function renderHome() {
    app.innerHTML = `
      <div class="card-grid">
        <div class="card" onclick="navigateTo('#subject/biology')">
          <h2>Biology</h2>
          <p>Practice biology questions for NEET preparation</p>
        </div>
        <div class="card" onclick="navigateTo('#subject/chemistry')">
          <h2>Chemistry</h2>
          <p>Practice chemistry questions for NEET preparation</p>
        </div>
        <div class="card" onclick="navigateTo('#subject/physics')">
          <h2>Physics</h2>
          <p>Practice physics questions for NEET preparation</p>
        </div>
      </div>
    `;
  }
  
  // Render quiz types for a subject
  window.renderQuizTypes = function(subject) {
    app.innerHTML = `
      <a href="#" class="back-button" onclick="navigateTo('#')">← Back to Subjects</a>
      <h2>${capitalizeFirstLetter(subject)} Quiz Types</h2>
      <div class="card-grid">
        <div class="card" onclick="navigateTo('#subject/${subject}/mcq')">
          <h2>MCQ Quiz</h2>
          <p>Multiple choice questions with explanations</p>
        </div>
        <div class="card" onclick="navigateTo('#subject/${subject}/flashcard')">
          <h2>Flashcards</h2>
          <p>Quick revision with flashcards</p>
        </div>
        <div class="card" onclick="navigateTo('#subject/${subject}/video')">
          <h2>Videos</h2>
          <p>Educational videos for concepts</p>
        </div>
        <div class="card" onclick="navigateTo('#subject/${subject}/all')">
          <h2>All Types</h2>
          <p>Mixed question types</p>
        </div>
      </div>
    `;
  }
  
  // Helper function to capitalize first letter
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  // Navigation function
  window.navigateTo = function(path) {
    window.location.hash = path;
  }
});

// Load data from JSON files
async function fetchSubjectData(subject) {
  try {
    const response = await fetch(`https://itzfew.github.io/NEET-Questions/data/${subject}.json`);
    if (!response.ok) throw new Error('Failed to fetch data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

// Extract unique chapters from data
function getUniqueChapters(data) {
  const chapters = new Set();
  data.forEach(item => {
    if (item['Chapter Name']) {
      chapters.add(item['Chapter Name']);
    } else if (item['Unique Chapter Name']) {
      chapters.add(item['Unique Chapter Name']);
    }
  });
  return Array.from(chapters).sort();
}

// Render chapters for a subject and quiz type
window.renderChapters = async function(subject, quizType) {
  const app = document.getElementById('app');
  app.innerHTML = '<p>Loading...</p>';
  
  const data = await fetchSubjectData(subject);
  const chapters = getUniqueChapters(data);
  
  app.innerHTML = `
    <a href="#subject/${subject}" class="back-button">← Back to Quiz Types</a>
    <h2>${capitalizeFirstLetter(subject)} Chapters (${quizType.toUpperCase()})</h2>
    <div class="card-grid" id="chapters-container">
      ${chapters.map(chapter => `
        <div class="card" onclick="navigateTo('#subject/${subject}/${quizType}/${encodeURIComponent(chapter)}')">
          <h2>${chapter}</h2>
          <p>Click to view units</p>
        </div>
      `).join('')}
    </div>
  `;
}

// Extract unique units from data for a chapter
function getUniqueUnits(data, chapter) {
  const units = new Set();
  data.forEach(item => {
    const chapterMatch = item['Chapter Name'] === chapter || item['Unique Chapter Name'] === chapter;
    if (chapterMatch && item.topic_name) {
      const parts = item.topic_name.split('>>');
      if (parts.length > 1) {
        units.add(parts[1].trim());
      }
    }
  });
  return Array.from(units).sort();
}

// Render units for a chapter
window.renderUnits = async
