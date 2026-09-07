const STORAGE_KEY = "alizeti_v02";

/* =========================================================
   DONNÉES
========================================================= */

const defaultData = {
  habits: [],
  dailyJournal: {},
  weeklyJournals: {},
  notifications: false,
  userName: "",
  duo: null
};

let data;

try {
  const saved = localStorage.getItem(STORAGE_KEY);

  data = saved
    ? JSON.parse(saved)
    : structuredClone(defaultData);
} catch (error) {
  console.error("Erreur lors du chargement :", error);
  data = structuredClone(defaultData);
}

/* Sécurisation des données */

if (!Array.isArray(data.habits)) {
  data.habits = [];
}

if (
  !data.dailyJournal ||
  typeof data.dailyJournal !== "object"
) {
  data.dailyJournal = {};
}

if (
  !data.weeklyJournals ||
  typeof data.weeklyJournals !== "object"
) {
  data.weeklyJournals = {};
}

/* =========================================================
   SAUVEGARDE
========================================================= */

function saveData() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );
  } catch (error) {
    console.error("Erreur de sauvegarde :", error);
  }
}

/* =========================================================
   ELEMENTS HTML
========================================================= */

const pages = document.querySelectorAll(".page");
const navItems = document.querySelectorAll(".nav-item");

const settingsBtn =
  document.getElementById("settingsBtn");

const addHabitBtn =
  document.getElementById("addHabitBtn");

const habitModal =
  document.getElementById("habitModal");

const closeModal =
  document.getElementById("closeModal");

const habitName =
  document.getElementById("habitName");

const saveHabitBtn =
  document.getElementById("saveHabit");

const goalButtons =
  document.querySelectorAll(".goal-options button");

const habitsList =
  document.getElementById("habitsList");

const weekDates =
  document.getElementById("weekDates");

const welcomeName =
  document.getElementById("welcomeName");

const calendarTitle =
  document.getElementById("calendarTitle");

const calendarGrid =
  document.getElementById("calendarGrid");

const calendarHabitSelector =
  document.getElementById("calendarHabitSelector");

const calendarHabitInfo =
  document.getElementById("calendarHabitInfo");

const prevMonth =
  document.getElementById("prevMonth");

const nextMonth =
  document.getElementById("nextMonth");

const dailyJournal =
  document.getElementById("dailyJournal");

const saveDaily =
  document.getElementById("saveDaily");

const dailyJournalTitle =
  document.getElementById("dailyJournalTitle");

const weeklyJournalCard =
  document.getElementById("weeklyJournalCard");

const weeklyAvailability =
  document.getElementById("weeklyAvailability");

const weeklyHistoryRange =
  document.getElementById("weeklyHistoryRange");

const weeklyHistoryStatus =
  document.getElementById("weeklyHistoryStatus");

const prevWeekly =
  document.getElementById("prevWeekly");

const nextWeekly =
  document.getElementById("nextWeekly");

const weeklyJournalTitle =
  document.getElementById("weeklyJournalTitle");

const weeklyContent =
  document.getElementById("weeklyContent");

const positive1 =
  document.getElementById("positive1");

const positive2 =
  document.getElementById("positive2");

const positive3 =
  document.getElementById("positive3");

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
   ETAT
========================================================= */

let selectedGoal = 3;
let selectedCalendarHabitId = null;
let calendarDate = new Date();

let selectedJournalDate =
  dateKey(new Date());

/*
  Nouvelle gestion de l'historique hebdomadaire :
  on mémorise la semaine actuellement affichée.
*/
let selectedWeeklyWeekKey =
  dateKey(getMonday(new Date()));

/* =========================================================
   DATES
========================================================= */

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

  const diff =
    day === 0
      ? -6
      : 1 - day;

  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);

  return d;
}

function getSunday(date = new Date()) {
  const monday = getMonday(date);
  const sunday = new Date(monday);

  sunday.setDate(
    monday.getDate() + 6
  );

  return sunday;
}

function getWeekDays() {
  const monday = getMonday();

  return Array.from(
    { length: 7 },
    (_, index) => {
      const day = new Date(monday);

      day.setDate(
        monday.getDate() + index
      );

      return day;
    }
  );
}

