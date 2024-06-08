// Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyCh2bEL2DpWwlNxQxsDVW0UooLYJAuaH_Y",
    authDomain: "nuvoro-569b9.firebaseapp.com",
    projectId: "nuvoro-569b9",
    storageBucket: "nuvoro-569b9.appspot.com",
    messagingSenderId: "863300118496",
    appId: "1:863300118496:web:f58f70165cceb120376d85",
    measurementId: "G-1HWXN3NYT6"
};

// Initialize Firebase if it hasn't been initialized already
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log("User is signed in:", user);
        fetchUserInfo(user.uid);
    } else {
        console.log("No user is signed in.");
        window.location.href = 'signup.html'; // Redirect to signup if not logged in
    }
});

function fetchUserInfo(userId) {
    console.log('Fetching user info for ID:', userId);
    fetch(`https://nuvoro.net/api/user-info?uid=${userId}`)
        .then(response => {
            console.log('Response:', response);
            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('User info fetched:', data);
            if (data.success) {
                document.getElementById('user-name').innerText = `Hello, ${data.data.FIRST_NAME}`;
            } else {
                console.error('Failed to fetch user info:', data.message);
                document.getElementById('user-name').innerText = 'Hello, User';
            }
        })
        .catch(error => {
            console.error('Error fetching user info:', error);
            document.getElementById('user-name').innerText = 'Hello, User';
        });
}

function logout() {
    firebase.auth().signOut().then(() => {
        console.log('User signed out.');
        window.location.href = 'signup.html';
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
}
