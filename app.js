const STORAGE_KEY = "alizeti_v02";

let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  habits: [],
  dailyJournal: {},
  weeklyJournals: {},
  notifications: false,
  userName: "",
  duo: null
};


function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}


/* =========================================================
   ELEMENTS
   ========================================================= */

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
const welcomeName = document.getElementById("welcomeName");

const calendarTitle = document.getElementById("calendarTitle");
const calendarGrid = document.getElementById("calendarGrid");

const dailyJournal = document.getElementById("dailyJournal");
const saveDaily = document.getElementById("saveDaily");

const weeklyJournalCard =
  document.getElementById("weeklyJournalCard");

const weeklyAvailability =
  document.getElementById("weeklyAvailability");

const weeklyContent =
  document.getElementById("weeklyContent");

const positive1 = document.getElementById("positive1");
const positive2 = document.getElementById("positive2");
const positive3 = document.getElementById("positive3");

const weeklyText =
  document.getElementById("weeklyText");

const saveWeekly =
  document.getElementById("saveWeekly");

const monthlyRecap =
  document.getElementById("monthlyRecap");

const notificationToggle =
  document.getElementById("notificationToggle");

const userName =
  document.getElementById("userName");

const saveName =
  document.getElementById("saveName");

const generateDuo =
  document.getElementById("generateDuo");

const joinDuo =
  document.getElementById("joinDuo");

const duoCodeInput =
  document.getElementById("duoCodeInput");

const duoDisconnected =
  document.getElementById("duoDisconnected");

const duoConnected =
  document.getElementById("duoConnected");

const duoCodeDisplay =
  document.getElementById("duoCodeDisplay");

const leaveDuo =
  document.getElementById("leaveDuo");


/* =========================================================
   DATES
   ========================================================= */

const dayNames = ["L","M","M","J","V","S","D"];

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

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");

}


function getMonday(date = new Date()) {

  const d = new Date(date);

  const day = d.getDay();

  const diff = day === 0 ? -6 : 1 - day;

  d.setDate(d.getDate() + diff);

  d.setHours(0,0,0,0);

  return d;
}


function getSunday(date = new Date()) {

  const monday = getMonday(date);

  const sunday = new Date(monday);

  sunday.setDate(monday.getDate() + 6);

  return sunday;
}


function getWeekDays() {

  const monday = getMonday();

  return Array.from({length: 7}, (_, i) => {

    const day = new Date(monday);

    day.setDate(monday.getDate() + i);

    return day;

  });

}


