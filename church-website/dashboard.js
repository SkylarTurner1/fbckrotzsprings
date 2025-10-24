import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, doc, setDoc, collection, addDoc, onSnapshot, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

// Firebase init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Redirect if not logged in
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "admin.html";
  else document.getElementById("welcome").innerText = `Logged in as: ${user.email}`;
});

// --- Message of the Day ---
const saveBtn = document.getElementById("saveMessage");
saveBtn.addEventListener("click", async () => {
  const message = document.getElementById("messageInput").value;
  if (!message) return;
  await setDoc(doc(db, "dailyMessage", "message"), { message, time: Date.now() });
  document.getElementById("saveStatus").innerText = "Message saved!";
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
    .sort((a,b) => a.data().timestamp - b.data().timestamp)
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

