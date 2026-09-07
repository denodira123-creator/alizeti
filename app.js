const STORAGE_KEY = "alizeti_data_v1";

const defaultData = {
  userName: "",
  habits: [],
  journals: {},
  weeklyJournals: {},
  duo: {
    connected: false,
    code: ""
  },
  notifications: false
};

let data = loadData();

let calendarDate = new Date();
calendarDate.setDate(1);

let selectedCalendarHabitId = null;
let selectedCalendarDate = null;

let selectedGoal = 3;

let weeklyPositive = [];
let weeklyNegative = [];


/* ==================================================
   UTILITAIRES
================================================== */

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return structuredClone(defaultData);
    }

    const parsed = JSON.parse(saved);

    return {
      ...structuredClone(defaultData),
      ...parsed,
      habits: Array.isArray(parsed.habits) ? parsed.habits : [],
      journals: parsed.journals || {},
      weeklyJournals: parsed.weeklyJournals || {},
      duo: {
        ...defaultData.duo,
        ...(parsed.duo || {})
      }
    };
  } catch (error) {
    console.error("Impossible de charger les données :", error);
    return structuredClone(defaultData);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function makeId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isToday(date) {
  const today = new Date();

  return dateKey(date) === dateKey(today);
}

function formatLongDate(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function formatMonth(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric"
  }).format(date);
}

function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function showToast(message) {
  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timeout);

  showToast.timeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}


/* ==================================================
   HABITUDES
================================================== */

function getHabitById(id) {
  return data.habits.find(habit => habit.id === id);
}

function isHabitCompleted(habit, key) {
  return Boolean(
    habit &&
    habit.completed &&
    habit.completed[key]
  );
}

function toggleHabit(habitId, key) {
  const habit = getHabitById(habitId);

  if (!habit) return;

  if (!habit.completed) {
    habit.completed = {};
  }

  habit.completed[key] = !habit.completed[key];

  saveData();

  renderHome();
  renderCalendar();
  renderCalendarJournal();

  if (selectedCalendarDate === key) {
    renderCalendarJournal();
  }
}

function getWeekDates(referenceDate = new Date()) {
  const date = new Date(referenceDate);

  /*
    JS :
    dimanche = 0
    lundi = 1
  */
  const day = date.getDay();

  const mondayOffset = day === 0 ? -6 : 1 - day;

  date.setDate(date.getDate() + mondayOffset);

  const dates = [];

  for (let i = 0; i < 7; i++) {
    const current = new Date(date);
    current.setDate(date.getDate() + i);
    dates.push(current);
  }

  return dates;
}

function getHabitWeekCount(habit, referenceDate = new Date()) {
  return getWeekDates(referenceDate)
    .filter(date => isHabitCompleted(habit, dateKey(date)))
    .length;
}

function renderHabits() {
  const container = document.getElementById("habitsList");

  if (!container) return;

  container.innerHTML = "";

  if (!data.habits.length) {
    container.innerHTML = `
      <div class="habit-card">
        <p class="soft-text">
          Commence doucement. Ajoute une première habitude
          que tu aimerais installer dans ton quotidien.
        </p>
      </div>
    `;

    return;
  }

  const weekDates = getWeekDates();

  data.habits.forEach(habit => {
    const count = getHabitWeekCount(habit);

    const card = document.createElement("article");
    card.className = "habit-card";

    card.innerHTML = `
      <div class="habit-card-top">
        <div>
          <p class="habit-name"></p>
          <div class="habit-progress-text">
            ${count} / ${habit.goal || 3} jour${count > 1 ? "s" : ""}
            cette semaine
          </div>
        </div>
      </div>

      <div class="habit-week"></div>
    `;

    card.querySelector(".habit-name").textContent = habit.name;

    const weekContainer = card.querySelector(".habit-week");

    weekDates.forEach(date => {
      const key = dateKey(date);

      const button = document.createElement("button");
      button.className = "habit-day";

      if (isHabitCompleted(habit, key)) {
        button.classList.add("completed");
      }

      if (isToday(date)) {
        button.classList.add("today");
      }

      button.innerHTML = `
        <span class="habit-day-label">
          ${new Intl.DateTimeFormat("fr-FR", {
            weekday: "short"
          }).format(date).slice(0, 1).toUpperCase()}
        </span>

        <span class="habit-day-circle">
          ${date.getDate()}
        </span>
      `;

      button.addEventListener("click", () => {
        toggleHabit(habit.id, key);
      });

      weekContainer.appendChild(button);
    });

    container.appendChild(card);
  });
}

