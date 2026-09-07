const STORAGE_KEY = "alizeti_data_v01";

const DAYS = ["L", "M", "M", "J", "V", "S", "D"];

let data = loadData();

let selectedCalendarHabit = null;

let calendarDate = new Date();


function createInitialData() {
  return {
    name: "",
    habits: [],
    reflections: []
  };
}


function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return createInitialData();
  }

  try {
    return JSON.parse(saved);
  } catch {
    return createInitialData();
  }
}


function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}


function getTodayKey() {
  const date = new Date();

  return formatDate(date);
}


function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function getMonday(date = new Date()) {
  const d = new Date(date);

  const day = d.getDay();

  const difference = day === 0 ? -6 : 1 - day;

  d.setDate(d.getDate() + difference);

  d.setHours(0, 0, 0, 0);

  return d;
}


function getWeekDates() {
  const monday = getMonday();

  return DAYS.map((_, index) => {
    const date = new Date(monday);

    date.setDate(monday.getDate() + index);

    return date;
  });
}


function getDayIndex(date) {
  const day = date.getDay();

  return day === 0 ? 6 : day - 1;
}


/* -----------------------------
   GREETING
----------------------------- */

function renderGreeting() {
  const hour = new Date().getHours();

  let greeting = "Bonjour";

  if (hour >= 18) {
    greeting = "Bonsoir";
  } else if (hour >= 12) {
    greeting = "Bon après-midi";
  }

  const name = data.name ? `, ${data.name}` : "";

  document.getElementById("greeting").textContent =
    `${greeting}${name} 👋`;

  const date = new Date();

  const label = date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  document.getElementById("todayLabel").textContent =
    label;
}


/* -----------------------------
   HABITS
----------------------------- */

function renderHabits() {
  const container = document.getElementById("habitsList");

  container.innerHTML = "";

  document.getElementById("habitCount").textContent =
    `${data.habits.length} / 10`;

  document.getElementById("settingsHabitCount").textContent =
    `${data.habits.length} / 10`;

  if (data.habits.length === 0) {

    const empty = document.createElement("div");

    empty.className = "empty-state";

    empty.innerHTML = `
      <div style="
        text-align:center;
        padding:35px 20px;
        color:#718096;
        font-size:13px;
      ">
        <div style="
          font-size:35px;
          margin-bottom:10px;
          color:#2563eb;
        ">○</div>

        <strong style="
          display:block;
          color:#172033;
          margin-bottom:5px;
        ">
          Aucune habitude pour l'instant
        </strong>

        Commence doucement, avec quelque chose qui compte pour toi.
      </div>
    `;

    container.appendChild(empty);

    renderWeeklyProgress();

    return;
  }


  data.habits.forEach(habit => {

    const card = document.createElement("div");

    card.className = "habit-card";

    const top = document.createElement("div");

    top.className = "habit-top";

    top.innerHTML = `
      <div>
        <div class="habit-name">${escapeHTML(habit.name)}</div>
        <div class="habit-frequency">
          ${habit.frequency} jour${habit.frequency > 1 ? "s" : ""} / semaine
        </div>
      </div>
    `;


    const actions = document.createElement("div");

    actions.className = "habit-actions";

    const editButton = document.createElement("button");

    editButton.className = "text-button";

    editButton.textContent = "Modifier";

    editButton.onclick = () => editHabit(habit.id);

    actions.appendChild(editButton);

    top.appendChild(actions);


    const daysContainer = document.createElement("div");

    daysContainer.className = "habit-days";


    getWeekDates().forEach((date, index) => {

      const key = formatDate(date);

      const button = document.createElement("button");

      button.className = "day-dot";

      button.textContent = DAYS[index];

      if (habit.completed?.includes(key)) {
        button.classList.add("done");
      }

      if (key === getTodayKey()) {
        button.classList.add("today");
      }

      button.title = date.toLocaleDateString("fr-FR");

      button.onclick = () => toggleHabit(habit.id, key);

      daysContainer.appendChild(button);

    });


    card.appendChild(top);

    card.appendChild(daysContainer);

    container.appendChild(card);

  });


  renderWeeklyProgress();
}


function toggleHabit(habitId, dateKey) {

  const habit = data.habits.find(h => h.id === habitId);

  if (!habit) return;

  if (!habit.completed) {
    habit.completed = [];
  }

  const index = habit.completed.indexOf(dateKey);

  if (index >= 0) {
    habit.completed.splice(index, 1);
  } else {
    habit.completed.push(dateKey);
  }

  saveData();

  renderHabits();

  renderCalendar();
}


