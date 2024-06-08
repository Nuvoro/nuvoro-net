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

  // Function to fetch user information
  function fetchUserInfo(user, firstName, lastName) {
	var userInfo = {
	  uid: user.uid,
	  firstName: firstName,
	  lastName: lastName,
	  email: user.email,
	  displayName: user.displayName // Including displayName if needed
	};

	// Send user information to the backend server for Snowflake processing
	return fetch('https://nuvoro.net/api/user-info', {
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json'
	  },
	  body: JSON.stringify(userInfo)
	})
	.then(response => {
	  if (!response.ok) {
		return response.text().then(text => { throw new Error(text) });
	  }
	  return response.json();
	})
	.then(data => {
	  console.log(data.message);
	})
	.catch(error => {
	  console.error('Error fetching user information:', error);
	});
  }

  // Function to handle Google sign-in
  window.googleSignIn = function() {
	var provider = new firebase.auth.GoogleAuthProvider();
	firebase.auth().signInWithPopup(provider).then((result) => {
	  var user = result.user;
	  console.log("User signed in: ", user);
	  // Fetch user information with null firstName and lastName for Google sign-in
	  fetchUserInfo(user, null, null).then(() => {
		setTimeout(() => {
		  window.location.href = 'admin.html'; // Redirect to admin UI after 2 seconds
		}, 2000);
	  });
	}).catch((error) => {
	  console.error("Error signing in with Google: ", error);
	  alert("Error signing in with Google: " + error.message);
	});
  };

  // Function to handle email sign-up
  window.showEmailSignupForm = function() {
	document.getElementById("emailSignupForm").style.display = "block";
  };

  document.getElementById("emailSignupForm").addEventListener("submit", function(event) {
	event.preventDefault();
	var email = document.getElementById("email").value;
	var password = document.getElementById("password").value;
	var firstName = document.getElementById("firstName").value;
	var lastName = document.getElementById("lastName").value;

	// Create user in Firebase Authentication
	firebase.auth().createUserWithEmailAndPassword(email, password)
	  .then((userCredential) => {
		var user = userCredential.user;
		console.log("User signed up: ", user);

		// Send email verification
		user.sendEmailVerification().catch((error) => {
		  console.error('Error sending verification email:', error);
		});

		// Fetch user information with firstName and lastName
		fetchUserInfo(user, firstName, lastName).then(() => {
		  setTimeout(() => {
			window.location.href = 'admin.html'; // Redirect to admin UI after 2 seconds
		  }, 2000);
		});
	  })
	  .catch((error) => {
		console.error('Error signing up with email:', error);
		alert('Failed to sign up: ' + error.message);
	  });
  });
