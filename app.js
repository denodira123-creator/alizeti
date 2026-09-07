/* =========================================================
   ALIZETI V0.1
   ========================================================= */


const STORAGE_KEY = "alizeti_v01";


/* ---------------------------------------------------------
   DONNEES
   --------------------------------------------------------- */

let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  habits: [],
  dailyJournal: {},
  weeklyJournals: {},
  notifications: false
};


function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}


/* ---------------------------------------------------------
   ELEMENTS
   --------------------------------------------------------- */

const pages = document.querySelectorAll(".page");
const navItems = document.querySelectorAll(".nav-item");

const settingsBtn = document.getElementById("settingsBtn");

const addHabitBtn = document.getElementById("addHabitBtn");
const habitModal = document.getElementById("habitModal");
const closeModal = document.getElementById("closeModal");

const habitName = document.getElementById("habitName");
const habitGoal = document.getElementById("habitGoal");
const saveHabitBtn = document.getElementById("saveHabit");

const habitsList = document.getElementById("habitsList");

const weekDates = document.getElementById("weekDates");

const celebration = document.getElementById("celebration");

const monthlyRecap = document.getElementById("monthlyRecap");

const calendarTitle = document.getElementById("calendarTitle");
const calendarGrid = document.getElementById("calendarGrid");

const dailyJournal = document.getElementById("dailyJournal");
const saveDaily = document.getElementById("saveDaily");

const weeklyJournalCard = document.getElementById("weeklyJournalCard");
const weeklyAvailability = document.getElementById("weeklyAvailability");
const weeklyContent = document.getElementById("weeklyContent");

const weeklyPositive = document.getElementById("weeklyPositive");
const weeklyNegative = document.getElementById("weeklyNegative");
const positive1 = document.getElementById("positive1");
const positive2 = document.getElementById("positive2");
const positive3 = document.getElementById("positive3");
const weeklyText = document.getElementById("weeklyText");
const saveWeekly = document.getElementById("saveWeekly");

const notificationToggle =
  document.getElementById("notificationToggle");


/* ---------------------------------------------------------
   DATES
   --------------------------------------------------------- */

const dayNames = [
  "L",
  "M",
  "M",
  "J",
  "V",
  "S",
  "D"
];


const monthNames = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre"
];


let calendarDate = new Date();


function dateKey(date) {

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function getMonday(date = new Date()) {

  const d = new Date(date);
  const day = d.getDay();

  const diff = day === 0 ? -6 : 1 - day;

  d.setDate(d.getDate() + diff);

  d.setHours(0, 0, 0, 0);

  return d;
}


function getSunday(date = new Date()) {

  const monday = getMonday(date);

  const sunday = new Date(monday);

  sunday.setDate(monday.getDate() + 6);

  return sunday;
}


function formatShortDate(date) {

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short"
  });
}


/* ---------------------------------------------------------
   NAVIGATION
   --------------------------------------------------------- */

function showPage(pageId) {

  pages.forEach(page => {
    page.classList.toggle("active", page.id === pageId);
  });

  navItems.forEach(item => {
    item.classList.toggle(
      "active",
      item.dataset.page === pageId
    );
  });

  if (pageId === "calendarPage") {
    renderCalendar();
  }

  if (pageId === "journalPage") {
    loadJournals();
    updateWeeklyJournalAvailability();
  }
}


navItems.forEach(item => {

  item.addEventListener("click", () => {
    showPage(item.dataset.page);
  });

});


settingsBtn.addEventListener("click", () => {
  showPage("settingsPage");
});


/* ---------------------------------------------------------
   MODAL HABITUDE
   --------------------------------------------------------- */

addHabitBtn.addEventListener("click", () => {

  if (data.habits.length >= 10) {
    alert("Tu peux avoir jusqu'à 10 habitudes.");
    return;
  }

  habitName.value = "";
  habitGoal.value = "3";

  habitModal.classList.remove("hidden");

  setTimeout(() => {
    habitName.focus();
  }, 100);

});


