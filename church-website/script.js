import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, addDoc, onSnapshot, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

// Firebase init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Admin Login
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const dashboard = document.getElementById("dashboard");
const messageInput = document.getElementById("messageInput");
const saveMessage = document.getElementById("saveMessage");

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            loginForm.style.display = "none";
            loginError.innerText = "";
            dashboard.style.display = "block";
        })
        .catch((error) => loginError.innerText = "Login failed: " + error.message);
});

// Save Message of the Day
saveMessage.addEventListener("click", async () => {
    const msg = messageInput.value.trim();
    if (!msg) return;
    await setDoc(doc(db, "dailyMessage", "message"), { message: msg, time: Date.now() });
});

// --- Events ---
const eventsForm = document.getElementById("eventForm");
const eventsList = document.getElementById("eventsList");
const eventsRef = collection(db, "events");

eventsForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("eventTitle").value;
    const date = document.getElementById("eventDate").value;
    const rawTime = document.getElementById("eventTime").value; // 24-hour string
    const desc = document.getElementById("eventDesc").value;

    // Format time to AM/PM
    let time = "TBD";
    if (rawTime) {
        const [hourStr, minute] = rawTime.split(":");
        let hour = parseInt(hourStr);
        const ampm = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12;
        time = `${hour}:${minute} ${ampm}`;
    }

    if (!title || !date) return;

    const timestamp = new Date(`${date}T${rawTime || "00:00"}`).getTime();

    await addDoc(eventsRef, {
        title,
        date,
        time,
        description: desc,
        timestamp
    });

    eventsForm.reset();
});

// --- Display Events ---
onSnapshot(eventsRef, snapshot => {
    eventsList.innerHTML = "";
    snapshot.docs
        .sort((a, b) => a.data().timestamp - b.data().timestamp)
        .forEach(docSnap => {
            const event = docSnap.data();
            const timeDisplay = event.time ? ` @ ${event.time}` : "";
            const div = document.createElement("div");
            div.innerHTML = `<strong>${event.date}</strong>${timeDisplay}: ${event.title} <button data-id="${docSnap.id}">Delete</button>`;
            eventsList.appendChild(div);

            div.querySelector("button").addEventListener("click", async () => {
                await deleteDoc(doc(db, "events", docSnap.id));
            });
        });
});