function addHabit(name, goal) {
  const cleanName = name.trim();

  if (!cleanName) {
    showToast("Donne un nom à ton habitude.");
    return;
  }

  data.habits.push({
    id: makeId("habit"),
    name: cleanName,
    goal: Number(goal) || 3,
    createdAt: new Date().toISOString(),
    completed: {}
  });

  saveData();

  closeHabitModal();

  renderHome();
  renderCalendar();

  showToast("Habitude ajoutée 🌱");
}


/* ==================================================
   ACCUEIL
================================================== */

function renderHome() {
  renderWelcome();
  renderHabits();
  renderMonthlyRecap();
}

function renderWelcome() {
  const welcomeName = document.getElementById("welcomeName");
  const welcomeTitle = document.getElementById("welcomeTitle");
  const weekDates = document.getElementById("weekDates");

  const name = data.userName.trim();

  if (welcomeName) {
    welcomeName.textContent = name ? `ALIZETI • ${name.toUpperCase()}` : "ALIZETI";
  }

  if (welcomeTitle) {
    welcomeTitle.textContent = name
      ? `Bienvenue, ${name}`
      : "Bienvenue sur Alizeti";
  }

  if (weekDates) {
    const dates = getWeekDates();

    const first = dates[0];
    const last = dates[6];

    const firstText = new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long"
    }).format(first);

    const lastText = new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long"
    }).format(last);

    weekDates.textContent = `${capitalize(firstText)} → ${lastText}`;
  }
}

