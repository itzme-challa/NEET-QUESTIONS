  document.addEventListener('DOMContentLoaded', () => {
        // Initialize Firebase
        const firebaseConfig = {
          apiKey: "AIzaSyD54FxWUlPn03bxD0UnD0oxVcMkI9ovCeQ",
          authDomain: "community-604af.firebaseapp.com",
          databaseURL: "https://community-604af-default-rtdb.asia-southeast1.firebasedatabase.app",
          projectId: "community-604af",
          storageBucket: "community-604af.appspot.com",
          messagingSenderId: "735063146170",
          appId: "1:735063146170:web:725bce2c3c64afc0f30c83",
          measurementId: "G-7YD8RLH33Q"
        };

        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const database = firebase.database();

        const elements = {
          userAvatar: document.getElementById('userAvatar'),
          userMenu: document.getElementById('userMenu'),
          dropdownMenu: document.getElementById('dropdownMenu'),
          logoutBtn: document.getElementById('logoutBtn'),
          resultsContent: document.getElementById('resultsContent'),
          loadingSpinner: document.getElementById('loadingSpinner'),
          resultDetails: document.getElementById('resultDetails'),
          resultTitle: document.getElementById('resultTitle'),
          resultScore: document.getElementById('resultScore'),
          resultDetailsText: document.getElementById('resultDetailsText'),
          backBtn: document.getElementById('backBtn'),
          newQuizBtn: document.getElementById('newQuizBtn'),
          errorMessage: document.getElementById('errorMessage'),
          errorText: document.getElementById('errorText')
        };

        // Validate elements
        Object.keys(elements).forEach(key => {
          if (!elements[key]) {
            console.warn(`Element with ID '${key}' not found in DOM.`);
          }
        });

        function showLoading(show) {
          if (elements.loadingSpinner && elements.resultDetails && elements.errorMessage) {
            elements.loadingSpinner.style.display = show ? 'flex' : 'none';
            elements.resultDetails.style.display = show ? 'none' : 'block';
            elements.errorMessage.style.display = 'none';
          }
        }

        function showError(message) {
          if (elements.errorMessage && elements.errorText && elements.loadingSpinner && elements.resultDetails) {
            elements.errorText.textContent = message;
            elements.errorMessage.style.display = 'block';
            elements.loadingSpinner.style.display = 'none';
            elements.resultDetails.style.display = 'none';
          }
        }

        function formatTime(seconds) {
          const mins = Math.floor(seconds / 60);
          const secs = seconds % 60;
          return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }

        async function loadResults() {
          showLoading(true);
          const urlParams = new URLSearchParams(window.location.search);
          const resultId = urlParams.get('result');
          
          if (!resultId) {
            showError('No result ID provided.');
            return;
          }

          try {
            const snapshot = await database.ref(`quizHistory/${auth.currentUser.uid}/${resultId}`).once('value');
            const result = snapshot.val();

            if (!result) {
              showError('Result not found.');
              return;
            }

            if (elements.resultTitle && elements.resultScore && elements.resultDetailsText) {
              elements.resultTitle.textContent = result.dppId ? 'Daily Practice Problem Results' : result.testId ? 'Test Results' : 'Quiz Results';
              elements.resultScore.textContent = `You scored ${result.score} out of ${result.total}`;
              elements.resultDetailsText.innerHTML = `
                <strong>Subject:</strong> ${result.subject.charAt(0).toUpperCase() + result.subject.slice(1)}<br>
                ${result.chapter ? `<strong>Chapter:</strong> ${result.chapter}<br>` : ''}
                ${result.unit ? `<strong>Unit:</strong> ${result.unit}<br>` : ''}
                ${result.topic ? `<strong>Topic:</strong> ${result.topic}<br>` : ''}
                ${result.quizType ? `<strong>Quiz Type:</strong> ${result.quizType}<br>` : ''}
                <strong>Time Taken:</strong> ${formatTime(result.timeTaken)}<br>
                <strong>Date:</strong> ${new Date(result.date).toLocaleString()}
              `;
            }
          } catch (error) {
            console.error('Error loading results:', error);
            showError('Failed to load results: ' + error.message);
          } finally {
            showLoading(false);
          }
        }

        function initEventListeners() {
          if (elements.userAvatar && elements.dropdownMenu) {
            elements.userAvatar.addEventListener('click', () => {
              elements.dropdownMenu.classList.toggle('show');
            });
          }

          if (elements.logoutBtn) {
            elements.logoutBtn.addEventListener('click', () => {
              auth.signOut().then(() => {
                window.location.href = 'index.html';
              }).catch(error => {
                console.error('Error logging out:', error);
                showError('Failed to log out: ' + error.message);
              });
            });
          }

          if (elements.backBtn) {
            elements.backBtn.addEventListener('click', () => {
              window.location.href = 'index.html';
            });
          }

          if (elements.newQuizBtn) {
            elements.newQuizBtn.addEventListener('click', () => {
              window.location.href = 'index.html';
            });
          }

          window.addEventListener('click', (e) => {
            if (elements.userMenu && elements.dropdownMenu && !elements.userMenu.contains(e.target)) {
              elements.dropdownMenu.classList.remove('show');
            }
          });
        }

        auth.onAuthStateChanged((user) => {
          if (!user) {
            window.location.href = 'index.html';
          } else {
            if (elements.userAvatar) {
              if (user.photoURL) {
                elements.userAvatar.style.backgroundImage = `url(${user.photoURL})`;
                elements.userAvatar.textContent = '';
              } else {
                elements.userAvatar.textContent = user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U';
              }
            }
            initEventListeners();
            loadResults();
          }
        });
      });
    
