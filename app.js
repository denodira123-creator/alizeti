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



const settingsBtn = document.getElementById("settingsBtn");



const addHabitBtn = document.getElementById("addHabitBtn");

const habitModal = document.getElementById("habitModal");

const closeModal = document.getElementById("closeModal");

const habitName = document.getElementById("habitName");

const saveHabitBtn = document.getElementById("saveHabit");

const goalButtons = document.querySelectorAll(

  ".goal-options button"

);



const habitsList = document.getElementById("habitsList");

const weekDates = document.getElementById("weekDates");

const welcomeName = document.getElementById("welcomeName");



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



const weeklyJournalCard =

  document.getElementById("weeklyJournalCard");



const weeklyAvailability =

  document.getElementById("weeklyAvailability");



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

let selectedJournalDate = dateKey(new Date());
let selectedWeeklyWeekKey = dateKey(getMonday(new Date()));



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

      userName.value = data.userName || "";

    }



    renderDuo();

  }

}



navItems.forEach(item => {

  item.addEventListener("click", () => {

    if (item.dataset.page === "journalPage") {

      selectedJournalDate = dateKey(new Date());

    }



    showPage(item.dataset.page);

  });

});



if (settingsBtn) {

  settingsBtn.addEventListener("click", () => {

    showPage("settingsPage");

  });

}



/* =========================================================

   NOM

========================================================= */



if (saveName) {

  saveName.addEventListener("click", () => {

    data.userName = userName

      ? userName.value.trim()

      : "";



    saveData();

    renderWelcome();



    saveName.textContent = "Enregistré ✓";



    setTimeout(() => {

      saveName.textContent = "Enregistrer";

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

  addHabitBtn.addEventListener("click", () => {

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

      habitModal.classList.remove("hidden");

    }



    setTimeout(() => {

      if (habitName) {

        habitName.focus();

      }

    }, 100);

  });

}



if (closeModal) {

  closeModal.addEventListener("click", () => {

    if (habitModal) {

      habitModal.classList.add("hidden");

    }

  });

}



if (habitModal) {

  habitModal.addEventListener("click", event => {

    if (event.target === habitModal) {

      habitModal.classList.add("hidden");

    }

  });

}



goalButtons.forEach(button => {

  button.addEventListener("click", () => {

    selectedGoal = Number(

      button.dataset.goal

    );



    goalButtons.forEach(item => {

      item.classList.toggle(

        "selected",

        item === button

      );

    });

  });

});



/* =========================================================

   CREATION HABITUDE

========================================================= */



if (saveHabitBtn) {

  saveHabitBtn.addEventListener("click", () => {

    const name = habitName

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



    if (selectedCalendarHabitId === null) {

      selectedCalendarHabitId = habit.id;

    }



    saveData();



    if (habitModal) {

      habitModal.classList.add("hidden");

    }



    renderHabits();

    renderCalendarHabitSelector();

    renderCalendar();

    renderMonthlyRecap();

  });

}



/* =========================================================

   HABITUDES

========================================================= */



function countWeekCompleted(habit) {

  return getWeekDays().filter(day => {

    return Boolean(

      habit.completed &&

      habit.completed[dateKey(day)]

    );

  }).length;

}



function renderHabits() {

  if (!habitsList) return;



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

    if (!habit.completed) {

      habit.completed = {};

    }



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

      (goalReached

        ? " completed-goal"

        : "");



    const daysHTML =

      days.map((day, index) => {

        const key = dateKey(day);



        const checked =

          Boolean(habit.completed[key]);



        const today =

          key === dateKey(new Date());



        return `

          <div class="day">



            <button

              type="button"

              class="day-circle

                ${checked ? "checked" : ""}

                ${today ? "today" : ""}"

              data-habit="${habit.id}"

              data-date="${key}"

              aria-label="Marquer ${formatShortDate(day)}"

            >

              ${checked ? "✓" : ""}

            </button>



            <span>${dayNames[index]}</span>



          </div>

        `;

      }).join("");



    const remaining =

      Math.max(

        habit.goal - completed,

        0

      );



    card.innerHTML = `

      <div class="habit-top">



        <div>

          <div class="habit-name">

            ${escapeHTML(habit.name)}

          </div>



          <div class="habit-progress">

            <strong>

              ${completed}/${habit.goal}

            </strong>

            jours cette semaine

          </div>

        </div>



        <button

          type="button"

          class="delete-habit"

          data-delete="${habit.id}"

          aria-label="Supprimer ${escapeHTML(habit.name)}"

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

            : `

              ${remaining}

              jour${remaining > 1 ? "s" : ""}

              restant${remaining > 1 ? "s" : ""}

            `

        }

      </div>



      ${

        surpassed

          ? `

            <div class="habit-celebration">

              🔥 Tu t'es surpassé·e

              sur cette habitude.

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

  document

    .querySelectorAll(".day-circle")

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



        if (!habit.completed) {

          habit.completed = {};

        }



        habit.completed[date] =

          !habit.completed[date];



        saveData();



        renderHabits();

        renderCalendar();

        renderMonthlyRecap();

      });

    });



  document

    .querySelectorAll(".delete-habit")

    .forEach(button => {

      button.addEventListener("click", () => {

        const id =

          Number(button.dataset.delete);



        if (

          !confirm(

            "Supprimer cette habitude ?"

          )

        ) {

          return;

        }



        data.habits =

          data.habits.filter(

            habit => habit.id !== id

          );



        if (

          selectedCalendarHabitId === id

        ) {

          selectedCalendarHabitId =

            data.habits[0]?.id || null;

        }



        saveData();



        renderHabits();

        renderCalendarHabitSelector();

        renderCalendar();

        renderMonthlyRecap();

      });

    });

}



