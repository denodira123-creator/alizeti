/* =========================================================
   ALIZETI — APP.JS
   Compatible avec le HTML fourni
   Stockage local : localStorage
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================================
     DONNÉES
  ======================================================= */

  const STORAGE_KEY = "alizetiData";

  const defaultData = {
    name: "",
    habits: [],
    journals: {},
    weeklyJournals: {},
    duo: null,
    notifications: false
  };

  let data = loadData();

  let selectedHabitId = null;
  let calendarDate = new Date();
  let selectedCalendarDate = null;
  let selectedGoal = 3;


  /* =======================================================
     DOM
  ======================================================= */

  const $ = (id) => document.getElementById(id);

  const homePage = $("homePage");
  const calendarPage = $("calendarPage");
  const journalPage = $("journalPage");
  const settingsPage = $("settingsPage");

  const pages = [homePage, calendarPage, journalPage, settingsPage];

  const habitsList = $("habitsList");
  const addHabitBtn = $("addHabitBtn");

  const habitModal = $("habitModal");
  const closeModal = $("closeModal");
  const habitName = $("habitName");
  const saveHabit = $("saveHabit");

  const welcomeName = $("welcomeName");
  const welcomeTitle = $("welcomeTitle");
  const weekDates = $("weekDates");
  const monthlyRecap = $("monthlyRecap");

  const calendarHabitSelector = $("calendarHabitSelector");
  const calendarHabitInfo = $("calendarHabitInfo");
  const calendarGrid = $("calendarGrid");
  const calendarTitle = $("calendarTitle");
  const prevMonth = $("prevMonth");
  const nextMonth = $("nextMonth");

  const calendarJournalCard = $("calendarJournalCard");
  const calendarJournalTitle = $("calendarJournalTitle");
  const calendarJournalContent = $("calendarJournalContent");

  const dailyJournal = $("dailyJournal");
  const saveDaily = $("saveDaily");

  const weeklyAvailability = $("weeklyAvailability");
  const weeklyContent = $("weeklyContent");
  const saveWeekly = $("saveWeekly");

  const userName = $("userName");
  const saveName = $("saveName");

  const generateDuo = $("generateDuo");
  const joinDuo = $("joinDuo");
  const duoCodeInput = $("duoCodeInput");
  const duoDisconnected = $("duoDisconnected");
  const duoConnected = $("duoConnected");
  const duoCodeDisplay = $("duoCodeDisplay");
  const leaveDuo = $("leaveDuo");

  const notificationToggle = $("notificationToggle");


  /* =======================================================
     UTILITAIRES
  ======================================================= */

  function loadData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return structuredClone(defaultData);
      }

      return {
        ...structuredClone(defaultData),
        ...JSON.parse(saved)
      };

    } catch (error) {
      console.error("Erreur de chargement :", error);
      return structuredClone(defaultData);
    }
  }


  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }


  function escapeHTML(value) {
    if (value === null || value === undefined) return "";

    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }


  function dateKey(date) {
    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }


  function formatDate(date) {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  }


  function formatShortDate(date) {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short"
    }).format(date);
  }


  function capitalize(text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  }


  function getHabitById(id) {
    return data.habits.find(habit => habit.id === id);
  }


  function isHabitCompleted(habit, date) {
    const key = dateKey(date);

    return Array.isArray(habit.completed)
      && habit.completed.includes(key);
  }


  function toggleHabitCompletion(habit, date) {
    const key = dateKey(date);

    if (!Array.isArray(habit.completed)) {
      habit.completed = [];
    }

    const index = habit.completed.indexOf(key);

    if (index >= 0) {
      habit.completed.splice(index, 1);
    } else {
      habit.completed.push(key);
    }

    saveData();
  }


  function getJournal(date) {
    return data.journals[dateKey(date)] || null;
  }


  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();

    const diff = day === 0 ? -6 : 1 - day;

    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);

    return d;
  }


  /* =======================================================
     NAVIGATION
  ======================================================= */

  document.querySelectorAll(".nav-item").forEach(button => {

    button.addEventListener("click", () => {

      const pageId = button.dataset.page;

      showPage(pageId);

    });

  });


  function showPage(pageId) {

    pages.forEach(page => {
      if (page) {
        page.classList.toggle("active", page.id === pageId);
      }
    });

    document.querySelectorAll(".nav-item").forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.page === pageId
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
    }

    if (pageId === "journalPage") {
      renderJournalPage();
    }

    if (pageId === "settingsPage") {
      renderSettings();
    }
  }


  if ($("settingsBtn")) {
    $("settingsBtn").addEventListener("click", () => {
      showPage("settingsPage");
    });
  }


  /* =======================================================
     ACCUEIL
  ======================================================= */

  function renderHome() {

    if (!habitsList) return;

    const name = data.name.trim();

    welcomeName.textContent =
      name ? `BONJOUR ${name.toUpperCase()}` : "ALIZETI";

    welcomeTitle.textContent =
      name
        ? `Bienvenue ${name}`
        : "Bienvenue sur Alizeti";

    renderWeekDates();
    renderHabits();
    renderMonthlyRecap();
  }


  function renderWeekDates() {

    const start = getWeekStart(new Date());

    const dates = [];

    for (let i = 0; i < 7; i++) {

      const d = new Date(start);
      d.setDate(start.getDate() + i);

      dates.push(formatShortDate(d));
    }

    weekDates.textContent = dates.join("  ·  ");
  }


  function renderHabits() {

    habitsList.innerHTML = "";

    if (data.habits.length === 0) {

      habitsList.innerHTML = `
        <div class="empty-state">
          <h3>Commence doucement 🌱</h3>
          <p>Ajoute une première habitude pour commencer ton suivi.</p>
        </div>
      `;

      return;
    }


    const today = new Date();

    data.habits.forEach(habit => {

      const completed = isHabitCompleted(habit, today);

      const card = document.createElement("div");

      card.className =
        `habit-card ${completed ? "completed" : ""}`;

      card.innerHTML = `

        <div class="habit-main">

          <button
            class="habit-check ${completed ? "checked" : ""}"
            data-habit="${habit.id}"
            aria-label="Marquer l'habitude"
          >
            ${completed ? "✓" : ""}
          </button>

          <div class="habit-text">

            <strong>
              ${escapeHTML(habit.name)}
            </strong>

            <span>
              Objectif : ${habit.goal} jour${habit.goal > 1 ? "s" : ""}/semaine
            </span>

          </div>

        </div>

        <button
          class="habit-delete"
          data-delete="${habit.id}"
          aria-label="Supprimer"
        >
          ×
        </button>
      `;

      habitsList.appendChild(card);
    });


    document.querySelectorAll(".habit-check").forEach(button => {

      button.addEventListener("click", () => {

        const habit = getHabitById(button.dataset.habit);

        if (!habit) return;

        toggleHabitCompletion(habit, new Date());

        renderHome();
      });

    });


    document.querySelectorAll(".habit-delete").forEach(button => {

      button.addEventListener("click", () => {

        const id = button.dataset.delete;

        data.habits =
          data.habits.filter(habit => habit.id !== id);

        if (selectedHabitId === id) {
          selectedHabitId = null;
        }

        saveData();
        renderHome();
      });

    });
  }


  function renderMonthlyRecap() {

    if (!monthlyRecap) return;

    if (data.habits.length === 0) {

      monthlyRecap.innerHTML = `
        <p class="soft-text">
          Ton suivi apparaîtra ici au fil des jours.
        </p>
      `;

      return;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const daysInMonth =
      new Date(year, month + 1, 0).getDate();

    let total = 0;

    data.habits.forEach(habit => {

      for (let day = 1; day <= daysInMonth; day++) {

        const date = new Date(year, month, day);

        if (isHabitCompleted(habit, date)) {
          total++;
        }
      }
    });


    monthlyRecap.innerHTML = `
      <div class="recap-number">
        ${total}
      </div>

      <div>
        <strong>réalisation${total > 1 ? "s" : ""}</strong>
        <p>Ce mois-ci</p>
      </div>
    `;
  }


  /* =======================================================
     MODAL HABITUDE
  ======================================================= */

  addHabitBtn.addEventListener("click", openHabitModal);


  function openHabitModal() {

    habitModal.classList.remove("hidden");

    habitName.value = "";

    selectedGoal = 3;

    document
      .querySelectorAll(".goal-options button")
      .forEach(button => {

        button.classList.toggle(
          "selected",
          Number(button.dataset.goal) === selectedGoal
        );

      });

    setTimeout(() => {
      habitName.focus();
    }, 50);
  }


  closeModal.addEventListener("click", closeHabitModal);


  habitModal.addEventListener("click", event => {

    if (event.target === habitModal) {
      closeHabitModal();
    }

  });


  function closeHabitModal() {
    habitModal.classList.add("hidden");
  }


  document
    .querySelectorAll(".goal-options button")
    .forEach(button => {

      button.addEventListener("click", () => {

        selectedGoal =
          Number(button.dataset.goal);

        document
          .querySelectorAll(".goal-options button")
          .forEach(btn => {

            btn.classList.toggle(
              "selected",
              btn === button
            );

          });

      });

    });


  saveHabit.addEventListener("click", () => {

    const name = habitName.value.trim();

    if (!name) {
      habitName.focus();
      return;
    }

    const habit = {
      id:
        `${Date.now()}-${Math.random().toString(36).slice(2)}`,

      name,

      goal: selectedGoal,

      completed: []
    };

    data.habits.push(habit);

    saveData();

    closeHabitModal();

    renderHome();
  });


  habitName.addEventListener("keydown", event => {

    if (event.key === "Enter") {
      saveHabit.click();
    }

  });


  /* =======================================================
     CALENDRIER
  ======================================================= */

  function renderCalendar() {

    renderCalendarHabitSelector();

    if (data.habits.length === 0) {

      calendarHabitInfo.innerHTML = `
        <p class="soft-text">
          Ajoute d'abord une habitude depuis l'accueil.
        </p>
      `;

      calendarGrid.innerHTML = "";

      calendarJournalCard.classList.add("hidden");

      return;
    }


    if (!selectedHabitId ||
        !getHabitById(selectedHabitId)) {

      selectedHabitId = data.habits[0].id;
    }


    const habit = getHabitById(selectedHabitId);

    calendarHabitInfo.innerHTML = `
      <strong>${escapeHTML(habit.name)}</strong>
      <span>
        Objectif : ${habit.goal} jour${habit.goal > 1 ? "s" : ""}/semaine
      </span>
    `;


    renderCalendarGrid(habit);
  }


  function renderCalendarHabitSelector() {

    calendarHabitSelector.innerHTML = "";

    data.habits.forEach(habit => {

      const button = document.createElement("button");

      button.className =
        `calendar-habit-button ${
          habit.id === selectedHabitId ? "selected" : ""
        }`;

      button.textContent = habit.name;

      button.addEventListener("click", () => {

        selectedHabitId = habit.id;

        selectedCalendarDate = null;

        renderCalendar();

      });

      calendarHabitSelector.appendChild(button);
    });
  }


  function renderCalendarGrid(habit) {

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    calendarTitle.textContent =
      new Intl.DateTimeFormat("fr-FR", {
        month: "long",
        year: "numeric"
      }).format(calendarDate);

    calendarTitle.textContent =
      capitalize(calendarTitle.textContent);


    calendarGrid.innerHTML = "";


    const firstDay =
      new Date(year, month, 1).getDay();

    const mondayIndex =
      firstDay === 0 ? 6 : firstDay - 1;

    const daysInMonth =
      new Date(year, month + 1, 0).getDate();


    for (let i = 0; i < mondayIndex; i++) {

      const empty = document.createElement("div");

      empty.className = "calendar-day empty";

      calendarGrid.appendChild(empty);
    }


    for (let day = 1; day <= daysInMonth; day++) {

      const date = new Date(year, month, day);

      const key = dateKey(date);

      const completed = isHabitCompleted(habit, date);

      const journal = getJournal(date);

      const hasJournal =
        journal &&
        (
          journal.text?.trim() ||
          (Array.isArray(journal.feelings) &&
           journal.feelings.length > 0)
        );


      const cell = document.createElement("button");

      cell.type = "button";

      cell.className = "calendar-day";

      if (completed) {
        cell.classList.add("habit-completed");
      }

      if (selectedCalendarDate === key) {
        cell.classList.add("selected");
      }


      cell.innerHTML = `

        <span class="calendar-number">
          ${day}
        </span>

        ${
          hasJournal
            ? `<span class="journal-dot ${
                completed ? "white" : "blue"
              }"></span>`
            : ""
        }

      `;


      cell.addEventListener("click", () => {

        selectedCalendarDate = key;

        renderCalendarGrid(habit);

        showCalendarJournal(date);
      });


      calendarGrid.appendChild(cell);
    }


    if (
      selectedCalendarDate &&
      selectedCalendarDate.startsWith(
        `${year}-${String(month + 1).padStart(2, "0")}`
      )
    ) {

      showCalendarJournal(
        new Date(`${selectedCalendarDate}T12:00:00`)
      );

    } else {

      calendarJournalCard.classList.add("hidden");
    }
  }


  prevMonth.addEventListener("click", () => {

    calendarDate.setMonth(
      calendarDate.getMonth() - 1
    );

    selectedCalendarDate = null;

    calendarJournalCard.classList.add("hidden");

    renderCalendar();
  });


  nextMonth.addEventListener("click", () => {

    calendarDate.setMonth(
      calendarDate.getMonth() + 1
    );

    selectedCalendarDate = null;

    calendarJournalCard.classList.add("hidden");

    renderCalendar();
  });


  /* =======================================================
     JOURNAL SOUS LE CALENDRIER
  ======================================================= */

  function showCalendarJournal(date) {

    const journal = getJournal(date);

    calendarJournalCard.classList.remove("hidden");

    calendarJournalTitle.textContent =
      capitalize(formatDate(date));


    if (!journal) {

      calendarJournalContent.innerHTML = `
        <div class="empty-journal">
          <p>Aucun journal rempli ce jour-là.</p>
        </div>
      `;

      return;
    }


    const feelings =
      Array.isArray(journal.feelings)
        ? journal.feelings
        : [];


    calendarJournalContent.innerHTML = `

      ${
        feelings.length
          ? `
            <div class="journal-feelings">
              ${feelings.map(feeling => `
                <span class="journal-feeling">
                  ${escapeHTML(feeling)}
                </span>
              `).join("")}
            </div>
          `
          : ""
      }

      ${
        journal.text?.trim()
          ? `
            <div class="journal-entry">
              ${escapeHTML(journal.text).replace(/\n/g, "<br>")}
            </div>
          `
          : `
            <p class="soft-text">
              Aucune note écrite pour cette journée.
            </p>
          `
      }

    `;
  }


  /* =======================================================
     JOURNAL QUOTIDIEN
  ======================================================= */

  function renderJournalPage() {

    const todayKey = dateKey(new Date());

    const journal = data.journals[todayKey];


    document
      .querySelectorAll(".feeling-option input")
      .forEach(input => {

        input.checked =
          journal?.feelings?.includes(input.value) || false;
      });


    dailyJournal.value =
      journal?.text || "";


    renderWeeklyJournal();
  }


  saveDaily.addEventListener("click", () => {

    const today = dateKey(new Date());

    const feelings = Array.from(
      document.querySelectorAll(
        ".feeling-option input:checked"
      )
    ).map(input => input.value);


    const text = dailyJournal.value.trim();


    data.journals[today] = {
      feelings,
      text
    };


    saveData();

    saveDaily.textContent = "Enregistré ✓";

    setTimeout(() => {
      saveDaily.textContent = "Enregistrer";
    }, 1500);


    if (selectedCalendarDate === today) {

      const habit = getHabitById(selectedHabitId);

      if (habit) {
        renderCalendarGrid(habit);
      }

      showCalendarJournal(new Date());
    }
  });


  /* =======================================================
     BILAN HEBDOMADAIRE
  ======================================================= */

  const positiveChoices = [
    "J'ai été régulier·ère",
    "Je me suis senti·e bien",
    "J'ai pris du temps pour moi",
    "J'ai progressé"
  ];

  const negativeChoices = [
    "J'ai manqué de temps",
    "J'ai manqué de motivation",
    "J'ai été stressé·e",
    "J'ai eu du mal à être régulier·ère"
  ];


  function renderChoiceButtons(container, choices) {

    container.innerHTML = "";

    choices.forEach(choice => {

      const button = document.createElement("button");

      button.type = "button";
      button.className = "choice-button";
      button.textContent = choice;

      button.addEventListener("click", () => {

        button.classList.toggle("selected");
      });

      container.appendChild(button);
    });
  }


  function renderWeeklyJournal() {

    const start = getWeekStart(new Date());
    const key = dateKey(start);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const journalsAvailable =
      Array.from({ length: 7 }).some((_, index) => {

        const date = new Date(start);

        date.setDate(start.getDate() + index);

        const journal = getJournal(date);

        return journal &&
          (
            journal.text?.trim() ||
            journal.feelings?.length
          );
      });


    weeklyAvailability.textContent =
      journalsAvailable
        ? "Ton bilan de la semaine est disponible."
        : "Remplis quelques journaux cette semaine pour préparer ton bilan.";


    weeklyContent.classList.toggle(
      "hidden",
      !journalsAvailable
    );


    if (!journalsAvailable) return;


    renderChoiceButtons(
      positiveChoices ? $("positiveChoices") : null,
      positiveChoices
    );

    renderChoiceButtons(
      negativeChoices ? $("negativeChoices") : null,
      negativeChoices
    );


    const saved = data.weeklyJournals[key];

    if (saved) {

      document
        .querySelectorAll("#positiveChoices .choice-button")
        .forEach(button => {

          button.classList.toggle(
            "selected",
            saved.positive?.includes(button.textContent)
          );

        });


      document
        .querySelectorAll("#negativeChoices .choice-button")
        .forEach(button => {

          button.classList.toggle(
            "selected",
            saved.negative?.includes(button.textContent)
          );

        });


      $("positive1").value = saved.positive1 || "";
      $("positive2").value = saved.positive2 || "";
      $("positive3").value = saved.positive3 || "";
      $("weeklyText").value = saved.text || "";
    }
  }


  saveWeekly.addEventListener("click", () => {

    const start = getWeekStart(new Date());

    const key = dateKey(start);


    const positive = Array.from(
      document.querySelectorAll(
        "#positiveChoices .choice-button.selected"
      )
    ).map(button => button.textContent);


    const negative = Array.from(
      document.querySelectorAll(
        "#negativeChoices .choice-button.selected"
      )
    ).map(button => button.textContent);


    data.weeklyJournals[key] = {

      positive,

      negative,

      positive1: $("positive1").value.trim(),

      positive2: $("positive2").value.trim(),

      positive3: $("positive3").value.trim(),

      text: $("weeklyText").value.trim()
    };


    saveData();

    saveWeekly.textContent = "Bilan enregistré ✓";

    setTimeout(() => {
      saveWeekly.textContent = "Enregistrer mon bilan";
    }, 1500);
  });


  /* =======================================================
     REGLAGES
  ======================================================= */

  function renderSettings() {

    userName.value = data.name || "";

    notificationToggle.classList.toggle(
      "active",
      Boolean(data.notifications)
    );


    if (data.duo) {

      duoDisconnected.classList.add("hidden");
      duoConnected.classList.remove("hidden");

      duoCodeDisplay.textContent =
        `Code : ${data.duo}`;

    } else {

      duoDisconnected.classList.remove("hidden");
      duoConnected.classList.add("hidden");
    }
  }


  saveName.addEventListener("click", () => {

    data.name = userName.value.trim();

    saveData();

    renderHome();

    saveName.textContent = "Enregistré ✓";

    setTimeout(() => {
      saveName.textContent = "Enregistrer";
    }, 1500);
  });


  generateDuo.addEventListener("click", () => {

    const code =
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    data.duo = code;

    saveData();

    renderSettings();
  });


  joinDuo.addEventListener("click", () => {

    const code =
      duoCodeInput.value.trim().toUpperCase();

    if (code.length !== 6) {
      duoCodeInput.focus();
      return;
    }

    data.duo = code;

    saveData();

    duoCodeInput.value = "";

    renderSettings();
  });


  leaveDuo.addEventListener("click", () => {

    data.duo = null;

    saveData();

    renderSettings();
  });


  notificationToggle.addEventListener("click", () => {

    data.notifications =
      !data.notifications;

    saveData();

    notificationToggle.classList.toggle(
      "active",
      data.notifications
    );
  });


  /* =======================================================
     INITIALISATION
  ======================================================= */

  renderHome();

  showPage("homePage");

});
