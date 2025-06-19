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
      const firestore = firebase.firestore();

      // Add auth state listener
      auth.onAuthStateChanged((user) => {
        if (!user) {
          window.location.href = 'index.html';
        } else {
          // Set user avatar
          if (user.photoURL) {
            document.getElementById('userAvatar').style.backgroundImage = `url(${user.photoURL})`;
            document.getElementById('userAvatar').textContent = '';
          } else {
            document.getElementById('userAvatar').textContent = user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U';
          }
          
          // Load user's tests
          loadTests(user.uid);
          
          // Initialize form
          initTestForm();
        }
      });

      // Handle logout
      document.getElementById('logoutBtn').addEventListener('click', () => {
        auth.signOut().then(() => {
          window.location.href = 'index.html';
        });
      });

      // Toggle dropdown menu
      document.getElementById('userAvatar').addEventListener('click', () => {
        document.getElementById('dropdownMenu').classList.toggle('show');
      });

      // Close dropdown when clicking outside
      window.addEventListener('click', (e) => {
        if (!document.getElementById('userMenu').contains(e.target)) {
          document.getElementById('dropdownMenu').classList.remove('show');
        }
      });

      // Load tests from database
      function loadTests(userId) {
        database.ref('tests/' + userId).once('value').then((snapshot) => {
          const tests = snapshot.val();
          const container = document.getElementById('testsContainer');
          container.innerHTML = '';
          
          if (!tests) {
            container.innerHTML = `
              <div class="empty-state">
                <i class="fas fa-info-circle empty-state-icon"></i>
                <div>No tests created yet</div>
              </div>
            `;
            return;
          }
          
          Object.entries(tests).forEach(([id, test]) => {
            const testCard = document.createElement('div');
            testCard.className = 'test-card';
            testCard.innerHTML = `
              <div class="test-header">
                <h3 class="test-title">${test.name}</h3>
                <div class="test-meta">
                  <span class="test-subject">${test.subject === 'all' ? 'All Subjects' : test.subject.charAt(0).toUpperCase() + test.subject.slice(1)}</span>
                  <span>${new Date(test.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <p class="test-description">
                ${test.questions} questions | ${test.time} minutes | ${test.chapters.length} chapters
              </p>
              <div class="test-actions">
                <a href="play.html?testId=${id}" class="btn btn-primary">Start Test</a>
                <button class="btn btn-outline delete-test" data-id="${id}">Delete</button>
              </div>
            `;
            container.appendChild(testCard);
          });
          
          // Add event listeners to delete buttons
          document.querySelectorAll('.delete-test').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const testId = e.target.dataset.id;
              if (confirm('Are you sure you want to delete this test?')) {
                database.ref('tests/' + auth.currentUser.uid + '/' + testId).remove()
                  .then(() => loadTests(auth.currentUser.uid));
              }
            });
          });
        });
      }

      // Initialize test form
      function initTestForm() {
        const form = document.getElementById('testForm');
        const subjectSelect = document.getElementById('testSubject');
        const chaptersList = document.getElementById('chaptersList');
        
        // Load chapters when subject is selected
        subjectSelect.addEventListener('change', () => {
          if (!subjectSelect.value) {
            chaptersList.innerHTML = `
              <div class="empty-state">
                <i class="fas fa-info-circle empty-state-icon"></i>
                <div>Select a subject to see chapters</div>
              </div>
            `;
            return;
          }
          
          if (subjectSelect.value === 'all') {
            loadAllChaptersOptions();
          } else {
            loadSubjectChapters(subjectSelect.value);
          }
        });
        
        // Handle form submission
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          
          const userId = auth.currentUser.uid;
          const selectedChapters = Array.from(document.querySelectorAll('.chapter-checkbox:checked'))
            .map(checkbox => checkbox.value);
          
          if (selectedChapters.length === 0) {
            alert('Please select at least one chapter');
            return;
          }
          
          const testData = {
            name: document.getElementById('testName').value,
            subject: document.getElementById('testSubject').value,
            questions: parseInt(document.getElementById('testQuestions').value),
            time: parseInt(document.getElementById('testTime').value),
            chapters: selectedChapters,
            createdAt: firebase.database.ServerValue.TIMESTAMP
          };
          
          // Save test to database
          const newTestRef = database.ref('tests/' + userId).push();
          newTestRef.set(testData)
            .then(() => {
              alert('Test created successfully!');
              form.reset();
              chaptersList.innerHTML = `
                <div class="empty-state">
                  <i class="fas fa-info-circle empty-state-icon"></i>
                  <div>Select a subject to see chapters</div>
                </div>
              `;
              loadTests(userId);
            })
            .catch((error) => {
              alert('Error creating test: ' + error.message);
            });
        });
      }
      
      // Load chapters for a specific subject
      function loadSubjectChapters(subject) {
        chaptersList.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin empty-state-icon"></i><div>Loading chapters...</div></div>';
        
        firestore.collection('subjects').doc(subject).collection('chapters').get()
          .then((snapshot) => {
            if (snapshot.empty) {
              chaptersList.innerHTML = '<div class="empty-state"><i class="fas fa-info-circle empty-state-icon"></i><div>No chapters found</div></div>';
              return;
            }
            
            chaptersList.innerHTML = '';
            snapshot.forEach((doc) => {
              const chapterItem = document.createElement('div');
              chapterItem.className = 'chapter-item';
              chapterItem.innerHTML = `
                <input type="checkbox" id="chapter-${doc.id}" class="chapter-checkbox" value="${doc.id}" checked>
                <label for="chapter-${doc.id}" style="margin-left: 0.5rem;">${doc.id}</label>
              `;
              chaptersList.appendChild(chapterItem);
            });
          })
          .catch((error) => {
            chaptersList.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle empty-state-icon"></i><div>Error loading chapters</div></div>';
            console.error('Error loading chapters:', error);
          });
      }
      
      // Load all chapters from all subjects
      function loadAllChaptersOptions() {
        chaptersList.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin empty-state-icon"></i><div>Loading all chapters...</div></div>';
        
        const subjects = ['biology', 'chemistry', 'physics'];
        let loadedSubjects = 0;
        let allChapters = [];
        
        subjects.forEach(subject => {
          firestore.collection('subjects').doc(subject).collection('chapters').get()
            .then((snapshot) => {
              snapshot.forEach((doc) => {
                allChapters.push({
                  subject: subject,
                  chapter: doc.id
                });
              });
              
              loadedSubjects++;
              if (loadedSubjects === subjects.length) {
                renderAllChapters(allChapters);
              }
            })
            .catch((error) => {
              console.error(`Error loading ${subject} chapters:`, error);
              loadedSubjects++;
              if (loadedSubjects === subjects.length) {
                renderAllChapters(allChapters);
              }
            });
        });
      }
      
      function renderAllChapters(chapters) {
        if (chapters.length === 0) {
          chaptersList.innerHTML = '<div class="empty-state"><i class="fas fa-info-circle empty-state-icon"></i><div>No chapters found</div></div>';
          return;
        }
        
        chaptersList.innerHTML = '';
        chapters.forEach(chapter => {
          const chapterItem = document.createElement('div');
          chapterItem.className = 'chapter-item';
          chapterItem.innerHTML = `
            <input type="checkbox" id="chapter-${chapter.subject}-${chapter.chapter}" 
                   class="chapter-checkbox" 
                   value="${chapter.subject}:${chapter.chapter}" checked>
            <label for="chapter-${chapter.subject}-${chapter.chapter}" style="margin-left: 0.5rem;">
              ${chapter.chapter} (${chapter.subject.charAt(0).toUpperCase() + chapter.subject.slice(1)})
            </label>
          `;
          chaptersList.appendChild(chapterItem);
        });
      }
    });
  