closeModal.addEventListener("click", () => {
  habitModal.classList.add("hidden");
});


habitModal.addEventListener("click", event => {

  if (event.target === habitModal) {
    habitModal.classList.add("hidden");
  }

});


saveHabitBtn.addEventListener("click", () => {

  const name = habitName.value.trim();

  if (!name) {
    habitName.focus();
    return;
  }

  const habit = {
    id: Date.now(),
    name,
    goal: Number(habitGoal.value),
    completed: {}
  };

  data.habits.push(habit);

  saveData();

  habitModal.classList.add("hidden");

  renderHabits();
  renderMonthlyRecap();

});


/* ---------------------------------------------------------
   HABITUDES
   --------------------------------------------------------- */

function getWeekDays() {

  const monday = getMonday();

  const days = [];

  for (let i = 0; i < 7; i++) {

    const day = new Date(monday);

    day.setDate(monday.getDate() + i);

    days.push(day);

  }

  return days;
}


function countWeekCompleted(habit) {

  const days = getWeekDays();

  return days.filter(day => {
    return habit.completed[dateKey(day)];
  }).length;
}


function renderHabits() {

  habitsList.innerHTML = "";

  if (data.habits.length === 0) {

    habitsList.innerHTML = `
      <div class="month-card">
        <div class="monthly-recap">
          Tu n'as pas encore ajouté d'habitude.
          <br><br>
          Commence doucement, avec quelque chose
          que tu aimerais simplement essayer de faire
          régulièrement.
        </div>
      </div>
    `;

    celebration.classList.add("hidden");

    return;
  }


  const days = getWeekDays();


  data.habits.forEach(habit => {

    const completedCount = countWeekCompleted(habit);

    const goalReached = completedCount >= habit.goal;

    const card = document.createElement("div");

    card.className =
      "habit-card" +
      (goalReached ? " completed-goal" : "");


    const daysHTML = days.map((day, index) => {

      const key = dateKey(day);
      const checked = Boolean(habit.completed[key]);

      const today =
        key === dateKey(new Date());

      return `
        <div class="day">

          <button
            class="day-circle
              ${checked ? "checked" : ""}
              ${today ? "today" : ""}
            "
            data-habit="${habit.id}"
            data-date="${key}"
            aria-label="${dayNames[index]}"
          >
            ${checked ? "✓" : ""}
          </button>

          <span>${dayNames[index]}</span>

        </div>
      `;

    }).join("");


    card.innerHTML = `

      <div class="habit-top">

        <div>

          <div class="habit-name">
            ${escapeHTML(habit.name)}
          </div>

          <div class="habit-progress">
            <strong>${completedCount}/${habit.goal}</strong>
            jours cette semaine
          </div>

        </div>

        <button
          class="delete-habit"
          data-delete="${habit.id}"
          aria-label="Supprimer"
        >
          ×
        </button>

      </div>


      <div class="days">
        ${daysHTML}
      </div>


      <div class="goal-badge ${goalReached ? "done" : ""}">

        ${
          goalReached
            ? "✓ Objectif de la semaine atteint"
            : `${habit.goal - completedCount} jour${
                habit.goal - completedCount > 1 ? "s" : ""
              } restant${
                habit.goal - completedCount > 1 ? "s" : ""
              }`
        }

      </div>
    `;


    habitsList.appendChild(card);

  });


  attachHabitEvents();

  updateCelebration();

}


function attachHabitEvents() {

  document.querySelectorAll(".day-circle").forEach(button => {

    button.addEventListener("click", () => {

      const habitId = Number(button.dataset.habit);
      const date = button.dataset.date;

      const habit =
        data.habits.find(h => h.id === habitId);

      if (!habit) return;


      habit.completed[date] =
        !habit.completed[date];


      saveData();

      renderHabits();
      renderCalendar();
      renderMonthlyRecap();

    });

  });


  document.querySelectorAll(".delete-habit").forEach(button => {

    button.addEventListener("click", () => {

      const id = Number(button.dataset.delete);

      const confirmed =
        confirm("Supprimer cette habitude ?");

      if (!confirmed) return;

      data.habits =
        data.habits.filter(h => h.id !== id);

      saveData();

      renderHabits();
      renderMonthlyRecap();

    });

  });

}