/* =========================================================

   CALENDRIER — CHOIX HABITUDE

========================================================= */



function renderCalendarHabitSelector() {

  if (!calendarHabitSelector) return;



  calendarHabitSelector.innerHTML = "";



  if (!data.habits.length) {

    if (calendarHabitInfo) {

      calendarHabitInfo.innerHTML = "";

    }



    return;

  }



  const selectedExists =

    data.habits.some(

      habit =>

        habit.id ===

        selectedCalendarHabitId

    );



  if (!selectedExists) {

    selectedCalendarHabitId =

      data.habits[0].id;

  }



  data.habits.forEach(habit => {

    const button =

      document.createElement("button");



    button.type = "button";

    button.className =

      "calendar-habit-tab";



    button.classList.toggle(

      "selected",

      habit.id ===

        selectedCalendarHabitId

    );



    button.textContent = habit.name;



    button.addEventListener("click", () => {

      selectedCalendarHabitId =

        habit.id;



      renderCalendarHabitSelector();

      renderCalendar();

    });



    calendarHabitSelector.appendChild(

      button

    );

  });

}



/* =========================================================

   CALENDRIER

========================================================= */



function renderCalendar() {

  if (

    !calendarGrid ||

    !calendarTitle

  ) {

    return;

  }



  renderCalendarHabitSelector();



  if (!data.habits.length) {

    calendarTitle.textContent = "";



    calendarGrid.innerHTML = `

      <div

        class="calendar-empty-message"

        style="grid-column:1/-1"

      >

        Ajoute une habitude pour commencer

        à remplir ton calendrier.

      </div>

    `;



    return;

  }



  const habit =

    data.habits.find(

      item =>

        item.id ===

        selectedCalendarHabitId

    );



  if (!habit) return;



  if (!habit.completed) {

    habit.completed = {};

  }



  if (calendarHabitInfo) {

    calendarHabitInfo.innerHTML = `

      <strong>

        ${escapeHTML(habit.name)}

      </strong>

      · objectif :

      ${habit.goal}

      jour${habit.goal > 1 ? "s" : ""}

      / semaine

    `;

  }



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



  for (

    let i = 0;

    i < start;

    i++

  ) {

    const empty =

      document.createElement("div");



    empty.className =

      "calendar-day empty";



    calendarGrid.appendChild(empty);

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



    const completed =

      Boolean(

        habit.completed[key]

      );



    const isToday =

      key === dateKey(new Date());



    const hasJournal =

      Boolean(

        data.dailyJournal[key]

      );



    const cell =

      document.createElement("button");



    cell.type = "button";



    cell.className =

      "calendar-day" +

      (completed

        ? " has-habit"

        : "") +

      (isToday

        ? " today"

        : "") +

      (hasJournal

        ? " has-journal"

        : "");



    cell.textContent = day;



    cell.addEventListener("click", () => {

      selectedJournalDate = key;



      showPage("journalPage");

      loadJournals(key);

      updateWeeklyJournalAvailability();

    });



    calendarGrid.appendChild(cell);

  }

}



if (prevMonth) {

  prevMonth.addEventListener("click", () => {

    calendarDate.setMonth(

      calendarDate.getMonth() - 1

    );



    renderCalendar();

  });

}