function renderMonthlyRecap() {
  const container = document.getElementById("monthlyRecap");

  if (!container) return;

  if (!data.habits.length) {
    container.textContent = "Ajoute une habitude pour commencer ton suivi.";
    return;
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  let total = 0;

  data.habits.forEach(habit => {
    Object.keys(habit.completed || {}).forEach(key => {
      const date = parseDateKey(key);

      if (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        habit.completed[key]
      ) {
        total++;
      }
    });
  });

  container.textContent =
    total === 0
      ? "Pas encore de jour validé ce mois-ci. Chaque petit pas compte."
      : `${total} réalisation${total > 1 ? "s" : ""} ce mois-ci. Continue doucement.`;
}


/* ==================================================
   CALENDRIER
================================================== */

function renderCalendarHabitSelector() {
  const container = document.getElementById("calendarHabitSelector");

  if (!container) return;

  container.innerHTML = "";

  if (!data.habits.length) {
    container.innerHTML = `
      <span class="soft-text">
        Ajoute une habitude depuis l'accueil pour la suivre ici.
      </span>
    `;

    return;
  }

  if (
    !selectedCalendarHabitId ||
    !getHabitById(selectedCalendarHabitId)
  ) {
    selectedCalendarHabitId = data.habits[0].id;
  }

  data.habits.forEach(habit => {
    const button = document.createElement("button");

    button.className = "calendar-habit-button";

    if (habit.id === selectedCalendarHabitId) {
      button.classList.add("selected");
    }

    button.textContent = habit.name;

    button.addEventListener("click", () => {
      selectedCalendarHabitId = habit.id;

      /*
        On conserve la date sélectionnée si possible,
        mais on recalcule le journal selon l'habitude choisie.
      */

      renderCalendar();
      renderCalendarJournal();
    });

    container.appendChild(button);
  });
}

function renderCalendarHabitInfo() {
  const container = document.getElementById("calendarHabitInfo");

  if (!container) return;

  const habit = getHabitById(selectedCalendarHabitId);

  if (!habit) {
    container.textContent = "";
    return;
  }

  const count = getMonthHabitCount(
    habit,
    calendarDate.getFullYear(),
    calendarDate.getMonth()
  );

  container.textContent =
    `${count} jour${count > 1 ? "s" : ""} réalisé${count > 1 ? "s" : ""} ce mois-ci • objectif : ${habit.goal} / semaine`;
}

function getMonthHabitCount(habit, year, month) {
  let count = 0;

  Object.keys(habit.completed || {}).forEach(key => {
    const date = parseDateKey(key);

    if (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      habit.completed[key]
    ) {
      count++;
    }
  });

  return count;
}

function renderCalendar() {
  const grid = document.getElementById("calendarGrid");
  const title = document.getElementById("calendarTitle");

  if (!grid || !title) return;

  renderCalendarHabitSelector();

  title.textContent = capitalize(formatMonth(calendarDate));

  grid.innerHTML = "";

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const firstDay = new Date(year, month, 1);

  /*
    Conversion :
    dimanche = 0 -> on veut lundi = 0
  */
  const firstWeekday = (firstDay.getDay() + 6) % 7;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const habit = getHabitById(selectedCalendarHabitId);

  for (let i = 0; i < firstWeekday; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day empty";
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const key = dateKey(date);

    const button = document.createElement("button");

    button.className = "calendar-day";

    if (isToday(date)) {
      button.classList.add("today");
    }

    if (selectedCalendarDate === key) {
      button.classList.add("selected");
    }

    const completed = habit && isHabitCompleted(habit, key);

    if (completed) {
      button.classList.add("completed");
    }

    button.innerHTML = `
      <span class="calendar-day-number">${day}</span>
      ${
        habit
          ? `<span class="calendar-day-dot"></span>`
          : ""
      }
    `;

    /*
      IMPORTANT :
      Le point est affiché pour chaque jour lorsque
      une habitude est sélectionnée.

      Bleu :
      la journée n'est PAS réalisée.

      Blanc :
      la journée EST réalisée.

      Le clic ouvre ensuite le journal du jour
      sous le calendrier.
    */

    button.addEventListener("click", () => {
      selectedCalendarDate = key;

      renderCalendar();
      renderCalendarJournal();

      setTimeout(() => {
        const journalCard = document.getElementById(
          "calendarJournalCard"
        );

        if (journalCard && !journalCard.classList.contains("hidden")) {
          journalCard.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      }, 60);
    });

    /*
      Double clic :
      permet également de valider rapidement l'habitude
      directement depuis le calendrier.
    */

    button.addEventListener("dblclick", event => {
      event.preventDefault();

      if (!habit) return;

      toggleHabit(habit.id, key);
    });

    grid.appendChild(button);
  }

  renderCalendarHabitInfo();
}


/* ==================================================
   JOURNAL DEPUIS LE CALENDRIER
================================================== */

function renderCalendarJournal() {
  const card = document.getElementById("calendarJournalCard");
  const title = document.getElementById("calendarJournalTitle");
  const content = document.getElementById("calendarJournalContent");

  if (!card || !title || !content) return;

  if (!selectedCalendarDate) {
    card.classList.add("hidden");
    return;
  }

  const date = parseDateKey(selectedCalendarDate);

  title.textContent = capitalize(formatLongDate(date));

  const journal = data.journals[selectedCalendarDate];

  content.innerHTML = "";

  /*
    Si aucun journal n'existe pour cette date,
    on garde tout de même la carte visible :
    le clic sur un jour permet donc de savoir
    qu'il n'y a simplement rien d'écrit ce jour-là.
  */

  if (!journal) {
    content.innerHTML = `
      <div class="empty-journal">
        Aucun journal n'a été rempli ce jour-là.
        <br><br>
        Tu peux retrouver cette journée dans l'onglet
        <strong>Journal</strong> pour y écrire si tu le souhaites.
      </div>
    `;

    card.classList.remove("hidden");
    return;
  }

  const feelings = Array.isArray(journal.feelings)
    ? journal.feelings
    : [];

  if (feelings.length) {
    const feelingsContainer = document.createElement("div");
    feelingsContainer.className = "journal-feelings";

    feelings.forEach(feeling => {
      const span = document.createElement("span");
      span.className = "journal-feeling";
      span.textContent = feeling;

      feelingsContainer.appendChild(span);
    });

    content.appendChild(feelingsContainer);
  }

  if (journal.text && journal.text.trim()) {
    const entry = document.createElement("div");
    entry.className = "journal-entry";
    entry.textContent = journal.text;

    content.appendChild(entry);
  }

  if (!feelings.length && !journal.text) {
    content.innerHTML = `
      <div class="empty-journal">
        Le journal existe pour cette journée,
        mais aucun contenu n'a encore été renseigné.
      </div>
    `;
  }

  card.classList.remove("hidden");
}


/* ==================================================
   PAGE JOURNAL
================================================== */

function getTodayJournal() {
  return data.journals[dateKey(new Date())] || {
    feelings: [],
    text: ""
  };
}

function loadTodayJournal() {
  const journal = getTodayJournal();

  document
    .querySelectorAll(".feeling-option input")
    .forEach(input => {
      input.checked = journal.feelings.includes(input.value);
    });

  const textarea = document.getElementById("dailyJournal");

  if (textarea) {
    textarea.value = journal.text || "";
  }
}

function saveDailyJournal() {
  const feelings = Array.from(
    document.querySelectorAll(".feeling-option input:checked")
  ).map(input => input.value);

  const textarea = document.getElementById("dailyJournal");

  data.journals[dateKey(new Date())] = {
    feelings,
    text: textarea ? textarea.value.trim() : "",
    updatedAt: new Date().toISOString()
  };

  saveData();

  showToast("Journal enregistré ✨");

  renderCalendar();
  renderCalendarJournal();
  renderWeeklyAvailability();
}

function renderWeeklyAvailability() {
  const container = document.getElementById("weeklyAvailability");
  const content = document.getElementById("weeklyContent");

  if (!container || !content) return;

  const dates = getWeekDates();
  const keys = dates.map(dateKey);

  const hasCompleteWeek = keys.every(key => Boolean(data.journals[key]));

  if (hasCompleteWeek) {
    container.textContent =
      "Ton bilan de la semaine est disponible.";
    content.classList.remove("hidden");
  } else {
    const filled = keys.filter(key => Boolean(data.journals[key])).length;

    container.textContent =
      `${filled}/7 jour${filled > 1 ? "s" : ""} de journal rempli${filled > 1 ? "s" : ""} cette semaine. Le bilan sera disponible lorsque la semaine sera complète.`;

    content.classList.add("hidden");
  }
}


/* ==================================================
   BILAN HEBDOMADAIRE
================================================== */

const positiveOptions = [
  "J'ai pris du temps pour moi",
  "J'ai avancé sur mes habitudes",
  "J'ai bien dormi",
  "J'ai bougé",
  "J'ai passé du temps avec mes proches",
  "J'ai fait quelque chose qui me plaît"
];

const negativeOptions = [
  "J'ai manqué d'énergie",
  "J'ai eu du mal à rester régulier·ère",
  "J'ai été stressé·e",
  "J'ai manqué de temps",
  "J'ai eu du mal à dormir",
  "J'ai été trop exigeant·e avec moi-même"
];

function renderChoiceButtons(containerId, options, selected) {
  const container = document.getElementById(containerId);

  if (!container) return;

  container.innerHTML = "";

  options.forEach(option => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "choice-button";

    if (selected.includes(option)) {
      button.classList.add("selected");
    }

    button.textContent = option;

    button.addEventListener("click", () => {
      const array =
        containerId === "positiveChoices"
          ? weeklyPositive
          : weeklyNegative;

      const index = array.indexOf(option);

      if (index >= 0) {
        array.splice(index, 1);
      } else {
        array.push(option);
      }

      renderChoiceButtons(
        containerId,
        options,
        array
      );
    });

    container.appendChild(button);
  });
}

function getWeekKey(date = new Date()) {
  const dates = getWeekDates(date);

  return dateKey(dates[0]);
}

function loadWeeklyJournal() {
  const saved = data.weeklyJournals[getWeekKey()];

  weeklyPositive = saved?.positive || [];
  weeklyNegative = saved?.negative || [];

  document.getElementById("positive1").value =
    saved?.positive1 || "";

  document.getElementById("positive2").value =
    saved?.positive2 || "";

  document.getElementById("positive3").value =
    saved?.positive3 || "";

  document.getElementById("weeklyText").value =
    saved?.text || "";

  renderChoiceButtons(
    "positiveChoices",
    positiveOptions,
    weeklyPositive
  );

  renderChoiceButtons(
    "negativeChoices",
    negativeOptions,
    weeklyNegative
  );
}

function saveWeeklyJournal() {
  const weekKey = getWeekKey();

  data.weeklyJournals[weekKey] = {
    positive: weeklyPositive,
    negative: weeklyNegative,
    positive1: document.getElementById("positive1").value.trim(),
    positive2: document.getElementById("positive2").value.trim(),
    positive3: document.getElementById("positive3").value.trim(),
    text: document.getElementById("weeklyText").value.trim(),
    updatedAt: new Date().toISOString()
  };

  saveData();

  showToast("Bilan enregistré 🌻");
}


/* ==================================================
   NAVIGATION
================================================== */

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  const target = document.getElementById(pageId);

  if (target) {
    target.classList.add("active");
  }

  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.toggle(
      "active",
      item.dataset.page === pageId
    );
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  if (pageId === "homePage") {
    renderHome();
  }

  if (pageId === "calendarPage") {
    renderCalendar();
    renderCalendarJournal();
  }

  if (pageId === "journalPage") {
    loadTodayJournal();
    renderWeeklyAvailability();
    loadWeeklyJournal();
  }

  if (pageId === "settingsPage") {
    loadSettings();
  }
}