/* ---------------------------------------------------------
   CELEBRATION
   --------------------------------------------------------- */

function updateCelebration() {

  let surpassed = false;

  data.habits.forEach(habit => {

    const completed = countWeekCompleted(habit);

    if (completed > habit.goal) {
      surpassed = true;
    }

  });


  celebration.classList.toggle(
    "hidden",
    !surpassed
  );

}


/* ---------------------------------------------------------
   RECAPITULATIF MENSUEL
   --------------------------------------------------------- */

function renderMonthlyRecap() {

  if (data.habits.length === 0) {

    monthlyRecap.textContent =
      "Ajoute une habitude pour commencer ton suivi.";

    return;
  }


  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth();

  const daysInMonth =
    new Date(year, month + 1, 0).getDate();


  const habit = data.habits[0];

  let completed = 0;

  for (let day = 1; day <= daysInMonth; day++) {

    const date =
      new Date(year, month, day);

    if (habit.completed[dateKey(date)]) {
      completed++;
    }

  }


  /*
    On estime le nombre de jours fixés
    à partir de l'objectif hebdomadaire.

    Exemple :
    objectif 3 jours/semaine
    => environ 3/7 du mois.
  */

  const weeksEquivalent =
    daysInMonth / 7;

  const monthlyGoal =
    Math.round(habit.goal * weeksEquivalent);


  monthlyRecap.innerHTML = `
    Ce mois-ci, tu as réussi à
    <strong>${escapeHTML(habit.name)}</strong>
    <strong>${completed} jour${completed > 1 ? "s" : ""}</strong>
    sur environ
    <strong>${monthlyGoal} fixé${
      monthlyGoal > 1 ? "s" : ""
    }</strong>.
  `;

}


/* ---------------------------------------------------------
   CALENDRIER
   --------------------------------------------------------- */

function renderCalendar() {

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  calendarTitle.textContent =
    `${monthNames[month]} ${year}`;


  calendarGrid.innerHTML = "";


  const firstDay =
    new Date(year, month, 1);

  let startingDay =
    firstDay.getDay();

  /*
    JavaScript :
    dimanche = 0
    lundi = 1

    Notre calendrier commence lundi.
  */

  startingDay =
    startingDay === 0
      ? 6
      : startingDay - 1;


  const daysInMonth =
    new Date(year, month + 1, 0).getDate();


  for (let i = 0; i < startingDay; i++) {

    const empty = document.createElement("div");

    empty.className =
      "calendar-day empty";

    calendarGrid.appendChild(empty);

  }


  for (let day = 1; day <= daysInMonth; day++) {

    const date =
      new Date(year, month, day);

    const key =
      dateKey(date);


    const hasHabit =
      data.habits.some(habit =>
        habit.completed[key]
      );


    const isToday =
      key === dateKey(new Date());


    const cell =
      document.createElement("div");


    cell.className =
      "calendar-day" +
      (hasHabit ? " has-habit" : "") +
      (isToday ? " today" : "");


    cell.textContent = day;


    calendarGrid.appendChild(cell);

  }

}


document.getElementById("prevMonth")
  .addEventListener("click", () => {

    calendarDate.setMonth(
      calendarDate.getMonth() - 1
    );

    renderCalendar();

  });


document.getElementById("nextMonth")
  .addEventListener("click", () => {

    calendarDate.setMonth(
      calendarDate.getMonth() + 1
    );

    renderCalendar();

  });


/* ---------------------------------------------------------
   JOURNAL QUOTIDIEN
   --------------------------------------------------------- */

