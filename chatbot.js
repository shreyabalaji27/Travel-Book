const toggleBtn = document.getElementById("chatbot-toggle");
const chatWindow = document.getElementById("chatbot-window");
const closeBtn = document.getElementById("chatbot-close");
const messages = document.getElementById("chatbot-messages");
const input = document.getElementById("chatbot-input");
const sendBtn = document.getElementById("chatbot-send");
const quickBtns = document.querySelectorAll("#chatbot-quick button");

toggleBtn.addEventListener("click", () => chatWindow.classList.toggle("hidden"));
closeBtn.addEventListener("click", () => chatWindow.classList.add("hidden"));

function sendMessage(text, sender="user") {
  const msg = document.createElement("div");
  msg.className = `msg ${sender}`;
  msg.textContent = text;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
}

function showTyping() {
  const typing = document.createElement("div");
  typing.className = "msg bot typing";
  typing.innerHTML = "<span></span><span></span><span></span>";
  messages.appendChild(typing);
  messages.scrollTop = messages.scrollHeight;
}

function removeTyping() {
  const typing = document.querySelector(".typing");
  if (typing) typing.remove();
}

// Enhanced bot replies for travel booking
function botReply(userText) {
  let reply = "🤖 I'm TravelBot! I can help you with flight, train, and cab bookings. What do you need?";

  const text = userText.toLowerCase();
  
  if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
    reply = "👋 Hello! Welcome to TravelBook! How can I assist you with your travel plans today?";
  } else if (text.includes("flight") || text.includes("fly") || text.includes("airplane")) {
    reply = "✈️ I can help you book flights! Visit our Flights page to search for domestic and international flights from 500+ airlines.";
  } else if (text.includes("train") || text.includes("railway") || text.includes("irctc")) {
    reply = "🚆 I can assist with train bookings! Check our Trains page for real-time availability across India with all classes available.";
  } else if (text.includes("cab") || text.includes("taxi") || text.includes("car")) {
    reply = "🚗 Need a cab? Visit our Cabs page to book local and outstation cabs with multiple vehicle options and rated drivers.";
  } else if (text.includes("book") || text.includes("reservation")) {
    reply = "📖 You can book flights, trains, and cabs directly on our website. Which service are you interested in?";
  } else if (text.includes("price") || text.includes("cost") || text.includes("rate")) {
    reply = "💰 Prices vary based on service, distance, and timing. Check our booking pages for real-time pricing information.";
  } else if (text.includes("help") || text.includes("support") || text.includes("problem")) {
    reply = "❓ Our support team is available 24/7. Contact us at support@travelbook.com or call +91 98765 43210";
  } else if (text.includes("cancel") || text.includes("refund")) {
    reply = "📄 Check our Cancellation Policy page for details. Most bookings can be cancelled online with refunds processed within 7-10 days.";
  } else if (text.includes("thank") || text.includes("thanks")) {
    reply = "😊 You're welcome! Happy to help with your travel needs. Safe travels!";
  }

  sendMessage(reply, "bot");
}

// Handle input
function handleSend() {
  const text = input.value.trim();
  if (!text) return;
  sendMessage(text, "user");
  input.value = "";

  showTyping();
  setTimeout(() => { removeTyping(); botReply(text); }, 1000);
}

sendBtn.addEventListener("click", handleSend);
input.addEventListener("keypress", (e) => { if (e.key === "Enter") handleSend(); });

quickBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const text = btn.dataset.msg;
    sendMessage(text, "user");
    showTyping();
    setTimeout(() => { removeTyping(); botReply(text); }, 1000);
  });
});

// Auto welcome message
window.addEventListener('load', () => {
  setTimeout(() => {
    sendMessage("👋 Hi! I'm TravelBot. I can help you with flight, train, and cab bookings. How can I assist you?", "bot");
  }, 1000);
});