/* ==================================================
   MODAL HABITUDE
================================================== */

function openHabitModal() {
  const modal = document.getElementById("habitModal");

  if (!modal) return;

  modal.classList.remove("hidden");

  const input = document.getElementById("habitName");

  if (input) {
    input.value = "";

    setTimeout(() => {
      input.focus();
    }, 50);
  }
}

function closeHabitModal() {
  const modal = document.getElementById("habitModal");

  if (modal) {
    modal.classList.add("hidden");
  }
}

function setupGoalSelector() {
  document.querySelectorAll(".goal-options button").forEach(button => {
    button.addEventListener("click", () => {
      selectedGoal = Number(button.dataset.goal);

      document
        .querySelectorAll(".goal-options button")
        .forEach(item => {
          item.classList.toggle(
            "selected",
            Number(item.dataset.goal) === selectedGoal
          );
        });
    });
  });
}


/* ==================================================
   REGLAGES
================================================== */

function loadSettings() {
  const nameInput = document.getElementById("userName");

  if (nameInput) {
    nameInput.value = data.userName || "";
  }

  const toggle = document.getElementById("notificationToggle");

  if (toggle) {
    toggle.classList.toggle(
      "active",
      Boolean(data.notifications)
    );
  }

  const disconnected =
    document.getElementById("duoDisconnected");

  const connected =
    document.getElementById("duoConnected");

  if (data.duo.connected) {
    disconnected?.classList.add("hidden");
    connected?.classList.remove("hidden");

    const display =
      document.getElementById("duoCodeDisplay");

    if (display) {
      display.textContent =
        `Code : ${data.duo.code}`;
    }
  } else {
    disconnected?.classList.remove("hidden");
    connected?.classList.add("hidden");
  }
}