function renderWeeklyProgress() {

  let target = 0;
  let completed = 0;

  const weekDates = getWeekDates();

  data.habits.forEach(habit => {

    target += habit.frequency;

    const count = weekDates.filter(date =>
      habit.completed?.includes(formatDate(date))
    ).length;

    completed += Math.min(count, habit.frequency);

  });


  const percentage =
    target === 0
      ? 0
      : Math.round((completed / target) * 100);


  document.getElementById("weekProgressText").textContent =
    `${completed} / ${target}`;

  document.getElementById("weekProgressPercent").textContent =
    `${percentage}%`;

  document.getElementById("weekProgressBar").style.width =
    `${percentage}%`;
}


/* -----------------------------
   ADD / EDIT HABIT
----------------------------- */

let editingHabitId = null;

function openHabitModal(habit = null) {

  const modal = document.getElementById("habitModal");

  modal.classList.remove("hidden");

  editingHabitId = habit?.id || null;

  document.getElementById("habitModalTitle").textContent =
    habit ? "Modifier l'habitude" : "Créer une habitude";

  document.getElementById("habitName").value =
    habit?.name || "";

  const frequency = habit?.frequency || 7;

  document.querySelectorAll("#frequencySelector button")
    .forEach(button => {
      button.classList.toggle(
        "selected",
        Number(button.dataset.days) === frequency
      );
    });

  document.getElementById("saveHabitButton").textContent =
    habit ? "Enregistrer" : "Ajouter";
}


function closeHabitModal() {

  document
    .getElementById("habitModal")
    .classList.add("hidden");

  editingHabitId = null;
}


function saveHabitFromModal() {

  const name =
    document.getElementById("habitName").value.trim();

  if (!name) {
    alert("Donne un nom à ton habitude.");
    return;
  }

  const selected =
    document.querySelector("#frequencySelector button.selected");

  const frequency =
    Number(selected?.dataset.days || 7);


  if (editingHabitId) {

    const habit =
      data.habits.find(h => h.id === editingHabitId);

    if (habit) {
      habit.name = name;
      habit.frequency = frequency;
    }

  } else {

    if (data.habits.length >= 10) {
      alert("Tu as atteint la limite de 10 habitudes.");
      return;
    }

    data.habits.push({
      id: crypto.randomUUID(),
      name,
      frequency,
      completed: []
    });

  }


  saveData();

  renderHabits();

  closeHabitModal();
}


function editHabit(id) {

  const habit =
    data.habits.find(h => h.id === id);

  if (!habit) return;

  openHabitModal(habit);
}


/* -----------------------------
   CALENDAR
----------------------------- */

function renderCalendarHabitSelector() {

  const container =
    document.getElementById("calendarHabitSelector");

  container.innerHTML = "";

  data.habits.forEach((habit, index) => {

    const button = document.createElement("button");

    button.textContent = habit.name;

    if (
      selectedCalendarHabit === habit.id ||
      (!selectedCalendarHabit && index === 0)
    ) {
      button.classList.add("active");
    }

    button.onclick = () => {

      selectedCalendarHabit = habit.id;

      renderCalendarHabitSelector();

      renderCalendar();

    };

    container.appendChild(button);

  });

  if (!selectedCalendarHabit && data.habits.length) {
    selectedCalendarHabit = data.habits[0].id;
  }
}


function renderCalendar() {

  const grid =
    document.getElementById("calendarGrid");

  const title =
    document.getElementById("calendarMonth");

  grid.innerHTML = "";

  const year = calendarDate.getFullYear();

  const month = calendarDate.getMonth();

  title.textContent =
    calendarDate.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric"
    });


  const firstDay =
    new Date(year, month, 1);

  const daysInMonth =
    new Date(year, month + 1, 0).getDate();

  let startingDay =
    getDayIndex(firstDay);


  for (let i = 0; i < startingDay; i++) {

    const empty =
      document.createElement("div");

    empty.className =
      "calendar-day empty";

    grid.appendChild(empty);

  }


  const habit =
    data.habits.find(h => h.id === selectedCalendarHabit);


  for (let day = 1; day <= daysInMonth; day++) {

    const date =
      new Date(year, month, day);

    const key =
      formatDate(date);

    const cell =
      document.createElement("div");

    cell.className = "calendar-day";

    cell.textContent = day;


    if (
      habit?.completed?.includes(key)
    ) {
      cell.classList.add("done");
    }


    if (
      key === getTodayKey()
    ) {
      cell.classList.add("today");
    }


    grid.appendChild(cell);

  }

}


function changeMonth(amount) {

  calendarDate =
    new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth() + amount,
      1
    );

  renderCalendar();
}


/* -----------------------------
   REFLECTION
----------------------------- */

function setupReflectionChoices() {

  document
    .querySelectorAll("#reflectionChoices button")
    .forEach(button => {

      button.onclick = () => {

        button.classList.toggle("selected");

      };

    });

}


