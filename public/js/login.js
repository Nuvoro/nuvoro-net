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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            var user = userCredential.user;
            console.log("User signed in: ", user);
            logLogin(user);  // Log the login attempt
            window.location.href = 'admin.html'; // Redirect to admin UI
        })
        .catch((error) => {
            console.error('Error logging in with email:', error);
            alert('Failed to log in: ' + error.message);
        });
});

window.googleSignIn = function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then((result) => {
        // User signed in
        var user = result.user;
        console.log("User signed in: ", user);
        logLogin(user);  // Log the login attempt
        window.location.href = 'admin.html'; // Redirect to admin UI
    }).catch((error) => {
        console.error("Error signing in with Google: ", error);
        alert("Error signing in with Google: " + error.message);
    });
};

window.phoneSignIn = function() {
    var phoneNumber = window.prompt("Enter your phone number:");
    var appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
    });

    firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
        .then((confirmationResult) => {
            // SMS sent. Prompt user to type the code from the message.
            var code = window.prompt("Enter the verification code you received on your phone:");
            return confirmationResult.confirm(code);
        })
        .then((result) => {
            // User signed in successfully.
            var user = result.user;
            console.log("User signed in: ", user);
            logLogin(user);  // Log the login attempt
            window.location.href = 'admin.html'; // Redirect to admin UI
        })
        .catch((error) => {
            console.error("Error signing in with phone: ", error);
            alert("Error signing in with phone: " + error.message);
        });
};

function logLogin(user) {
    fetch('https://nuvoro.net/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid: user.uid, email: user.email, timestamp: new Date().toISOString() })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Login logged successfully');
        } else {
            console.error('Failed to log login:', data.message);
        }
    })
    .catch((error) => {
        console.error('Error logging login:', error);
    });
}