function saveName() {
  const input = document.getElementById("userName");

  if (!input) return;

  data.userName = input.value.trim();

  saveData();

  renderHome();

  showToast(
    data.userName
      ? `Ravi de te retrouver, ${data.userName} 🌱`
      : "Nom supprimé."
  );
}

function generateDuoCode() {
  const code = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  data.duo = {
    connected: true,
    code
  };

  saveData();
  loadSettings();

  showToast("Ton code Duo a été créé.");
}

function joinDuo() {
  const input = document.getElementById("duoCodeInput");

  if (!input) return;

  const code = input.value
    .trim()
    .toUpperCase();

  if (code.length !== 6) {
    showToast("Le code doit contenir 6 caractères.");
    return;
  }

  data.duo = {
    connected: true,
    code
  };

  saveData();
  loadSettings();

  showToast("Duo activé ♡");
}

function leaveDuo() {
  data.duo = {
    connected: false,
    code: ""
  };

  saveData();
  loadSettings();

  showToast("Tu as quitté le Duo.");
}


/* ==================================================
   NOTIFICATIONS
================================================== */

function setupNotifications() {
  const toggle = document.getElementById("notificationToggle");

  if (!toggle) return;

  toggle.addEventListener("click", async () => {
    const nextState = !data.notifications;

    if (nextState && "Notification" in window) {
      try {
        const permission =
          await Notification.requestPermission();

        if (permission !== "granted") {
          showToast("Les notifications ne sont pas autorisées.");
          return;
        }
      } catch (error) {
        console.warn(
          "Impossible de demander la permission :",
          error
        );
      }
    }

    data.notifications = nextState;

    saveData();

    toggle.classList.toggle(
      "active",
      data.notifications
    );
  });
}