function formatShortDate(date) {
  return date.toLocaleDateString(
    "fr-FR",
    {
      day: "numeric",
      month: "short"
    }
  );
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
    loadJournals(selectedJournalDate);
    updateWeeklyJournalAvailability();
  }

  if (pageId === "settingsPage") {
    if (userName) {
      userName.value =
        data.userName || "";
    }

    renderDuo();
  }
}

navItems.forEach(item => {
  item.addEventListener("click", () => {

    if (
      item.dataset.page === "journalPage"
    ) {
      selectedJournalDate =
        dateKey(new Date());
    }

    showPage(item.dataset.page);
  });
});

if (settingsBtn) {
  settingsBtn.addEventListener(
    "click",
    () => {
      showPage("settingsPage");
    }
  );
}

/* =========================================================
   NOM
========================================================= */

if (saveName) {
  saveName.addEventListener("click", () => {

    data.userName =
      userName
        ? userName.value.trim()
        : "";

    saveData();
    renderWelcome();

    saveName.textContent =
      "Enregistré ✓";

    setTimeout(() => {
      saveName.textContent =
        "Enregistrer";
    }, 1500);
  });
}

function renderWelcome() {
  if (!welcomeName) return;

  welcomeName.textContent =
    data.userName
      ? data.userName.toUpperCase()
      : "ALIZETI";
}

/* =========================================================
   MODAL HABITUDE
========================================================= */

if (addHabitBtn) {
  addHabitBtn.addEventListener(
    "click",
    () => {

      if (data.habits.length >= 10) {
        alert(
          "Tu peux avoir jusqu'à 10 habitudes."
        );
        return;
      }

      if (habitName) {
        habitName.value = "";
      }

      selectedGoal = 3;

      goalButtons.forEach(button => {
        button.classList.toggle(
          "selected",
          button.dataset.goal === "3"
        );
      });

      if (habitModal) {
        habitModal.classList.remove(
          "hidden"
        );
      }

      setTimeout(() => {
        if (habitName) {
          habitName.focus();
        }
      }, 100);
    }
  );
}

if (closeModal) {
  closeModal.addEventListener(
    "click",
    () => {

      if (habitModal) {
        habitModal.classList.add(
          "hidden"
        );
      }
    }
  );
}

if (habitModal) {
  habitModal.addEventListener(
    "click",
    event => {

      if (
        event.target === habitModal
      ) {
        habitModal.classList.add(
          "hidden"
        );
      }
    }
  );
}

goalButtons.forEach(button => {
  button.addEventListener(
    "click",
    () => {

      selectedGoal =
        Number(button.dataset.goal);

      goalButtons.forEach(item => {
        item.classList.toggle(
          "selected",
          item === button
        );
      });
    }
  );
});

/* =========================================================
   CREATION HABITUDE
========================================================= */

if (saveHabitBtn) {
  saveHabitBtn.addEventListener(
    "click",
    () => {

      const name =
        habitName
          ? habitName.value.trim()
          : "";

      if (!name) {
        if (habitName) {
          habitName.focus();
        }

        return;
      }

      const habit = {
        id: Date.now(),
        name: name,
        goal: selectedGoal,
        completed: {}
      };

      data.habits.push(habit);

      if (
        selectedCalendarHabitId === null
      ) {
        selectedCalendarHabitId =
          habit.id;
      }

      saveData();

      if (habitModal) {
        habitModal.classList.add(
          "hidden"
        );
      }

      renderHabits();
      renderCalendarHabitSelector();
      renderCalendar();
      renderMonthlyRecap();
    }
  );
}

/* =========================================================
   HABITUDES
========================================================= */