if (nextMonth) {

  nextMonth.addEventListener("click", () => {

    calendarDate.setMonth(

      calendarDate.getMonth() + 1

    );



    renderCalendar();

  });

}



/* =========================================================

   RECAP MENSUEL

========================================================= */



function renderMonthlyRecap() {

  if (!monthlyRecap) return;



  if (!data.habits.length) {

    monthlyRecap.textContent =

      "Ajoute une habitude pour commencer ton suivi.";



    return;

  }



  const now = new Date();



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



  monthlyRecap.innerHTML =

    data.habits

      .slice(0, 3)

      .map(habit => {

        if (!habit.completed) {

          habit.completed = {};

        }



        let completed = 0;



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



          if (

            habit.completed[

              dateKey(date)

            ]

          ) {

            completed++;

          }

        }



        const monthlyGoal =

          Math.round(

            habit.goal *

              daysInMonth /

              7

          );



        return `

          <div style="margin-bottom:8px">

            Ce mois-ci, tu as réussi à

            <strong>

              ${escapeHTML(habit.name)}

            </strong>

            <strong>${completed}</strong>

            jour${completed > 1 ? "s" : ""}

            sur

            <strong>${monthlyGoal}</strong>

            fixé${monthlyGoal > 1 ? "s" : ""}.

          </div>

        `;

      })

      .join("");

}



/* =========================================================

   JOURNAL QUOTIDIEN

========================================================= */



function loadDailyFeelings(

  date = selectedJournalDate

) {

  const saved =

    data.dailyJournal[date];



  document

    .querySelectorAll(

      ".feeling-option input"

    )

    .forEach(input => {

      input.checked =

        saved?.feelings?.includes(

          input.value

        ) || false;

    });

}



function updateJournalDateTitle() {

  const title =

    document.getElementById(

      "dailyJournalTitle"

    );



  if (!title) return;



  const today =

    dateKey(new Date());



  if (

    selectedJournalDate === today

  ) {

    title.textContent =

      "Aujourd'hui";



    return;

  }



  const date =

    new Date(

      selectedJournalDate +

        "T00:00:00"

    );



  title.textContent =

    `Journal du ${date.toLocaleDateString(

      "fr-FR",

      {

        day: "numeric",

        month: "long"

      }

    )}`;

}




function getWeekKeyForDate(date) {
  return dateKey(getMonday(date));
}

function formatWeekRange(weekKey) {
  const monday = new Date(weekKey + "T00:00:00");
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return `${monday.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long"
  })} — ${sunday.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  })}`;
}

function shiftWeeklyHistory(amount) {
  const current = new Date(selectedWeeklyWeekKey + "T00:00:00");
  current.setDate(current.getDate() + amount * 7);
  selectedWeeklyWeekKey = dateKey(current);
  loadWeeklyJournal(selectedWeeklyWeekKey);
}