/* ==================================================
   SERVICE WORKER
================================================== */

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("service-worker.js")
        .catch(error => {
          /*
            Le fichier service-worker.js n'est pas obligatoire
            pour faire fonctionner l'application.
          */
          console.info(
            "Service Worker non disponible :",
            error.message
          );
        });
    });
  }
}


/* ==================================================
   ÉVÉNEMENTS
================================================== */

function setupNavigation() {
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      showPage(item.dataset.page);
    });
  });

  const settingsBtn =
    document.getElementById("settingsBtn");

  settingsBtn?.addEventListener("click", () => {
    showPage("settingsPage");
  });
}

function setupCalendarNavigation() {
  document
    .getElementById("prevMonth")
    ?.addEventListener("click", () => {
      calendarDate.setMonth(calendarDate.getMonth() - 1);

      selectedCalendarDate = null;

      renderCalendar();
      renderCalendarJournal();
    });

  document
    .getElementById("nextMonth")
    ?.addEventListener("click", () => {
      calendarDate.setMonth(calendarDate.getMonth() + 1);

      selectedCalendarDate = null;

      renderCalendar();
      renderCalendarJournal();
    });
}

function setupHabitModal() {
  document
    .getElementById("addHabitBtn")
    ?.addEventListener("click", openHabitModal);

  document
    .getElementById("closeModal")
    ?.addEventListener("click", closeHabitModal);

  document
    .getElementById("saveHabit")
    ?.addEventListener("click", () => {
      const input =
        document.getElementById("habitName");

      addHabit(
        input?.value || "",
        selectedGoal
      );
    });

  document
    .getElementById("habitModal")
    ?.addEventListener("click", event => {
      if (event.target.id === "habitModal") {
        closeHabitModal();
      }
    });

  document
    .getElementById("habitName")
    ?.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        document.getElementById("saveHabit")?.click();
      }

      if (event.key === "Escape") {
        closeHabitModal();
      }
    });
}

function setupJournal() {
  document
    .getElementById("saveDaily")
    ?.addEventListener("click", saveDailyJournal);

  document
    .getElementById("saveWeekly")
    ?.addEventListener("click", saveWeeklyJournal);
}

function setupSettings() {
  document
    .getElementById("saveName")
    ?.addEventListener("click", saveName);

  document
    .getElementById("generateDuo")
    ?.addEventListener("click", generateDuoCode);

  document
    .getElementById("joinDuo")
    ?.addEventListener("click", joinDuo);

  document
    .getElementById("leaveDuo")
    ?.addEventListener("click", leaveDuo);
}


/* ==================================================
   INITIALISATION
================================================== */

function init() {
  setupNavigation();
  setupCalendarNavigation();
  setupHabitModal();
  setupGoalSelector();
  setupJournal();
  setupSettings();
  setupNotifications();

  renderHome();
  renderCalendar();

  loadTodayJournal();
  renderWeeklyAvailability();
  loadWeeklyJournal();

  loadSettings();

  registerServiceWorker();
}

document.addEventListener("DOMContentLoaded", init);