function renderHabits() {

  if (!habitsList) return;

  if (data.habits.length === 0) {

    habitsList.innerHTML = `
      <div class="empty-state">
        <p>Commence doucement 🌱</p>
        <span>Ajoute ta première habitude.</span>
      </div>
    `;

    return;
  }

  habitsList.innerHTML =
    data.habits
      .map(habit => {

        const today =
          dateKey(new Date());

        const completed =
          Boolean(
            habit.completed?.[today]
          );

        return `
          <div
            class="habit-row ${completed ? "completed" : ""}"
            data-habit-id="${habit.id}"
          >

            <button
              class="habit-check"
              data-action="toggle"
              data-id="${habit.id}"
              aria-label="Marquer l'habitude"
            >
              ${completed ? "✓" : ""}
            </button>

            <div class="habit-info">

              <strong>
                ${escapeHTML(habit.name)}
              </strong>

              <span>
                ${habit.goal} jour${habit.goal > 1 ? "s" : ""} / semaine
              </span>

            </div>

            <button
              class="habit-delete"
              data-action="delete"
              data-id="${habit.id}"
              aria-label="Supprimer"
            >
              ×
            </button>

          </div>
        `;
      })
      .join("");

  habitsList
    .querySelectorAll(
      "[data-action='toggle']"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const id =
            Number(button.dataset.id);

          toggleHabit(
            id,
            dateKey(new Date())
          );
        }
      );
    });

  habitsList
    .querySelectorAll(
      "[data-action='delete']"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const id =
            Number(button.dataset.id);

          const habit =
            data.habits.find(
              item => item.id === id
            );

          if (!habit) return;

          const confirmed =
            confirm(
              `Supprimer l'habitude « ${habit.name} » ?`
            );

          if (!confirmed) return;

          data.habits =
            data.habits.filter(
              item => item.id !== id
            );

          if (
            selectedCalendarHabitId === id
          ) {
            selectedCalendarHabitId =
              data.habits[0]?.id ?? null;
          }

          saveData();

          renderHabits();
          renderCalendarHabitSelector();
          renderCalendar();
          renderMonthlyRecap();
        }
      );
    });
}

function toggleHabit(
  habitId,
  key
) {

  const habit =
    data.habits.find(
      item => item.id === habitId
    );

  if (!habit) return;

  if (!habit.completed) {
    habit.completed = {};
  }

  habit.completed[key] =
    !habit.completed[key];

  saveData();

  renderHabits();
  renderCalendar();
  renderMonthlyRecap();
}

/* =========================================================
   CALENDRIER
========================================================= */

function renderCalendarHabitSelector() {

  if (!calendarHabitSelector) {
    return;
  }

  if (data.habits.length === 0) {

    calendarHabitSelector.innerHTML = "";

    if (calendarHabitInfo) {
      calendarHabitInfo.textContent =
        "Ajoute une habitude pour voir ton suivi.";
    }

    return;
  }

  if (
    selectedCalendarHabitId === null ||
    !data.habits.some(
      habit =>
        habit.id ===
        selectedCalendarHabitId
    )
  ) {
    selectedCalendarHabitId =
      data.habits[0].id;
  }

  calendarHabitSelector.innerHTML =
    data.habits
      .map(
        habit => `
          <button
            type="button"
            class="calendar-habit-button ${
              habit.id ===
              selectedCalendarHabitId
                ? "active"
                : ""
            }"
            data-id="${habit.id}"
          >
            ${escapeHTML(habit.name)}
          </button>
        `
      )
      .join("");

  calendarHabitSelector
    .querySelectorAll(
      ".calendar-habit-button"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          selectedCalendarHabitId =
            Number(button.dataset.id);

          renderCalendarHabitSelector();
          renderCalendar();
        }
      );
    });

  const habit =
    data.habits.find(
      item =>
        item.id ===
        selectedCalendarHabitId
    );

  if (
    calendarHabitInfo &&
    habit
  ) {
    calendarHabitInfo.textContent =
      `${habit.goal} jour${habit.goal > 1 ? "s" : ""} par semaine`;
  }
}