function loadJournals() {

  const today = dateKey(new Date());

  dailyJournal.value =
    data.dailyJournal[today] || "";


  const weekKey =
    getWeekKey();

  const journal =
    data.weeklyJournals[weekKey];


  if (!journal) {

    weeklyPositive.value = "";
    weeklyNegative.value = "";

    positive1.value = "";
    positive2.value = "";
    positive3.value = "";

    weeklyText.value = "";

    return;
  }


  weeklyPositive.value =
    journal.positive || "";

  weeklyNegative.value =
    journal.negative || "";

  positive1.value =
    journal.positive1 || "";

  positive2.value =
    journal.positive2 || "";

  positive3.value =
    journal.positive3 || "";

  weeklyText.value =
    journal.text || "";

}


saveDaily.addEventListener("click", () => {

  const today = dateKey(new Date());

  data.dailyJournal[today] =
    dailyJournal.value;

  saveData();

  saveDaily.textContent =
    "Enregistré ✓";

  setTimeout(() => {

    saveDaily.textContent =
      "Enregistrer";

  }, 1500);

});


/* ---------------------------------------------------------
   JOURNAL HEBDOMADAIRE
   --------------------------------------------------------- */

function getWeekKey() {

  return dateKey(getMonday());

}


function isWeeklyJournalAvailable() {

  const now = new Date();

  const day = now.getDay();

  const hour = now.getHours();

  /*
    Dimanche à partir de 19h
    OU
    Lundi jusqu'à 23h59.
  */

  if (day === 0 && hour >= 19) {
    return true;
  }

  if (day === 1) {
    return true;
  }

  return false;

}


function updateWeeklyJournalAvailability() {

  const available =
    isWeeklyJournalAvailable();


  if (available) {

    weeklyContent.classList.remove("hidden");

    weeklyJournalCard.classList.remove("locked");

    weeklyAvailability.textContent =
      "Ton bilan de la semaine est ouvert.";

  } else {

    weeklyContent.classList.add("hidden");

    weeklyJournalCard.classList.add("locked");

    weeklyAvailability.textContent =
      "Le bilan de la semaine s'ouvre le dimanche à 19h et reste disponible jusqu'au lundi soir.";

  }

}


saveWeekly.addEventListener("click", () => {

  if (!isWeeklyJournalAvailable()) {
    return;
  }


  /*
    Les trois choses positives
    sont obligatoires.
  */

  if (
    !positive1.value.trim() ||
    !positive2.value.trim() ||
    !positive3.value.trim()
  ) {

    alert(
      "Prends simplement un moment pour noter tes 3 choses positives de la semaine."
    );

    return;
  }


  const key = getWeekKey();


  data.weeklyJournals[key] = {

    positive: weeklyPositive.value,

    negative: weeklyNegative.value,

    positive1: positive1.value,

    positive2: positive2.value,

    positive3: positive3.value,

    text: weeklyText.value

  };


  saveData();


  saveWeekly.textContent =
    "Bilan enregistré ✓";


  setTimeout(() => {

    saveWeekly.textContent =
      "Enregistrer mon bilan";

  }, 1800);

});


/* ---------------------------------------------------------
   NOTIFICATIONS
   --------------------------------------------------------- */

notificationToggle.addEventListener("click", async () => {

  data.notifications =
    !data.notifications;


  if (
    data.notifications &&
    "Notification" in window
  ) {

    try {

      const permission =
        await Notification.requestPermission();

      if (permission !== "granted") {

        data.notifications = false;

      }

    } catch (error) {

      data.notifications = false;

    }

  }


  saveData();

  updateNotificationToggle();

});


function updateNotificationToggle() {

  notificationToggle.classList.toggle(
    "on",
    data.notifications
  );

}


 /* ---------------------------------------------------------
    SECURITE HTML
    --------------------------------------------------------- */

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* ---------------------------------------------------------
   INITIALISATION
   --------------------------------------------------------- */

function initialize() {

  const monday = getMonday();
  const sunday = getSunday();

  weekDates.textContent =
    `${formatShortDate(monday)} — ${formatShortDate(sunday)}`;


  renderHabits();

  renderCalendar();

  renderMonthlyRecap();

  updateNotificationToggle();

  updateWeeklyJournalAvailability();

  loadJournals();

}


initialize();
