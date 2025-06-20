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

      try {
        firebase.initializeApp(firebaseConfig);
      } catch (error) {
        console.error('Firebase initialization failed:', error);
        alert('Failed to initialize Firebase. Please check your configuration.');
        return;
      }

      const auth = firebase.auth();
      const database = firebase.database();

      const elements = {
        authScreen: document.getElementById('authScreen'),
        dashboardScreen: document.getElementById('dashboardScreen'),
        loginPrompt: document.getElementById('loginPrompt'),
        dashboardContent: document.getElementById('dashboardContent'),
        authTitle: document.getElementById('authTitle'),
        authForm: document.getElementById('authForm'),
        nameGroup: document.getElementById('nameGroup'),
        email: document.getElementById('email'),
        password: document.getElementById('password'),
        authSubmit: document.getElementById('authSubmit'),
        authFooterText: document.getElementById('authFooterText'),
        authToggle: document.getElementById('authToggle'),
        googleAuth: document.getElementById('googleAuth'),
        loginBtn: document.getElementById('loginBtn'),
        promptLoginBtn: document.getElementById('promptLoginBtn'),
        userMenu: document.getElementById('userMenu'),
        userAvatar: document.getElementById('userAvatar'),
        dropdownMenu: document.getElementById('dropdownMenu'),
        logoutBtn: document.getElementById('logoutBtn'),
        weeklyToppers: document.getElementById('weeklyToppers'),
        monthlyToppers: document.getElementById('monthlyToppers'),
        latestAttempts: document.getElementById('latestAttempts'),
        weeklyLoading: document.getElementById('weeklyLoading'),
        monthlyLoading: document.getElementById('monthlyLoading'),
        latestLoading: document.getElementById('latestLoading'),
        weeklyEmpty: document.getElementById('weeklyEmpty'),
        monthlyEmpty: document.getElementById('monthlyEmpty'),
        latestEmpty: document.getElementById('latestEmpty'),
        weeklyError: document.getElementById('weeklyError'),
        monthlyError: document.getElementById('monthlyError'),
        latestError: document.getElementById('latestError'),
        weeklyContent: document.getElementById('weeklyContent'),
        monthlyContent: document.getElementById('monthlyContent'),
        latestContent: document.getElementById('latestContent')
      };

      Object.entries(elements).forEach(([key, element]) => {
        if (!element) {
          console.warn(`Element with ID '${key}' not found in DOM.`);
        }
      });

      let isLogin = true;

      // Toggle between login and signup
      elements.authToggle.addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        if (isLogin) {
          elements.authTitle.textContent = 'Login';
          elements.authSubmit.textContent = 'Login';
          elements.authFooterText.textContent = "Don't have an account?";
          elements.authToggle.textContent = 'Sign up';
          elements.nameGroup.style.display = 'none';
        } else {
          elements.authTitle.textContent = 'Sign Up';
          elements.authSubmit.textContent = 'Sign Up';
          elements.authFooterText.textContent = "Already have an account?";
          elements.authToggle.textContent = 'Login';
          elements.nameGroup.style.display = 'flex';
        }
      });

      // Handle form submission
      elements.authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = elements.email.value;
        const password = elements.password.value;
        
        if (isLogin) {
          // Login
          auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
              updateUI(userCredential.user);
            })
            .catch((error) => {
              alert(error.message);
            });
        } else {
          // Signup
          const name = document.getElementById('name').value;
          auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
              // Save user data
              return userCredential.user.updateProfile({
                displayName: name
              }).then(() => {
                // Save additional user data to Realtime Database
                return database.ref('users/' + userCredential.user.uid).set({
                  name: name,
                  email: email,
                  createdAt: firebase.database.ServerValue.TIMESTAMP
                });
              });
            })
            .then(() => {
              updateUI(auth.currentUser);
            })
            .catch((error) => {
              alert(error.message);
            });
        }
      });

      // Google authentication
      elements.googleAuth.addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
          .then((result) => {
            const user = result.user;
            // Save user data if new user
            if (result.additionalUserInfo.isNewUser) {
              database.ref('users/' + user.uid).set({
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                createdAt: firebase.database.ServerValue.TIMESTAMP
              });
            }
            updateUI(user);
          })
          .catch((error) => {
            alert(error.message);
          });
      });

      // Login button click (header and prompt)
      function showAuthScreen() {
        elements.authScreen.style.display = 'block';
        elements.dashboardScreen.style.display = 'none';
      }

      elements.loginBtn.addEventListener('click', showAuthScreen);
      if (elements.promptLoginBtn) {
        elements.promptLoginBtn.addEventListener('click', showAuthScreen);
      }

      // Logout
      elements.logoutBtn.addEventListener('click', () => {
        auth.signOut();
      });

      // Toggle dropdown menu
      elements.userAvatar.addEventListener('click', () => {
        elements.dropdownMenu.classList.toggle('show');
      });

      // Close dropdown when clicking outside
      window.addEventListener('click', (e) => {
        if (!elements.userMenu.contains(e.target)) {
          elements.dropdownMenu.classList.remove('show');
        }
      });

      // Leaderboard tab navigation
      const tabs = document.querySelectorAll('.leaderboard-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          // Remove active class from all tabs and contents
          tabs.forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.leaderboard-content').forEach(content => content.classList.remove('active'));

          // Add active class to clicked tab and corresponding content
          tab.classList.add('active');
          const tabId = tab.getAttribute('data-tab');
          const content = document.getElementById(`${tabId}Content`);
          if (content) {
            content.classList.add('active');
          }

          // Load data for the selected tab if not already loaded
          if (tabId === 'weekly' && !elements.weeklyToppers.innerHTML) {
            loadWeeklyToppers();
          } else if (tabId === 'monthly' && !elements.monthlyToppers.innerHTML) {
            loadMonthlyToppers();
          } else if (tabId === 'latest' && !elements.latestAttempts.innerHTML) {
            loadLatestAttempts();
          }
        });
      });

      // Leaderboard functions
      function showLoading(section, show) {
        if (elements[`${section}Loading`] && elements[`${section}Empty`] && elements[`${section}Error`]) {
          elements[`${section}Loading`].style.display = show ? 'flex' : 'none';
          elements[`${section}Empty`].style.display = 'none';
          elements[`${section}Error`].style.display = 'none';
        }
      }

      function showEmpty(section, message = `No ${section} data available.`) {
        if (elements[`${section}Empty`] && elements[`${section}Loading`] && elements[`${section}Error`]) {
          elements[`${section}Empty`].style.display = 'block';
          elements[`${section}Empty`].querySelector('div').textContent = message;
          elements[`${section}Loading`].style.display = 'none';
          elements[`${section}Error`].style.display = 'none';
        }
      }

      function showError(section, message) {
        if (elements[`${section}Error`] && elements[`${section}Loading`] && elements[`${section}Empty`]) {
          elements[`${section}Error`].textContent = message;
          elements[`${section}Error`].style.display = 'block';
          elements[`${section}Loading`].style.display = 'none';
          elements[`${section}Empty`].style.display = 'none';
        }
      }

      async function fetchUserData(userId) {
        try {
          const snapshot = await database.ref(`users/${userId}`).once('value');
          const userData = snapshot.val();
          console.log(`Fetched user data for ${userId}:`, userData);
          return userData || { name: 'Anonymous', photoURL: null };
        } catch (error) {
          console.error(`Error fetching user data for ${userId}:`, error);
          return { name: 'Anonymous', photoURL: null };
        }
      }

      async function loadWeeklyToppers() {
        showLoading('weekly', true);
        try {
          const snapshot = await database.ref('quizHistory').once('value');
          const allResults = snapshot.val();
          if (!allResults) {
            console.warn('No quiz history data found.');
            showEmpty('weekly', 'No quiz results available for the past week.');
            return;
          }

          const weeklyResults = [];
          const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

          for (const userId in allResults) {
            const userResults = allResults[userId];
            for (const resultId in userResults) {
              const result = userResults[resultId];
              if (!result.date || !Number.isFinite(result.score) || !Number.isFinite(result.total)) {
                console.warn(`Invalid result data for user ${userId}, result ${resultId}:`, result);
                continue;
              }
              if (result.date > oneWeekAgo) {
                const user = await fetchUserData(userId);
                weeklyResults.push({
                  userId,
                  displayName: user.name || 'Anonymous',
                  photoURL: user.photoURL,
                  score: result.score,
                  total: result.total,
                  percentage: (result.score / result.total) * 100,
                  date: result.date
                });
              }
            }
          }

          console.log('Weekly results:', weeklyResults);
          weeklyResults.sort((a, b) => b.percentage - a.percentage || b.date - a.date);
          const top10 = weeklyResults.slice(0, 10);

          if (elements.weeklyToppers) {
            elements.weeklyToppers.innerHTML = top10.map((result, index) => `
              <li class="leaderboard-item">
                <span class="leaderboard-rank">${index + 1}</span>
                <div class="leaderboard-user">
                  <div class="leaderboard-avatar" ${result.photoURL ? `style="background-image: url(${result.photoURL}); background-size: cover;"` : ''}>
                    ${result.photoURL ? '' : (result.displayName ? result.displayName.charAt(0).toUpperCase() : 'A')}
                  </div>
                  <span>${result.displayName}</span>
                </div>
                <span class="leaderboard-score">${result.score}/${result.total} (${Math.round(result.percentage)}%)</span>
              </li>
            `).join('');
          }

          if (top10.length === 0) {
            showEmpty('weekly', 'No quiz results from the past week.');
          }
        } catch (error) {
          console.error('Error loading weekly toppers:', error);
          showError('weekly', `Failed to load weekly toppers: ${error.message}`);
        } finally {
          showLoading('weekly', false);
        }
      }

      async function loadMonthlyToppers() {
        showLoading('monthly', true);
        try {
          const snapshot = await database.ref('quizHistory').once('value');
          const allResults = snapshot.val();
          if (!allResults) {
            console.warn('No quiz history data found.');
            showEmpty('monthly', 'No quiz results available for the past month.');
            return;
          }

          const monthlyResults = [];
          const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

          for (const userId in allResults) {
            const userResults = allResults[userId];
            for (const resultId in userResults) {
              const result = userResults[resultId];
              if (!result.date || !Number.isFinite(result.score) || !Number.isFinite(result.total)) {
                console.warn(`Invalid result data for user ${userId}, result ${resultId}:`, result);
                continue;
              }
              if (result.date > oneMonthAgo) {
                const user = await fetchUserData(userId);
                monthlyResults.push({
                  userId,
                  displayName: user.name || 'Anonymous',
                  photoURL: user.photoURL,
                  score: result.score,
                  total: result.total,
                  percentage: (result.score / result.total) * 100,
                  date: result.date
                });
              }
            }
          }

          console.log('Monthly results:', monthlyResults);
          monthlyResults.sort((a, b) => b.percentage - a.percentage || b.date - a.date);
          const top20 = monthlyResults.slice(0, 20);

          if (elements.monthlyToppers) {
            elements.monthlyToppers.innerHTML = top20.map((result, index) => `
              <li class="leaderboard-item">
                <span class="leaderboard-rank">${index + 1}</span>
                <div class="leaderboard-user">
                  <div class="leaderboard-avatar" ${result.photoURL ? `style="background-image: url(${result.photoURL}); background-size: cover;"` : ''}>
                    ${result.photoURL ? '' : (result.displayName ? result.displayName.charAt(0).toUpperCase() : 'A')}
                  </div>
                  <span>${result.displayName}</span>
                </div>
                <span class="leaderboard-score">${result.score}/${result.total} (${Math.round(result.percentage)}%)</span>
              </li>
            `).join('');
          }

          if (top20.length === 0) {
            showEmpty('monthly', 'No quiz results from the past month.');
          }
        } catch (error) {
          console.error('Error loading monthly toppers:', error);
          showError('monthly', `Failed to load monthly toppers: ${error.message}`);
        } finally {
          showLoading('monthly', false);
        }
      }

      async function loadLatestAttempts() {
        showLoading('latest', true);
        try {
          const snapshot = await database.ref('quizHistory').once('value');
          const allResults = snapshot.val();
          if (!allResults) {
            console.warn('No quiz history data found.');
            showEmpty('latest', 'No recent quiz attempts available.');
            return;
          }

          const latestResults = [];
          for (const userId in allResults) {
            const userResults = allResults[userId];
            for (const resultId in userResults) {
              const result = userResults[resultId];
              if (!result.date || !Number.isFinite(result.score) || !Number.isFinite(result.total) || !result.subject) {
                console.warn(`Invalid result data for user ${userId}, result ${resultId}:`, result);
                continue;
              }
              const user = await fetchUserData(userId);
              latestResults.push({
                userId,
                displayName: user.name || 'Anonymous',
                photoURL: user.photoURL,
                score: result.score,
                total: result.total,
                percentage: (result.score / result.total) * 100,
                date: result.date,
                subject: result.subject
              });
            }
          }

          console.log('Latest results:', latestResults);
          latestResults.sort((a, b) => b.date - a.date);
          const top10 = latestResults.slice(0, 10);

          if (elements.latestAttempts) {
            elements.latestAttempts.innerHTML = top10.map((result, index) => `
              <li class="leaderboard-item">
                <span class="leaderboard-rank">${index + 1}</span>
                <div class="leaderboard-user">
                  <div class="leaderboard-avatar" ${result.photoURL ? `style="background-image: url(${result.photoURL}); background-size: cover;"` : ''}>
                    ${result.photoURL ? '' : (result.displayName ? result.displayName.charAt(0).toUpperCase() : 'A')}
                  </div>
                  <span>${result.displayName}</span>
                </div>
                <span class="leaderboard-score">${result.score}/${result.total} (${Math.round(result.percentage)}%) - ${result.subject.charAt(0).toUpperCase() + result.subject.slice(1)}</span>
              </li>
            `).join('');
          }

          if (top10.length === 0) {
            showEmpty('latest', 'No recent quiz attempts available.');
          }
        } catch (error) {
          console.error('Error loading latest attempts:', error);
          showError('latest', `Failed to load latest attempts: ${error.message}`);
        } finally {
          showLoading('latest', false);
        }
      }

      // Update UI based on auth state
      function updateUI(user) {
        if (user) {
          // User is signed in
          elements.authScreen.style.display = 'none';
          elements.dashboardScreen.style.display = 'block';
          elements.loginPrompt.style.display = 'none';
          elements.dashboardContent.style.display = 'block';
          elements.loginBtn.style.display = 'none';
          elements.userMenu.style.display = 'block';
          
          // Set user avatar
          if (user.photoURL) {
            elements.userAvatar.style.backgroundImage = `url(${user.photoURL})`;
            elements.userAvatar.style.backgroundSize = 'cover';
            elements.userAvatar.textContent = '';
          } else {
            elements.userAvatar.textContent = user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U';
          }

          // Load initial tab data (weekly toppers)
          loadWeeklyToppers();
        } else {
          // User is signed out
          elements.authScreen.style.display = 'none';
          elements.dashboardScreen.style.display = 'block';
          elements.loginPrompt.style.display = 'block';
          elements.dashboardContent.style.display = 'none';
          elements.loginBtn.style.display = 'block';
          elements.userMenu.style.display = 'none';
        }
      }

      // Initialize event listeners
      function initEventListeners() {
        // Initial load of weekly tab
        if (elements.weeklyToppers.innerHTML === '') {
          loadWeeklyToppers();
        }
      }

      // Check auth state on load
      auth.onAuthStateChanged((user) => {
        updateUI(user);
        if (user) {
          console.log('User authenticated:', user.uid);
          initEventListeners();
        }
      });
    });
