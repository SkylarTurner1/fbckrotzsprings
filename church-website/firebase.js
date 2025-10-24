// firebase.js — for homepage
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Message of the Day ---
const dailyMessageElement = document.getElementById("dailyMessage");
const dailyDocRef = doc(db, "dailyMessage", "message");
getDoc(dailyDocRef).then(docSnap => {
  if (docSnap.exists()) {
    dailyMessageElement.innerText = docSnap.data().message;
  } else {
    dailyMessageElement.innerText = "No message set yet.";
  }
}).catch(() => {
  dailyMessageElement.innerText = "Unable to load message.";
});

// --- Upcoming Events ---
const calendarDiv = document.getElementById("calendar");
const eventsRef = collection(db, "events");

onSnapshot(eventsRef, (snapshot) => {
  calendarDiv.innerHTML = "";

  snapshot.docs
    .sort((a,b) => (a.data().timestamp || 0) - (b.data().timestamp || 0))
    .forEach(docSnap => {
      const event = docSnap.data();
      const timeDisplay = event.time && event.time !== "TBD" ? ` @ ${event.time}` : (event.time === "TBD" ? " @ TBD" : "");
      const div = document.createElement("div");
      div.classList.add("calendarEvent");
      div.innerHTML = `<strong>${event.date}</strong>${timeDisplay}: ${event.title}${event.description ? " - " + event.description : ""}`;
      calendarDiv.appendChild(div);
    });
});
