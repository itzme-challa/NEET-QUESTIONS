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
          
          // Load user's DPPs
          loadDPPs(user.uid);
          
          // Initialize form
          initDPPForm();
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

      // Load DPPs from database
      function loadDPPs(userId) {
        database.ref('dpps/' + userId).once('value').then((snapshot) => {
          const dpps = snapshot.val();
          const container = document.getElementById('dppContainer');
          container.innerHTML = '';
          
          if (!dpps) {
            container.innerHTML = `
              <div class="empty-state">
                <i class="fas fa-info-circle empty-state-icon"></i>
                <div>No DPPs created yet</div>
              </div>
            `;
            return;
          }
          
          Object.entries(dpps).forEach(([id, dpp]) => {
            const dppCard = document.createElement('div');
            dppCard.className = 'dpp-card';
            dppCard.innerHTML = `
              <div class="dpp-header">
                <h3 class="dpp-title">${dpp.name}</h3>
                <div class="dpp-meta">
                  <span class="dpp-subject">${dpp.subject.charAt(0).toUpperCase() + dpp.subject.slice(1)}</span>
                  <span>${new Date(dpp.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <p class="dpp-description">
                ${dpp.questions} questions from ${dpp.topic} (${dpp.chapter})
              </p>
              <div class="dpp-actions">
                <a href="play.html?dppId=${id}" class="btn btn-primary">Start Practice</a>
                <button class="btn btn-outline delete-dpp" data-id="${id}">Delete</button>
              </div>
            `;
            container.appendChild(dppCard);
          });
          
          // Add event listeners to delete buttons
          document.querySelectorAll('.delete-dpp').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const dppId = e.target.dataset.id;
              if (confirm('Are you sure you want to delete this DPP?')) {
                database.ref('dpps/' + auth.currentUser.uid + '/' + dppId).remove()
                  .then(() => loadDPPs(auth.currentUser.uid));
              }
            });
          });
        });
      }

      // Initialize DPP form
      function initDPPForm() {
        const form = document.getElementById('dppForm');
        const subjectSelect = document.getElementById('dppSubject');
        const chapterSelect = document.getElementById('dppChapter');
        const unitSelect = document.getElementById('dppUnit');
        const topicSelect = document.getElementById('dppTopic');
        
        // Load chapters when subject is selected
        subjectSelect.addEventListener('change', () => {
          chapterSelect.disabled = !subjectSelect.value;
          unitSelect.disabled = true;
          topicSelect.disabled = true;
          
          if (subjectSelect.value) {
            loadChapters(subjectSelect.value);
          } else {
            chapterSelect.innerHTML = '<option value="">Select Chapter</option>';
          }
        });
        
        // Load units when chapter is selected
        chapterSelect.addEventListener('change', () => {
          unitSelect.disabled = !chapterSelect.value;
          topicSelect.disabled = true;
          
          if (chapterSelect.value) {
            loadUnits(subjectSelect.value, chapterSelect.value);
          } else {
            unitSelect.innerHTML = '<option value="">Select Unit</option>';
          }
        });
        
        // Load topics when unit is selected
        unitSelect.addEventListener('change', () => {
          topicSelect.disabled = !unitSelect.value;
          
          if (unitSelect.value) {
            loadTopics(subjectSelect.value, chapterSelect.value, unitSelect.value);
          } else {
            topicSelect.innerHTML = '<option value="">Select Topic</option>';
          }
        });
        
        // Handle form submission
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          
          const userId = auth.currentUser.uid;
          const dppData = {
            name: document.getElementById('dppName').value,
            subject: subjectSelect.value,
            chapter: chapterSelect.value,
            unit: unitSelect.value,
            topic: topicSelect.value,
            questions: parseInt(document.getElementById('dppQuestions').value),
            createdAt: firebase.database.ServerValue.TIMESTAMP
          };
          
          // Save DPP to database
          const newDppRef = database.ref('dpps/' + userId).push();
          newDppRef.set(dppData)
            .then(() => {
              alert('DPP created successfully!');
              form.reset();
              loadDPPs(userId);
            })
            .catch((error) => {
              alert('Error creating DPP: ' + error.message);
            });
        });
      }
      
      // Load chapters from Firestore
      function loadChapters(subject) {
        const chapterSelect = document.getElementById('dppChapter');
        chapterSelect.innerHTML = '<option value="">Loading...</option>';
        
        firestore.collection('subjects').doc(subject).collection('chapters').get()
          .then((snapshot) => {
            chapterSelect.innerHTML = '<option value="">Select Chapter</option>';
            snapshot.forEach((doc) => {
              const option = document.createElement('option');
              option.value = doc.id;
              option.textContent = doc.id;
              chapterSelect.appendChild(option);
            });
          })
          .catch((error) => {
            chapterSelect.innerHTML = '<option value="">Error loading chapters</option>';
            console.error('Error loading chapters:', error);
          });
      }
      
      // Load units from Firestore
      function loadUnits(subject, chapter) {
        const unitSelect = document.getElementById('dppUnit');
        unitSelect.innerHTML = '<option value="">Loading...</option>';
        
        firestore.collection('subjects').doc(subject)
          .collection('chapters').doc(chapter)
          .collection('units').get()
          .then((snapshot) => {
            unitSelect.innerHTML = '<option value="">Select Unit</option>';
            snapshot.forEach((doc) => {
              const option = document.createElement('option');
              option.value = doc.id;
              option.textContent = doc.id;
              unitSelect.appendChild(option);
            });
          })
          .catch((error) => {
            unitSelect.innerHTML = '<option value="">Error loading units</option>';
            console.error('Error loading units:', error);
          });
      }
      
      // Load topics from Firestore
      function loadTopics(subject, chapter, unit) {
        const topicSelect = document.getElementById('dppTopic');
        topicSelect.innerHTML = '<option value="">Loading...</option>';
        
        firestore.collection('subjects').doc(subject)
          .collection('chapters').doc(chapter)
          .collection('units').doc(unit)
          .collection('topics').get()
          .then((snapshot) => {
            topicSelect.innerHTML = '<option value="">Select Topic</option>';
            snapshot.forEach((doc) => {
              const option = document.createElement('option');
              option.value = doc.id;
              option.textContent = doc.id;
              topicSelect.appendChild(option);
            });
          })
          .catch((error) => {
            topicSelect.innerHTML = '<option value="">Error loading topics</option>';
            console.error('Error loading topics:', error);
          });
      }
    });
  