function formatShortDate(date) {

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short"
  });

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function showPage(pageId) {

  pages.forEach(page => {

    page.classList.toggle(
      "active",
      page.id === pageId
    );

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


  if (pageId === "settingsPage") {

    userName.value = data.userName || "";

    renderDuo();

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


/* =========================================================
   NOM
   ========================================================= */

saveName.addEventListener("click", () => {

  data.userName =
    userName.value.trim();

  saveData();

  renderWelcome();

  saveName.textContent = "Enregistré ✓";

  setTimeout(() => {

    saveName.textContent = "Enregistrer";

  }, 1500);

});


function renderWelcome() {

  welcomeName.textContent =
    data.userName
      ? data.userName.toUpperCase()
      : "ALIZETI";

}


/* =========================================================
   HABITUDES
   ========================================================= */

addHabitBtn.addEventListener("click", () => {

  if (data.habits.length >= 10) {

    alert("Tu peux avoir jusqu'à 10 habitudes.");

    return;

  }

  habitName.value = "";

  habitGoal.value = "3";

  habitModal.classList.remove("hidden");

  setTimeout(() => habitName.focus(), 100);

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

  const name =
    habitName.value.trim();

  if (!name) {

    habitName.focus();

    return;

  }


  data.habits.push({

    id: Date.now(),

    name,

    goal: Number(habitGoal.value),

    completed: {}

  });


  saveData();

  habitModal.classList.add("hidden");

  renderHabits();

  renderMonthlyRecap();

});


function countWeekCompleted(habit) {

  return getWeekDays()
    .filter(day =>
      habit.completed[dateKey(day)]
    )
    .length;

}


function renderHabits() {

  habitsList.innerHTML = "";

  if (!data.habits.length) {

    habitsList.innerHTML = `
      <div class="month-card">
        <div class="monthly-recap">
          Tu n'as pas encore ajouté d'habitude.
          <br><br>
          Commence simplement par quelque chose
          que tu aimerais essayer de faire régulièrement.
        </div>
      </div>
    `;

    return;

  }


  const days = getWeekDays();


  data.habits.forEach(habit => {

    const completed =
      countWeekCompleted(habit);

    const goalReached =
      completed >= habit.goal;

    const surpassed =
      completed > habit.goal;


    const card =
      document.createElement("div");


    card.className =
      "habit-card" +
      (goalReached ? " completed-goal" : "");


    const daysHTML =
      days.map((day, index) => {

        const key =
          dateKey(day);

        const checked =
          Boolean(habit.completed[key]);

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
            <strong>${completed}/${habit.goal}</strong>
            jours cette semaine
          </div>

        </div>

        <button
          class="delete-habit"
          data-delete="${habit.id}"
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
            : `${habit.goal - completed} jour${
                habit.goal - completed > 1 ? "s" : ""
              } restant${
                habit.goal - completed > 1 ? "s" : ""
              }`
        }

      </div>


      ${
        surpassed
          ? `
            <div class="habit-celebration">
              🔥
              Tu t'es surpassé sur cette habitude.
            </div>
          `
          : ""
      }

    `;


    habitsList.appendChild(card);

  });


  attachHabitEvents();

}


function attachHabitEvents() {

  document.querySelectorAll(".day-circle")
    .forEach(button => {

      button.addEventListener("click", () => {

        const habitId =
          Number(button.dataset.habit);

        const date =
          button.dataset.date;

        const habit =
          data.habits.find(
            h => h.id === habitId
          );

        if (!habit) return;


        habit.completed[date] =
          !habit.completed[date];


        saveData();

        renderHabits();

        renderCalendar();

        renderMonthlyRecap();

      });

    });


  document.querySelectorAll(".delete-habit")
    .forEach(button => {

      button.addEventListener("click", () => {

        const id =
          Number(button.dataset.delete);

        if (!confirm("Supprimer cette habitude ?")) {
          return;
        }

        data.habits =
          data.habits.filter(
            habit => habit.id !== id
          );

        saveData();

        renderHabits();

        renderMonthlyRecap();

      });

    });

}


/* =========================================================
   RECAP MENSUEL
   ========================================================= */

function renderMonthlyRecap() {

  if (!data.habits.length) {

    monthlyRecap.textContent =
      "Ajoute une habitude pour commencer ton suivi.";

    return;

  }


  const now = new Date();

  const year = now.getFullYear();

  const month = now.getMonth();

  const daysInMonth =
    new Date(year, month + 1, 0).getDate();


  const summaries =
    data.habits.slice(0, 3).map(habit => {

      let completed = 0;

      for (let day = 1; day <= daysInMonth; day++) {

        const date =
          new Date(year, month, day);

        if (habit.completed[dateKey(date)]) {
          completed++;
        }

      }


      const monthlyGoal =
        Math.round(
          habit.goal * daysInMonth / 7
        );


      return `
        <div style="margin-bottom:8px">
          Ce mois-ci, tu as réussi à
          <strong>${escapeHTML(habit.name)}</strong>
          <strong>${completed}</strong>
          jour${completed > 1 ? "s" : ""}
          sur environ
          <strong>${monthlyGoal}</strong>
          fixé${monthlyGoal > 1 ? "s" : ""}.
        </div>
      `;

    }).join("");


  monthlyRecap.innerHTML =
    summaries;

}


/* =========================================================
   CALENDRIER
   ========================================================= */

function renderCalendar() {

  const year =
    calendarDate.getFullYear();

  const month =
    calendarDate.getMonth();


  calendarTitle.textContent =
    `${monthNames[month]} ${year}`;


  calendarGrid.innerHTML = "";


  const firstDay =
    new Date(year, month, 1);


  let start =
    firstDay.getDay();


  start =
    start === 0
      ? 6
      : start - 1;


  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();


  for (let i = 0; i < start; i++) {

    const empty =
      document.createElement("div");

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
      data.habits.some(
        habit => habit.completed[key]
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


/* =========================================================
   JOURNAL QUOTIDIEN
   ========================================================= */

function loadJournals() {

  const today =
    dateKey(new Date());

  dailyJournal.value =
    data.dailyJournal[today] || "";


  const journal =
    data.weeklyJournals[getWeekKey()];


  if (!journal) {

    positive1.value = "";
    positive2.value = "";
    positive3.value = "";
    weeklyText.value = "";

    document
      .querySelectorAll(".choice input")
      .forEach(input => input.checked = false);

    return;

  }


  positive1.value =
    journal.positive1 || "";

  positive2.value =
    journal.positive2 || "";

  positive3.value =
    journal.positive3 || "";

  weeklyText.value =
    journal.text || "";


  document
    .querySelectorAll(".choice input")
    .forEach(input => {

      const category =
        input.dataset.category;

      const value =
        input.value;

      input.checked =
        journal[category]?.includes(value) || false;

    });

}


saveDaily.addEventListener("click", () => {

  const today =
    dateKey(new Date());

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


/* =========================================================
   BILAN HEBDOMADAIRE
   ========================================================= */

const positiveOptions = [
  "Je me suis senti bien",
  "J'ai pris du temps pour moi",
  "J'ai bien dormi",
  "J'ai fait quelque chose que j'aime",
  "J'ai été fier de moi",
  "J'ai passé du temps avec quelqu'un",
  "J'ai avancé sur un projet",
  "J'ai pris soin de moi",
  "J'ai découvert quelque chose",
  "Autre"
];


const negativeOptions = [
  "Fatigue",
  "Manque de temps",
  "Stress",
  "Manque de motivation",
  "Sommeil difficile",
  "Trop de choses à gérer",
  "Difficulté à m'organiser",
  "Baisse d'énergie",
  "Imprévu",
  "Autre"
];


function renderChoiceLists() {

  const positiveContainer =
    document.getElementById("positiveChoices");

  const negativeContainer =
    document.getElementById("negativeChoices");


  positiveContainer.innerHTML =
    positiveOptions.map((option, index) => `

      <label class="choice">

        <input
          type="checkbox"
          data-category="positiveChoices"
          value="${escapeHTML(option)}"
        >

        <span>
          ${index + 1}. ${escapeHTML(option)}
        </span>

      </label>

    `).join("");


  negativeContainer.innerHTML =
    negativeOptions.map((option, index) => `

      <label class="choice">

        <input
          type="checkbox"
          data-category="negativeChoices"
          value="${escapeHTML(option)}"
        >

        <span>
          ${index + 1}. ${escapeHTML(option)}
        </span>

      </label>

    `).join("");

}


function isWeeklyJournalAvailable() {

  const now =
    new Date();

  const day =
    now.getDay();

  const hour =
    now.getHours();


  if (day === 0 && hour >= 19) {
    return true;
  }


  if (day === 1) {
    return true;
  }


  return false;

}


function updateWeeklyJournalAvailability() {

  if (isWeeklyJournalAvailable()) {

    weeklyContent.classList.remove("hidden");

    weeklyJournalCard.classList.remove("locked");

    weeklyAvailability.textContent =
      "Ton bilan de la semaine est ouvert.";

  } else {

    weeklyContent.classList.add("hidden");

    weeklyJournalCard.classList.add("locked");

    weeklyAvailability.textContent =
      "Le bilan s'ouvre le dimanche à 19h et reste disponible jusqu'au lundi soir.";

  }

}


function getWeekKey() {

  return dateKey(getMonday());

}


saveWeekly.addEventListener("click", () => {

  if (!isWeeklyJournalAvailable()) {
    return;
  }


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


  const positiveChoices =
    [...document.querySelectorAll(
      '[data-category="positiveChoices"]:checked'
    )].map(input => input.value);


  const negativeChoices =
    [...document.querySelectorAll(
      '[data-category="negativeChoices"]:checked'
    )].map(input => input.value);


  data.weeklyJournals[getWeekKey()] = {

    positiveChoices,
    negativeChoices,

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


/* =========================================================
   MODE DUO
   ========================================================= */

function generateCode() {

  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 6; i++) {

    code +=
      characters[
        Math.floor(
          Math.random() * characters.length
        )
      ];

  }

  return code;

}


generateDuo.addEventListener("click", () => {

  const code =
    generateCode();


  data.duo = {
    code,
    status: "waiting"
  };


  saveData();

  renderDuo();

});


joinDuo.addEventListener("click", () => {

  const code =
    duoCodeInput.value
      .trim()
      .toUpperCase();


  if (code.length !== 6) {

    alert("Le code doit contenir 6 caractères.");

    return;

  }


  data.duo = {
    code,
    status: "connected"
  };


  saveData();

  renderDuo();

});


leaveDuo.addEventListener("click", () => {

  data.duo = null;

  saveData();

  renderDuo();

});


function renderDuo() {

  if (!data.duo) {

    duoDisconnected.classList.remove("hidden");

    duoConnected.classList.add("hidden");

    return;

  }


  duoDisconnected.classList.add("hidden");

  duoConnected.classList.remove("hidden");


  duoCodeDisplay.textContent =
    `Code : ${data.duo.code}`;

}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

notificationToggle.addEventListener(
  "click",
  async () => {

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

      } catch {
        data.notifications = false;
      }

    }


    saveData();

    updateNotificationToggle();

  }
);


function updateNotificationToggle() {

  notificationToggle.classList.toggle(
    "on",
    data.notifications
  );

}


/* =========================================================
   SECURITE
   ========================================================= */

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   INITIALISATION
   ========================================================= */

function initialize() {

  const monday =
    getMonday();

  const sunday =
    getSunday();


  weekDates.textContent =
    `${formatShortDate(monday)} — ${formatShortDate(sunday)}`;


  renderWelcome();

  renderChoiceLists();

  renderHabits();

  renderCalendar();

  renderMonthlyRecap();

  updateNotificationToggle();

  updateWeeklyJournalAvailability();

  loadJournals();

  renderDuo();

}


initialize();