function loadWeeklyJournal(weekKey = selectedWeeklyWeekKey) {
  selectedWeeklyWeekKey = weekKey;

  const journal = data.weeklyJournals[weekKey];
  const currentWeekKey = getWeekKeyForDate(new Date());
  const isCurrentWeek = weekKey === currentWeekKey;
  const isFuture = weekKey > currentWeekKey;
  const canEdit =
    Boolean(journal) ||
    (isCurrentWeek && isWeeklyJournalAvailable());

  if (weeklyHistoryRange) {
    weeklyHistoryRange.textContent = formatWeekRange(weekKey);
  }

  if (weeklyJournalTitle) {
    weeklyJournalTitle.textContent =
      isCurrentWeek
        ? "Comment s'est passée ta semaine ?"
        : "Ton bilan de la semaine";
  }

  if (weeklyContent && weeklyJournalCard) {
    if (canEdit) {
      weeklyContent.classList.remove("hidden");
      weeklyJournalCard.classList.remove("locked");
    } else {
      weeklyContent.classList.add("hidden");
      weeklyJournalCard.classList.add("locked");
    }
  }

  if (weeklyAvailability) {
    if (journal) {
      weeklyAvailability.textContent =
        isCurrentWeek
          ? "Ton bilan est enregistré. Tu peux encore le modifier."
          : "Bilan enregistré. Tu peux le relire et le modifier.";
    } else if (isCurrentWeek) {
      weeklyAvailability.textContent = isWeeklyJournalAvailable()
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
    weeklyHistoryStatus.textContent = journal
      ? "✓ Un bilan est enregistré pour cette semaine."
      : "Aucun bilan enregistré pour cette semaine.";
  }

  if (prevWeekly) prevWeekly.disabled = false;
  if (nextWeekly) nextWeekly.disabled = weekKey >= currentWeekKey;

  if (!canEdit) return;

  if (positive1) positive1.value = journal?.positive1 || "";
  if (positive2) positive2.value = journal?.positive2 || "";
  if (positive3) positive3.value = journal?.positive3 || "";
  if (weeklyText) weeklyText.value = journal?.text || "";

  document
    .querySelectorAll('[data-category="positiveChoices"], [data-category="negativeChoices"]')
    .forEach(input => {
      const category = input.dataset.category;
      input.checked = journal?.[category]?.includes(input.value) || false;
    });
}

function loadJournals(
  date = selectedJournalDate
) {
  selectedJournalDate = date;

  const savedDaily =
    data.dailyJournal[date];

  if (dailyJournal) {
    dailyJournal.value =
      savedDaily?.text || "";
  }

  loadDailyFeelings(date);
  updateJournalDateTitle();
  updateJournalDateNavigation();

  selectedWeeklyWeekKey =
    getWeekKeyForDate(
      new Date(date + "T00:00:00")
    );

  loadWeeklyJournal(
    selectedWeeklyWeekKey
  );
}




function updateJournalDateTitle() {
  if (!dailyJournalTitle) return;

  const today = dateKey(new Date());

  if (selectedJournalDate === today) {
    dailyJournalTitle.textContent = "Comment te sens-tu ?";
  } else {
    const date = new Date(
      selectedJournalDate + "T00:00:00"
    );

    dailyJournalTitle.textContent =
      `Journal du ${date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long"
      })}`;
  }
}

function updateJournalDateNavigation() {
  if (journalDateLabel) {
    const today = dateKey(new Date());
    const date = new Date(
      selectedJournalDate + "T00:00:00"
    );

    journalDateLabel.textContent =
      selectedJournalDate === today
        ? "Aujourd'hui"
        : date.toLocaleDateString("fr-FR", {
            weekday: "short",
            day: "numeric",
            month: "short"
          });
  }

  if (nextJournalDay) {
    nextJournalDay.disabled =
      selectedJournalDate >= dateKey(new Date());
  }
}

function shiftJournalDay(amount) {
  const current = new Date(
    selectedJournalDate + "T00:00:00"
  );

  current.setDate(
    current.getDate() + amount
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (current > today) return;

  loadJournals(dateKey(current));
}


if (prevJournalDay) {
  prevJournalDay.addEventListener("click", () => {
    shiftJournalDay(-1);
  });
}

if (nextJournalDay) {
  nextJournalDay.addEventListener("click", () => {
    shiftJournalDay(1);
  });
}

function updateWeeklyJournalAvailability() {
  loadWeeklyJournal(selectedWeeklyWeekKey);
}


if (prevWeekly) {
  prevWeekly.addEventListener("click", () => {
    shiftWeeklyHistory(-1);
  });
}

if (nextWeekly) {
  nextWeekly.addEventListener("click", () => {
    shiftWeeklyHistory(1);
  });
}

if (saveWeekly) {
  saveWeekly.addEventListener("click", () => {
    const currentWeekKey =
      getWeekKeyForDate(new Date());

    const existingJournal =
      data.weeklyJournals[selectedWeeklyWeekKey];

    const canEdit =
      Boolean(existingJournal) ||
      (
        selectedWeeklyWeekKey === currentWeekKey &&
        isWeeklyJournalAvailable()
      );

    if (!canEdit) return;

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

    const positiveChoices = [
      ...document.querySelectorAll(
        '[data-category="positiveChoices"]:checked'
      )
    ].map(input => input.value);

    const negativeChoices = [
      ...document.querySelectorAll(
        '[data-category="negativeChoices"]:checked'
      )
    ].map(input => input.value);

    data.weeklyJournals[selectedWeeklyWeekKey] = {
      positiveChoices,
      negativeChoices,
      positive1: positive1.value,
      positive2: positive2.value,
      positive3: positive3.value,
      text: weeklyText?.value || ""
    };

    saveData();
    loadWeeklyJournal(selectedWeeklyWeekKey);

    saveWeekly.textContent =
      "Bilan enregistré ✓";

    setTimeout(() => {
      saveWeekly.textContent =
        "Enregistrer mon bilan";
    }, 1800);
  });
}
