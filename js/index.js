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

      const elements = {
        authScreen: document.getElementById('authScreen'),
        dashboardScreen: document.getElementById('dashboardScreen'),
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
        userMenu: document.getElementById('userMenu'),
        userAvatar: document.getElementById('userAvatar'),
        dropdownMenu: document.getElementById('dropdownMenu'),
        logoutBtn: document.getElementById('logoutBtn')
      };

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

      // Login button click
      elements.loginBtn.addEventListener('click', () => {
        elements.authScreen.style.display = 'block';
        elements.dashboardScreen.style.display = 'none';
      });

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

      // Update UI based on auth state
      function updateUI(user) {
        if (user) {
          // User is signed in
          elements.authScreen.style.display = 'none';
          elements.dashboardScreen.style.display = 'block';
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
        } else {
          // User is signed out
          elements.authScreen.style.display = 'none';
          elements.dashboardScreen.style.display = 'block';
          elements.loginBtn.style.display = 'block';
          elements.userMenu.style.display = 'none';
        }
      }

      // Check auth state on load
      auth.onAuthStateChanged((user) => {
        updateUI(user);
      });
    });
  
