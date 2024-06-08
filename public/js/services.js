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

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log("User is signed in:", user);
        document.getElementById('user-name').innerText = `Hello, ${user.displayName || user.email}`;
        fetchServices(user.uid);
    } else {
        console.log("No user is signed in.");
        window.location.href = 'signup.html'; // Redirect to signup if not logged in
    }
});

function fetchServices(userId) {
    fetch(`https://nuvoro.net/api/services?userKey=${userId}`)
        .then(response => response.json())
        .then(data => {
            const servicesList = document.getElementById('services-list');
            servicesList.innerHTML = '';

            data.forEach(service => {
                const serviceItem = document.createElement('div');
                serviceItem.className = 'service-item';
                serviceItem.innerHTML = `
                    <h5>${service.SERVICE_NAME}</h5>
                    <p>${service.SERVICE_DESCRIPTION}</p>
                    <p>Cost: $${service.SERVICE_COST}</p>
                    <button class="btn btn-danger" onclick="deleteService('${service.SERVICE_ID}')">Delete</button>
                `;
                servicesList.appendChild(serviceItem);
            });
        })
        .catch(error => {
            console.error('Error fetching services:', error);
        });
}

// Function to delete a service
function deleteService(serviceId) {
    fetch(`https://nuvoro.net/api/delete-service/${serviceId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Service deleted successfully');
            fetchServices(firebase.auth().currentUser.uid); // Refresh the services list
        } else {
            console.error('Failed to delete service:', data.message);
        }
    })
    .catch(error => {
        console.error('Error deleting service:', error);
    });
}

document.getElementById('service-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const user = firebase.auth().currentUser;
    if (!user) {
        console.error('No user is signed in.');
        return;
    }

    const serviceName = document.getElementById('serviceName').value;
    const serviceDescription = document.getElementById('serviceDescription').value;
    const serviceCost = document.getElementById('serviceCost').value;

    const serviceData = {
        userKey: user.uid,
        serviceName: serviceName,
        serviceDescription: serviceDescription,
        serviceCost: parseFloat(serviceCost)
    };

    fetch('https://nuvoro.net/api/add-service', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(serviceData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Service added successfully');
                fetchServices(user.uid);
                document.getElementById('service-form').reset();
            } else {
                console.error('Failed to add service:', data.message);
            }
        })
        .catch(error => {
            console.error('Error adding service:', error);
        });
});

function logout() {
    firebase.auth().signOut().then(() => {
        console.log('User signed out.');
        window.location.href = 'signup.html';
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
}
