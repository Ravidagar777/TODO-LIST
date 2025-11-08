const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const clearAll = document.getElementById("clearAll");
const themeToggle = document.getElementById("themeToggle");
const prioritySelect = document.getElementById("prioritySelect");
const timeInput = document.getElementById("timeInput");

let todos = JSON.parse(localStorage.getItem("todos")) || [];
let isDark = JSON.parse(localStorage.getItem("darkMode")) || false;

if (isDark) document.body.classList.add("dark");
updateThemeIcon();
renderTasks();

// Ask for notification permission
if ("Notification" in window) {
  Notification.requestPermission().then(permission => {
    if (permission !== "granted") {
      alert("Please allow notifications to get reminders!");
    }
  });
}

// Add task
addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", e => e.key === "Enter" && addTask());
themeToggle.addEventListener("click", toggleTheme);
clearAll.addEventListener("click", () => {
  if (confirm("Delete all tasks?")) {
    todos = [];
    saveAndRender();
  }
});

function addTask() {
  const text = taskInput.value.trim();
  const time = timeInput.value;
  if (!text) return alert("Please enter a task!");

  const task = {
    id: Date.now(),
    text,
    completed: false,
    priority: prioritySelect.value,
    due: time || null,
  };

  todos.push(task);
  taskInput.value = "";
  timeInput.value = "";
  saveAndRender();
  setReminder(task);
}

// Render tasks
function renderTasks() {
  taskList.innerHTML = "";
  todos.forEach(task => {
    const li = document.createElement("li");
    li.className = `${task.priority} ${task.completed ? "completed" : ""}`;

    const span = document.createElement("span");
    span.textContent = task.text;
    span.addEventListener("click", () => toggleComplete(task.id));

    const time = document.createElement("div");
    time.className = "time-info";
    if (task.due) time.textContent = "⏰ " + new Date(task.due).toLocaleString();

    const delBtn = document.createElement("button");
    delBtn.textContent = "✕";
    delBtn.addEventListener("click", () => deleteTask(task.id));

    li.append(span, time, delBtn);
    taskList.appendChild(li);

    // Set reminders again when reloading
    setReminder(task);
  });
  taskCount.textContent = `${todos.length} task${todos.length !== 1 ? "s" : ""}`;
}

// Toggle complete
function toggleComplete(id) {
  todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  saveAndRender();
}

// Delete task
function deleteTask(id) {
  todos = todos.filter(t => t.id !== id);
  saveAndRender();
}

// Save & Render
function saveAndRender() {
  localStorage.setItem("todos", JSON.stringify(todos));
  renderTasks();
}

// Set reminder using browser Notification API
function setReminder(task) {
  if (!task.due || task.completed) return;
  const dueTime = new Date(task.due).getTime();
  const now = Date.now();
  const delay = dueTime - now;

  if (delay > 0 && "Notification" in window && Notification.permission === "granted") {
    setTimeout(() => {
      const updated = todos.find(t => t.id === task.id && !t.completed);
      if (updated) {
        new Notification("⏰ Task Reminder", {
          body: `Your task "${task.text}" is due now!`,
          icon: "https://cdn-icons-png.flaticon.com/512/1827/1827392.png"
        });
      }
    }, delay);
  }
}

// Theme toggle
function toggleTheme() {
  document.body.classList.toggle("dark");
  isDark = document.body.classList.contains("dark");
  localStorage.setItem("darkMode", JSON.stringify(isDark));
  updateThemeIcon();
}

function updateThemeIcon() {
  themeToggle.textContent = isDark ? "☀️" : "🌙";
}