function renderCalendar() {

  if (
    !calendarTitle ||
    !calendarGrid
  ) {
    return;
  }

  const year =
    calendarDate.getFullYear();

  const month =
    calendarDate.getMonth();

  calendarTitle.textContent =
    `${monthNames[month]} ${year}`;

  calendarGrid.innerHTML = "";

  const firstDay =
    new Date(
      year,
      month,
      1
    );

  let startDay =
    firstDay.getDay();

  /*
    JS : dimanche = 0
    Notre calendrier commence lundi.
  */
  startDay =
    startDay === 0
      ? 6
      : startDay - 1;

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  /*
    Cases avant le premier jour.
  */
  for (
    let index = 0;
    index < startDay;
    index++
  ) {

    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "calendar-day empty";

    calendarGrid.appendChild(
      empty
    );
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {

    const date =
      new Date(
        year,
        month,
        day
      );

    const key =
      dateKey(date);

    const isToday =
      key === dateKey(new Date());

    const habit =
      data.habits.find(
        item =>
          item.id ===
          selectedCalendarHabitId
      );

    const completed =
      Boolean(
        habit?.completed?.[key]
      );

    /*
      NOUVEAU :
      présence d'un journal quotidien.
      Cela permet d'afficher seulement
      un petit point dans le calendrier.
    */
    const hasJournal =
      Boolean(
        data.dailyJournal[key]
      );

    const cell =
      document.createElement(
        "button"
      );

    cell.type = "button";

    cell.className =
      "calendar-day" +
      (
        completed
          ? " has-habit"
          : ""
      ) +
      (
        isToday
          ? " today"
          : ""
      ) +
      (
        hasJournal
          ? " has-journal"
          : ""
      );

    cell.textContent =
      day;

    cell.addEventListener(
      "click",
      () => {

        /*
          Cliquer sur un jour ouvre
          directement le journal de ce jour.
        */
        selectedJournalDate =
          key;

        showPage(
          "journalPage"
        );

        loadJournals(key);

        updateWeeklyJournalAvailability();
      }
    );

    calendarGrid.appendChild(
      cell
    );
  }
}

if (prevMonth) {
  prevMonth.addEventListener(
    "click",
    () => {

      calendarDate =
        new Date(
          calendarDate.getFullYear(),
          calendarDate.getMonth() - 1,
          1
        );

      renderCalendar();
    }
  );
}

if (nextMonth) {
  nextMonth.addEventListener(
    "click",
    () => {

      calendarDate =
        new Date(
          calendarDate.getFullYear(),
          calendarDate.getMonth() + 1,
          1
        );

      renderCalendar();
    }
  );
}

/* =========================================================
   JOURNAL QUOTIDIEN
========================================================= */

function updateJournalDateTitle() {

  if (!dailyJournalTitle) {
    return;
  }

  const date =
    new Date(
      selectedJournalDate +
      "T00:00:00"
    );

  const today =
    dateKey(new Date());

  if (
    selectedJournalDate ===
    today
  ) {

    dailyJournalTitle.textContent =
      "Comment te sens-tu ?";

    return;
  }

  const label =
    date.toLocaleDateString(
      "fr-FR",
      {
        weekday: "long",
        day: "numeric",
        month: "long"
      }
    );

  dailyJournalTitle.textContent =
    `Ton journal du ${label}`;
}

function loadDailyFeelings(
  date
) {

  const saved =
    data.dailyJournal[date];

  const feelings =
    saved?.feelings || [];

  document
    .querySelectorAll(
      ".feeling-option input"
    )
    .forEach(input => {

      input.checked =
        feelings.includes(
          input.value
        );
    });
}

function loadJournals(
  date = selectedJournalDate
) {

  selectedJournalDate =
    date;

  const savedDaily =
    data.dailyJournal[date];

  if (dailyJournal) {
    dailyJournal.value =
      savedDaily?.text || "";
  }

  loadDailyFeelings(date);

  updateJournalDateTitle();

  /*
    Quand on consulte un jour précis,
    on affiche aussi le bilan de la semaine
    correspondante.
  */
  selectedWeeklyWeekKey =
    getWeekKeyForDate(
      new Date(
        date + "T00:00:00"
      )
    );

  loadWeeklyJournal(
    selectedWeeklyWeekKey
  );
}

if (saveDaily) {

  saveDaily.addEventListener(
    "click",
    () => {

      const feelings =
        [
          ...document.querySelectorAll(
            ".feeling-option input:checked"
          )
        ].map(
          input =>
            input.value
        );

      data.dailyJournal[
        selectedJournalDate
      ] = {
        text:
          dailyJournal
            ? dailyJournal.value
            : "",
        feelings
      };

      saveData();

      saveDaily.textContent =
        "Enregistré ✓";

      /*
        Rafraîchit le calendrier :
        le petit point apparaît immédiatement.
      */
      renderCalendar();

      setTimeout(() => {
        saveDaily.textContent =
          "Enregistrer";
      }, 1800);
    }
  );
}

/* =========================================================
   BILAN HEBDOMADAIRE
========================================================= */

const positiveOptions = [
  "Sereine",
  "Énergique",
  "Productive",
  "Épanouissante"
];

const negativeOptions = [
  "Fatigue",
  "Stress",
  "Manque de temps",
  "Difficultés"
];

function renderChoiceLists() {

  const positiveContainer =
    document.getElementById(
      "positiveChoices"
    );

  const negativeContainer =
    document.getElementById(
      "negativeChoices"
    );

  if (
    !positiveContainer ||
    !negativeContainer
  ) {
    return;
  }

  positiveContainer.innerHTML =
    positiveOptions
      .map(
        (option, index) => `
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
        `
      )
      .join("");

  negativeContainer.innerHTML =
    negativeOptions
      .map(
        (option, index) => `
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
        `
      )
      .join("");
}

/*
  Le bilan de la semaine courante reste soumis
  à la règle existante :
  dimanche à partir de 19h + lundi.

  En revanche, les anciens bilans enregistrés
  restent toujours consultables/modifiables.
*/
function isWeeklyJournalAvailable() {

  const now =
    new Date();

  const day =
    now.getDay();

  const hour =
    now.getHours();

  if (
    day === 0 &&
    hour >= 19
  ) {
    return true;
  }

  if (day === 1) {
    return true;
  }

  return false;
}

/*
  Renvoie la clé de la semaine
  correspondant au lundi de la date.
*/
function getWeekKeyForDate(date) {

  return dateKey(
    getMonday(date)
  );
}

/*
  Affichage :
  7 septembre — 13 septembre 2026
*/
function formatWeekRange(
  weekKey
) {

  const monday =
    new Date(
      weekKey +
      "T00:00:00"
    );

  const sunday =
    new Date(monday);

  sunday.setDate(
    monday.getDate() + 6
  );

  return `${monday.toLocaleDateString(
    "fr-FR",
    {
      day: "numeric",
      month: "long"
    }
  )} — ${sunday.toLocaleDateString(
    "fr-FR",
    {
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  )}`;
}

/*
  Flèche précédente / suivante.
*/
function shiftWeeklyHistory(
  amount
) {

  const current =
    new Date(
      selectedWeeklyWeekKey +
      "T00:00:00"
    );

  current.setDate(
    current.getDate() +
    amount * 7
  );

  selectedWeeklyWeekKey =
    dateKey(current);

  loadWeeklyJournal(
    selectedWeeklyWeekKey
  );
}

/*
  Charge le bilan de la semaine choisie.
*/
function loadWeeklyJournal(
  weekKey = selectedWeeklyWeekKey
) {

  selectedWeeklyWeekKey =
    weekKey;

  const journal =
    data.weeklyJournals[
      weekKey
    ];

  const currentWeekKey =
    getWeekKeyForDate(
      new Date()
    );

  const isCurrentWeek =
    weekKey ===
    currentWeekKey;

  const isFuture =
    weekKey >
    currentWeekKey;

  /*
    Un ancien journal existe :
    il est consultable et modifiable.

    La semaine courante :
    elle reste soumise à la règle
    dimanche 19h / lundi.

    Une semaine passée sans journal :
    elle reste simplement vide.
  */
  const canEdit =
    Boolean(journal) ||
    (
      isCurrentWeek &&
      isWeeklyJournalAvailable()
    );

  if (weeklyHistoryRange) {

    weeklyHistoryRange.textContent =
      formatWeekRange(
        weekKey
      );
  }

  if (weeklyJournalTitle) {

    weeklyJournalTitle.textContent =
      isCurrentWeek
        ? "Comment s'est passée ta semaine ?"
        : "Ton bilan de la semaine";
  }

  if (
    weeklyContent &&
    weeklyJournalCard
  ) {

    if (canEdit) {

      weeklyContent.classList.remove(
        "hidden"
      );

      weeklyJournalCard.classList.remove(
        "locked"
      );

    } else {

      weeklyContent.classList.add(
        "hidden"
      );

      weeklyJournalCard.classList.add(
        "locked"
      );
    }
  }

  if (weeklyAvailability) {

    if (journal) {

      weeklyAvailability.textContent =
        isCurrentWeek
          ? "Ton bilan est enregistré. Tu peux encore le modifier."
          : "Bilan enregistré. Tu peux le relire et le modifier.";

    } else if (isCurrentWeek) {

      weeklyAvailability.textContent =
        isWeeklyJournalAvailable()
          ? "Ton bilan de la semaine est ouvert."
          : "Le bilan s'ouvre dimanche à 19h et reste disponible jusqu'au lundi soir.";

    } else if (isFuture) {

      weeklyAvailability.textContent =
        "Cette semaine n'est pas encore disponible.";

    } else {

      weeklyAvailability.textContent =
        "Aucun bilan enregistré pour cette semaine.";
    }
  }

  if (weeklyHistoryStatus) {

    weeklyHistoryStatus.textContent =
      journal
        ? "✓ Un bilan est enregistré pour cette semaine."
        : "Aucun bilan enregistré pour cette semaine.";
  }

  /*
    La flèche précédente est toujours possible.

    La flèche suivante est désactivée
    lorsque l'on atteint la semaine actuelle.
  */
  if (prevWeekly) {
    prevWeekly.disabled = false;
  }

  if (nextWeekly) {
    nextWeekly.disabled =
      weekKey >= currentWeekKey;
  }

  /*
    Si la semaine n'est pas éditable,
    on ne touche pas aux champs.
  */
  if (!canEdit) {
    return;
  }

  if (positive1) {
    positive1.value =
      journal?.positive1 || "";
  }

  if (positive2) {
    positive2.value =
      journal?.positive2 || "";
  }

  if (positive3) {
    positive3.value =
      journal?.positive3 || "";
  }

  if (weeklyText) {
    weeklyText.value =
      journal?.text || "";
  }

  /*
    Recharge les choix positifs/négatifs
    du bilan enregistré.
  */
  document
    .querySelectorAll(
      '[data-category="positiveChoices"], [data-category="negativeChoices"]'
    )
    .forEach(input => {

      const category =
        input.dataset.category;

      input.checked =
        journal?.[category]
          ?.includes(
            input.value
          ) || false;
    });
}

function updateWeeklyJournalAvailability() {

  loadWeeklyJournal(
    selectedWeeklyWeekKey
  );
}

function getWeekKey() {

  return selectedWeeklyWeekKey;
}

/*
  Flèche semaine précédente.
*/
if (prevWeekly) {

  prevWeekly.addEventListener(
    "click",
    () => {

      shiftWeeklyHistory(-1);
    }
  );
}

/*
  Flèche semaine suivante.
*/
if (nextWeekly) {

  nextWeekly.addEventListener(
    "click",
    () => {

      shiftWeeklyHistory(1);
    }
  );
}

/*
  Sauvegarde du bilan.

  IMPORTANT :
  on sauvegarde maintenant dans la semaine
  actuellement sélectionnée et non systématiquement
  dans la semaine actuelle.
*/
if (saveWeekly) {

  saveWeekly.addEventListener(
    "click",
    () => {

      const currentWeekKey =
        getWeekKeyForDate(
          new Date()
        );

      const existingJournal =
        data.weeklyJournals[
          selectedWeeklyWeekKey
        ];

      const canEdit =
        Boolean(existingJournal) ||
        (
          selectedWeeklyWeekKey ===
          currentWeekKey &&
          isWeeklyJournalAvailable()
        );

      if (!canEdit) {
        return;
      }

      if (
        !positive1?.value.trim() ||
        !positive2?.value.trim() ||
        !positive3?.value.trim()
      ) {

        alert(
          "Il manque encore une des trois choses positives de ta semaine."
        );

        return;
      }

      const positiveChoices =
        [
          ...document.querySelectorAll(
            '[data-category="positiveChoices"]:checked'
          )
        ].map(
          input =>
            input.value
        );

      const negativeChoices =
        [
          ...document.querySelectorAll(
            '[data-category="negativeChoices"]:checked'
          )
        ].map(
          input =>
            input.value
        );

      data.weeklyJournals[
        selectedWeeklyWeekKey
      ] = {

        positiveChoices,

        negativeChoices,

        positive1:
          positive1.value,

        positive2:
          positive2.value,

        positive3:
          positive3.value,

        text:
          weeklyText?.value || ""
      };

      saveData();

      /*
        Recharge immédiatement le bilan
        enregistré.
      */
      loadWeeklyJournal(
        selectedWeeklyWeekKey
      );

      saveWeekly.textContent =
        "Bilan enregistré ✓";

      setTimeout(() => {

        saveWeekly.textContent =
          "Enregistrer mon bilan";

      }, 1800);
    }
  );
}

/* =========================================================
   RECAP MENSUEL
========================================================= */

function renderMonthlyRecap() {

  if (!monthlyRecap) {
    return;
  }

  if (data.habits.length === 0) {

    monthlyRecap.innerHTML =
      `
        <p class="soft-text">
          Ajoute une habitude pour commencer ton suivi.
        </p>
      `;

    return;
  }

  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    now.getMonth();

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  let total = 0;
  let completed = 0;

  data.habits.forEach(habit => {

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {

      total++;

      const key =
        dateKey(
          new Date(
            year,
            month,
            day
          )
        );

      if (
        habit.completed?.[key]
      ) {
        completed++;
      }
    }
  });

  const percentage =
    total === 0
      ? 0
      : Math.round(
          (completed / total) *
          100
        );

  monthlyRecap.innerHTML =
    `
      <div class="recap-number">
        ${percentage}%
      </div>

      <div class="recap-text">
        <strong>
          ${completed} jour${completed > 1 ? "s" : ""}
        </strong>

        <span>
          d'habitudes réalisées ce mois-ci
        </span>
      </div>
    `;
}

/* =========================================================
   MODE DUO
========================================================= */

function generateCode() {

  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (
    let i = 0;
    i < 6;
    i++
  ) {

    code +=
      characters[
        Math.floor(
          Math.random() *
          characters.length
        )
      ];
  }

  return code;
}

if (generateDuo) {

  generateDuo.addEventListener(
    "click",
    () => {

      const code =
        generateCode();

      data.duo = {
        code,
        status: "waiting"
      };

      saveData();
      renderDuo();
    }
  );
}

if (joinDuo) {

  joinDuo.addEventListener(
    "click",
    () => {

      const code =
        duoCodeInput
          ? duoCodeInput.value
              .trim()
              .toUpperCase()
          : "";

      if (code.length !== 6) {

        alert(
          "Le code doit contenir 6 caractères."
        );

        return;
      }

      data.duo = {
        code,
        status: "connected"
      };

      saveData();
      renderDuo();
    }
  );
}

if (leaveDuo) {

  leaveDuo.addEventListener(
    "click",
    () => {

      data.duo = null;

      saveData();
      renderDuo();
    }
  );
}

function renderDuo() {

  if (
    !duoDisconnected ||
    !duoConnected
  ) {
    return;
  }

  if (!data.duo) {

    duoDisconnected.classList.remove(
      "hidden"
    );

    duoConnected.classList.add(
      "hidden"
    );

    return;
  }

  duoDisconnected.classList.add(
    "hidden"
  );

  duoConnected.classList.remove(
    "hidden"
  );

  if (duoCodeDisplay) {

    duoCodeDisplay.textContent =
      `Code : ${data.duo.code}`;
  }
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

if (notificationToggle) {

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

          if (
            permission !==
            "granted"
          ) {
            data.notifications =
              false;
          }

        } catch (error) {

          console.error(
            "Erreur notifications :",
            error
          );

          data.notifications =
            false;
        }
      }

      saveData();
      updateNotificationToggle();
    }
  );
}

function updateNotificationToggle() {

  if (!notificationToggle) {
    return;
  }

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

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );
}

/* =========================================================
   INITIALISATION
========================================================= */

function initialize() {

  try {

    const monday =
      getMonday();

    const sunday =
      getSunday();

    if (weekDates) {

      weekDates.textContent =
        `${formatShortDate(monday)} — ${formatShortDate(sunday)}`;
    }

    selectedJournalDate =
      dateKey(
        new Date()
      );

    /*
      Toujours commencer sur la semaine actuelle.
    */
    selectedWeeklyWeekKey =
      getWeekKeyForDate(
        new Date()
      );

    renderWelcome();

    renderChoiceLists();

    renderHabits();

    renderCalendarHabitSelector();

    renderCalendar();

    renderMonthlyRecap();

    updateNotificationToggle();

    loadJournals(
      selectedJournalDate
    );

    renderDuo();

    console.log(
      "Alizeti initialisée correctement."
    );

  } catch (error) {

    console.error(
      "Erreur pendant l'initialisation d'Alizeti :",
      error
    );
  }
}

/* =========================================================
   LANCEMENT
========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initialize
  );

} else {

  initialize();

}
