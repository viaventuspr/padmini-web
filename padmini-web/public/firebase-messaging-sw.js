importScripts('https://www.gstatic.com/firebasejs/10.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.10.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCpBIS5YKGiZ9vgfONLTG6sj7gfHWLqO4g",
  authDomain: "class-grade5.firebaseapp.com",
  projectId: "class-grade5",
  storageBucket: "class-grade5.firebasestorage.app",
  messagingSenderId: "225731208340",
  appId: "1:225731208340:web:c1e0d35158037e91680081"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || 'පද්මිනී පන්තිය';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/pwa-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