function saveReflection() {

  const selected =
    [...document.querySelectorAll(
      "#reflectionChoices button.selected"
    )]
      .map(button => button.dataset.choice);

  const notes =
    document
      .getElementById("reflectionNotes")
      .value
      .trim();


  if (selected.length === 0 && !notes) {
    alert("Tu peux simplement fermer cette page si tu ne souhaites rien noter.");
    return;
  }


  data.reflections.unshift({

    id: crypto.randomUUID(),

    date: formatDate(new Date()),

    choices: selected,

    notes

  });


  saveData();

  document
    .querySelectorAll("#reflectionChoices button")
    .forEach(button =>
      button.classList.remove("selected")
    );

  document.getElementById("reflectionNotes").value = "";

  renderReflectionHistory();

}


function renderReflectionHistory() {

  const container =
    document.getElementById("reflectionHistory");

  container.innerHTML = "";


  if (!data.reflections.length) {

    container.innerHTML = `
      <p style="
        color:#718096;
        font-size:12px;
        text-align:center;
        padding:20px;
      ">
        Ton journal est encore vide.
      </p>
    `;

    return;
  }


  data.reflections.forEach(entry => {

    const div =
      document.createElement("div");

    div.className =
      "reflection-entry";


    const date =
      new Date(entry.date);

    const formatted =
      date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });


    div.innerHTML = `

      <div class="reflection-entry-date">
        ${formatted}
      </div>

      ${
        entry.choices.length
          ? `<p>${entry.choices.map(escapeHTML).join(" · ")}</p>`
          : ""
      }

      ${
        entry.notes
          ? `<p>${escapeHTML(entry.notes)}</p>`
          : ""
      }

    `;


    container.appendChild(div);

  });

}


/* -----------------------------
   NAVIGATION
----------------------------- */

function navigateTo(pageId) {

  document
    .querySelectorAll(".page")
    .forEach(page =>
      page.classList.remove("active")
    );


  const page =
    document.getElementById(pageId);

  if (page) {
    page.classList.add("active");
  }


  document
    .querySelectorAll(".nav-item")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.page === pageId
      );

    });


  if (pageId === "calendarPage") {

    renderCalendarHabitSelector();

    renderCalendar();

  }

  if (pageId === "reflectionPage") {
    renderReflectionHistory();
  }

}


/* -----------------------------
   SETTINGS
----------------------------- */

function updateSettings() {

  document.getElementById("currentName").textContent =
    data.name || "Non renseigné";

}


function changeName() {

  const name =
    prompt(
      "Comment veux-tu être appelé(e) dans Alizeti ?",
      data.name || ""
    );

  if (name === null) return;

  data.name = name.trim();

  saveData();

  renderGreeting();

  updateSettings();

}


function resetData() {

  const confirmed =
    confirm(
      "Toutes tes habitudes et tes notes seront supprimées. Continuer ?"
    );

  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);

  data = createInitialData();

  renderAll();

}


/* -----------------------------
   UTILS
----------------------------- */

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* -----------------------------
   INITIALISATION
----------------------------- */

function renderAll() {

  renderGreeting();

  renderHabits();

  renderCalendarHabitSelector();

  renderCalendar();

  renderReflectionHistory();

  updateSettings();

}


document
  .querySelectorAll(".nav-item")
  .forEach(button => {

    button.onclick = () =>
      navigateTo(button.dataset.page);

  });


document
  .getElementById("settingsButton")
  .onclick = () =>
    navigateTo("settingsPage");


document
  .getElementById("addHabitButton")
  .onclick = () =>
    openHabitModal();


document
  .getElementById("closeHabitModal")
  .onclick = () =>
    closeHabitModal();


document
  .querySelector(".modal-overlay")
  .onclick = () =>
    closeHabitModal();


document
  .getElementById("saveHabitButton")
  .onclick = () =>
    saveHabitFromModal();


document
  .querySelectorAll("#frequencySelector button")
  .forEach(button => {

    button.onclick = () => {

      document
        .querySelectorAll("#frequencySelector button")
        .forEach(item =>
          item.classList.remove("selected")
        );

      button.classList.add("selected");

    };

  });


document
  .getElementById("previousMonth")
  .onclick = () =>
    changeMonth(-1);


document
  .getElementById("nextMonth")
  .onclick = () =>
    changeMonth(1);


document
  .getElementById("saveReflection")
  .onclick = () =>
    saveReflection();


document
  .getElementById("changeNameButton")
  .onclick = () =>
    changeName();


document
  .getElementById("resetButton")
  .onclick = () =>
    resetData();


setupReflectionChoices();

renderAll();
