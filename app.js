const STORAGE_KEY = "alizeti_v02";

let data = JSON.parse(
  localStorage.getItem(STORAGE_KEY)
) || {
  habits: [],
  dailyJournal: {},
  weeklyJournals: {},
  notifications: false,
  userName: ""
};


/* =========================================================
   SAUVEGARDE
   ========================================================= */

function saveData() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );

}


/* =========================================================
   ELEMENTS
   ========================================================= */

const pages =
  document.querySelectorAll(".page");

const navItems =
  document.querySelectorAll(".nav-item");

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
  document.querySelectorAll(
    ".goal-options button"
  );

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
  document.getElementById(
    "calendarHabitSelector"
  );

const calendarHabitInfo =
  document.getElementById(
    "calendarHabitInfo"
  );

const dailyJournal =
  document.getElementById(
    "dailyJournal"
  );

const saveDaily =
  document.getElementById(
    "saveDaily"
  );

const weeklyJournalCard =
  document.getElementById(
    "weeklyJournalCard"
  );

const weeklyAvailability =
  document.getElementById(
    "weeklyAvailability"
  );

const weeklyContent =
  document.getElementById(
    "weeklyContent"
  );

const positive1 =
  document.getElementById(
    "positive1"
  );

const positive2 =
  document.getElementById(
    "positive2"
  );

const positive3 =
  document.getElementById(
    "positive3"
  );

const weeklyText =
  document.getElementById(
    "weeklyText"
  );

const saveWeekly =
  document.getElementById(
    "saveWeekly"
  );

const monthlyRecap =
  document.getElementById(
    "monthlyRecap"
  );

const notificationToggle =
  document.getElementById(
    "notificationToggle"
  );

const userName =
  document.getElementById(
    "userName"
  );

const saveName =
  document.getElementById(
    "saveName"
  );

const generateDuo =
  document.getElementById(
    "generateDuo"
  );

const joinDuo =
  document.getElementById(
    "joinDuo"
  );

const duoCodeInput =
  document.getElementById(
    "duoCodeInput"
  );

const duoDisconnected =
  document.getElementById(
    "duoDisconnected"
  );

const duoConnected =
  document.getElementById(
    "duoConnected"
  );

const leaveDuo =
  document.getElementById(
    "leaveDuo"
  );


/* Journal du jour sélectionné dans le calendrier */

const calendarJournalSection =
  document.getElementById(
    "calendarJournalSection"
  );

const calendarJournalTitle =
  document.getElementById(
    "calendarJournalTitle"
  );

const calendarJournalStatus =
  document.getElementById(
    "calendarJournalStatus"
  );

const calendarFeelingGrid =
  document.getElementById(
    "calendarFeelingGrid"
  );

const calendarJournalText =
  document.getElementById(
    "calendarJournalText"
  );

const calendarSaveDaily =
  document.getElementById(
    "calendarSaveDaily"
  );

const weeklyHistoryList =
  document.getElementById(
    "weeklyHistoryList"
  );


/* =========================================================
   ETAT
   ========================================================= */

let selectedGoal = 3;

let selectedCalendarHabitId = null;

let calendarDate = new Date();

/*
   Date actuellement consultée dans le journal
   de la page Journal. Par défaut : aujourd'hui.
*/
let selectedJournalDate =
  dateKey(new Date());

/*
   Date actuellement ouverte sous le calendrier
   (page Calendrier). null = rien n'est ouvert.
*/
let calendarSelectedJournalDate = null;

/*
   Semaine actuellement dépliée dans
   l'historique des bilans. null = tout replié.
*/
let openHistoryWeekKey = null;


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


const feelingOptions = [
  "Bien",
  "Calme",
  "Énergique",
  "Fier·ère",
  "Motivé·e",
  "Fatigué·e",
  "Stressé·e",
  "Triste"
];


function dateKey(date) {

  return [
    date.getFullYear(),

    String(
      date.getMonth() + 1
    ).padStart(2, "0"),

    String(
      date.getDate()
    ).padStart(2, "0")

  ].join("-");

}


function getMonday(
  date = new Date()
) {

  const d =
    new Date(date);

  const day =
    d.getDay();

  const diff =
    day === 0
      ? -6
      : 1 - day;

  d.setDate(
    d.getDate() + diff
  );

  d.setHours(
    0,
    0,
    0,
    0
  );

  return d;

}


function getSunday(
  date = new Date()
) {

  const monday =
    getMonday(date);

  const sunday =
    new Date(monday);

  sunday.setDate(
    monday.getDate() + 6
  );

  return sunday;

}


function getWeekDays() {

  const monday =
    getMonday();

  return Array.from(
    { length: 7 },
    (_, index) => {

      const day =
        new Date(monday);

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


function getWeekRangeLabel(mondayKey) {

  const monday =
    new Date(mondayKey + "T00:00:00");


  const sunday =
    new Date(monday);


  sunday.setDate(
    monday.getDate() + 6
  );


  return `${formatShortDate(monday)} — ${formatShortDate(sunday)}`;

}


function formatJournalTitle(key) {

  if (
    key === dateKey(new Date())
  ) {

    return "Aujourd'hui";

  }


  const date =
    new Date(key + "T00:00:00");


  return date.toLocaleDateString(
    "fr-FR",
    {
      day: "numeric",
      month: "long"
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


  if (
    pageId === "calendarPage"
  ) {

    renderCalendar();

  }


  if (
    pageId === "journalPage"
  ) {

    loadJournals(
      selectedJournalDate
    );

    updateWeeklyJournalAvailability();

    renderWeeklyHistory();

  }


  if (
    pageId === "settingsPage"
  ) {

    userName.value =
      data.userName || "";

    renderAuthState();

    if (duoState) {

      renderDuoAccountUI();

    }

  }

}


navItems.forEach(item => {

  item.addEventListener(
    "click",
    () => {

      /*
        Quand on clique directement
        sur Journal dans la navigation,
        on revient automatiquement
        au journal d'aujourd'hui.
      */

      if (
        item.dataset.page === "journalPage"
      ) {

        selectedJournalDate =
          dateKey(new Date());

      }


      showPage(
        item.dataset.page
      );

    }
  );

});


settingsBtn.addEventListener(
  "click",
  () => {

    showPage(
      "settingsPage"
    );

  }
);


/* =========================================================
   NOM
   ========================================================= */

saveName.addEventListener(
  "click",
  () => {

    data.userName =
      userName.value.trim();

    saveData();

    renderWelcome();

    saveName.textContent =
      "Enregistré ✓";

    setTimeout(
      () => {

        saveName.textContent =
          "Enregistrer";

      },
      1500
    );

  }
);


function renderWelcome() {

  welcomeName.textContent =
    data.userName
      ? data.userName.toUpperCase()
      : "ALIZETI";

}


/* =========================================================
   MODAL HABITUDE
   ========================================================= */

addHabitBtn.addEventListener(
  "click",
  () => {

    if (
      data.habits.length >= 10
    ) {

      alert(
        "Tu peux avoir jusqu'à 10 habitudes."
      );

      return;

    }


    habitName.value = "";

    selectedGoal = 3;

    habitModalContext = "solo";


    document.getElementById(
      "habitModalEyebrow"
    ).textContent =
      "NOUVELLE HABITUDE";


    document.getElementById(
      "habitModalTitle"
    ).textContent =
      "Qu'aimerais-tu mettre en place ?";


    goalButtons.forEach(
      button => {

        button.classList.toggle(
          "selected",
          button.dataset.goal === "3"
        );

      }
    );


    habitModal.classList.remove(
      "hidden"
    );


    setTimeout(
      () => habitName.focus(),
      100
    );

  }
);


closeModal.addEventListener(
  "click",
  () => {

    habitModal.classList.add(
      "hidden"
    );

    habitModalContext = "solo";

  }
);


habitModal.addEventListener(
  "click",
  event => {

    if (
      event.target === habitModal
    ) {

      habitModal.classList.add(
        "hidden"
      );

      habitModalContext = "solo";

    }

  }
);


/* Sélecteur du nombre de jours */

goalButtons.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        selectedGoal =
          Number(
            button.dataset.goal
          );


        goalButtons.forEach(
          item => {

            item.classList.toggle(
              "selected",
              item === button
            );

          }
        );

      }
    );

  }
);


/* Création */

saveHabitBtn.addEventListener(
  "click",
  async () => {

    const name =
      habitName.value.trim();


    if (!name) {

      habitName.focus();

      return;

    }


    /* ===== Habitude commune (Duo) ===== */

    if (habitModalContext === "duo") {

      if (!duoState || !currentUser) return;


      saveHabitBtn.disabled = true;


      await db.collection("duos")
        .doc(duoState.duoId)
        .collection("habits")
        .add({

          name,

          goal: selectedGoal,

          createdBy: currentUser.uid,

          completed: {},

          createdAt:
            firebase.firestore.FieldValue.serverTimestamp()

        });


      saveHabitBtn.disabled = false;


      habitModal.classList.add("hidden");

      habitModalContext = "solo";

      return;

    }


    /* ===== Habitude individuelle (solo) ===== */

    const habit = {

      id: Date.now(),

      name,

      goal: selectedGoal,

      completed: {}

    };


    data.habits.push(
      habit
    );


    if (
      selectedCalendarHabitId === null
    ) {

      selectedCalendarHabitId =
        habit.id;

    }


    saveData();


    habitModal.classList.add(
      "hidden"
    );


    renderHabits();

    renderCalendarHabitSelector();

    renderCalendar();

    renderMonthlyRecap();

  }
);


/* =========================================================
   HABITUDES
   ========================================================= */

function countWeekCompleted(
  habit
) {

  return getWeekDays()
    .filter(
      day =>
        habit.completed[
          dateKey(day)
        ]
    )
    .length;

}


function renderHabits() {

  habitsList.innerHTML = "";


  if (
    !data.habits.length
  ) {

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


  const days =
    getWeekDays();


  data.habits.forEach(
    habit => {

      const completed =
        countWeekCompleted(
          habit
        );


      const goalReached =
        completed >= habit.goal;


      const surpassed =
        completed > habit.goal;


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "habit-card" +
        (
          goalReached
            ? " completed-goal"
            : ""
        );


      const daysHTML =
        days.map(
          (day, index) => {

            const key =
              dateKey(day);


            const checked =
              Boolean(
                habit.completed[key]
              );


            const today =
              key ===
              dateKey(
                new Date()
              );


            return `

              <div class="day">

                <button
                  class="
                    day-circle
                    ${checked ? "checked" : ""}
                    ${today ? "today" : ""}
                  "
                  data-habit="${habit.id}"
                  data-date="${key}"
                >

                  ${
                    checked
                      ? "✓"
                      : ""
                  }

                </button>

                <span>
                  ${dayNames[index]}
                </span>

              </div>

            `;

          }
        ).join("");


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
            class="delete-habit"
            data-delete="${habit.id}"
          >
            ×
          </button>

        </div>


        <div class="days">
          ${daysHTML}
        </div>


        <div
          class="
            goal-badge
            ${goalReached ? "done" : ""}
          "
        >

          ${
            goalReached

              ? "✓ Objectif de la semaine atteint"

              : `
                ${habit.goal - completed}
                jour${
                  habit.goal - completed > 1
                    ? "s"
                    : ""
                }
                restant${
                  habit.goal - completed > 1
                    ? "s"
                    : ""
                }
              `
          }

        </div>


        ${
          surpassed

            ? `

              <div class="habit-celebration">

                🔥

                Tu t'es surpassé·e
                sur cette habitude.

              </div>

            `

            : ""
        }

      `;


      habitsList.appendChild(
        card
      );

    }
  );


  attachHabitEvents();

}


function attachHabitEvents() {

  document
    .querySelectorAll(
      ".day-circle"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const habitId =
              Number(
                button.dataset.habit
              );


            const date =
              button.dataset.date;


            const habit =
              data.habits.find(
                h =>
                  h.id === habitId
              );


            if (!habit) return;


            habit.completed[date] =
              !habit.completed[date];


            saveData();


            renderHabits();

            renderCalendar();

            renderMonthlyRecap();

          }
        );

      }
    );


  document
    .querySelectorAll(
      ".delete-habit"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const id =
              Number(
                button.dataset.delete
              );


            if (
              !confirm(
                "Supprimer cette habitude ?"
              )
            ) {

              return;

            }


            data.habits =
              data.habits.filter(
                habit =>
                  habit.id !== id
              );


            if (
              selectedCalendarHabitId === id
            ) {

              selectedCalendarHabitId =
                data.habits[0]?.id ||
                null;

            }


            saveData();


            renderHabits();

            renderCalendarHabitSelector();

            renderCalendar();

            renderMonthlyRecap();

          }
        );

      }
    );

}


/* =========================================================
   CALENDRIER — CHOIX DE L'HABITUDE
   ========================================================= */

function renderCalendarHabitSelector() {

  calendarHabitSelector.innerHTML = "";


  if (
    !data.habits.length
  ) {

    calendarHabitInfo.innerHTML =
      "";

    return;

  }


  const selectedExists =
    data.habits.some(
      habit =>
        habit.id ===
        selectedCalendarHabitId
    );


  if (
    !selectedExists
  ) {

    selectedCalendarHabitId =
      data.habits[0].id;

  }


  data.habits.forEach(
    habit => {

      const button =
        document.createElement(
          "button"
        );


      button.className =
        "calendar-habit-tab";


      button.classList.toggle(
        "selected",
        habit.id ===
        selectedCalendarHabitId
      );


      button.textContent =
        habit.name;


      button.addEventListener(
        "click",
        () => {

          selectedCalendarHabitId =
            habit.id;

          renderCalendarHabitSelector();

          renderCalendar();

        }
      );


      calendarHabitSelector.appendChild(
        button
      );

    }
  );

}


/* =========================================================
   CALENDRIER
   ========================================================= */

function renderCalendar() {

  renderCalendarHabitSelector();


  if (
    !data.habits.length
  ) {

    calendarTitle.textContent =
      "";

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


  calendarHabitInfo.innerHTML = `

    <strong>
      ${escapeHTML(habit.name)}
    </strong>

    · objectif :

    ${habit.goal}
    jour${habit.goal > 1 ? "s" : ""}
    / semaine

  `;


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


    const completed =
      Boolean(
        habit.completed[key]
      );


    const isToday =
      key ===
      dateKey(
        new Date()
      );


    const hasJournal =
      Boolean(
        data.dailyJournal[key]
      );


    const isSelected =
      key === calendarSelectedJournalDate;


    /*
      On utilise un bouton pour
      pouvoir cliquer sur la date.
    */

    const cell =
      document.createElement(
        "button"
      );


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
      ) +
      (
        isSelected
          ? " day-selected"
          : ""
      );


    cell.textContent =
      day;


    /*
      Cliquer sur une date ouvre
      son journal juste en dessous
      du calendrier, sur cette même
      page.
    */

    cell.addEventListener(
      "click",
      () => {

        openCalendarJournal(
          key
        );

        renderCalendar();

      }
    );


    calendarGrid.appendChild(
      cell
    );

  }

}


/* Mois précédent */

document
  .getElementById(
    "prevMonth"
  )
  .addEventListener(
    "click",
    () => {

      calendarDate.setMonth(
        calendarDate.getMonth() - 1
      );

      renderCalendar();

    }
  );


/* Mois suivant */

document
  .getElementById(
    "nextMonth"
  )
  .addEventListener(
    "click",
    () => {

      calendarDate.setMonth(
        calendarDate.getMonth() + 1
      );

      renderCalendar();

    }
  );


/* =========================================================
   JOURNAL DU JOUR SELECTIONNE DANS LE CALENDRIER
   ========================================================= */

function renderCalendarFeelingGrid() {

  calendarFeelingGrid.innerHTML =
    feelingOptions
      .map(
        feeling => `

          <label class="mini-feeling-option">

            <input
              type="checkbox"
              value="${escapeHTML(feeling)}"
            >

            <span>
              ${escapeHTML(feeling)}
            </span>

          </label>

        `
      )
      .join("");

}


function openCalendarJournal(key) {

  calendarSelectedJournalDate =
    key;


  calendarJournalSection.classList.remove(
    "hidden"
  );


  calendarJournalTitle.textContent =
    formatJournalTitle(key);


  const saved =
    data.dailyJournal[key];


  const hasContent =
    Boolean(
      saved &&
      (
        saved.text?.trim() ||
        (
          saved.feelings &&
          saved.feelings.length
        )
      )
    );


  if (hasContent) {

    calendarJournalStatus.classList.add(
      "hidden"
    );

    calendarJournalStatus.textContent =
      "";

  } else {

    calendarJournalStatus.classList.remove(
      "hidden"
    );

    calendarJournalStatus.textContent =
      "Aucun journal n'a été rempli pour ce jour-là. Tu peux en ajouter un maintenant.";

  }


  calendarJournalText.value =
    saved?.text || "";


  document
    .querySelectorAll(
      "#calendarFeelingGrid input"
    )
    .forEach(
      input => {

        input.checked =
          saved?.feelings?.includes(
            input.value
          ) || false;

      }
    );

}


calendarSaveDaily.addEventListener(
  "click",
  () => {

    if (
      !calendarSelectedJournalDate
    ) {

      return;

    }


    const feelings =
      [
        ...document.querySelectorAll(
          "#calendarFeelingGrid input:checked"
        )
      ].map(
        input =>
          input.value
      );


    data.dailyJournal[
      calendarSelectedJournalDate
    ] = {

      feelings,

      text:
        calendarJournalText.value

    };


    saveData();


    calendarSaveDaily.textContent =
      "Enregistré ✓";


    setTimeout(
      () => {

        calendarSaveDaily.textContent =
          "Enregistrer";

      },
      1500
    );


    calendarJournalStatus.classList.add(
      "hidden"
    );


    /*
      Si le journal ouvert dans la page
      Journal correspond à la même date,
      on le met aussi à jour.
    */

    if (
      calendarSelectedJournalDate ===
      selectedJournalDate
    ) {

      loadJournals(
        selectedJournalDate
      );

    }


    renderCalendar();

  }
);


/* =========================================================
   RECAP MENSUEL
   ========================================================= */

function renderMonthlyRecap() {

  if (
    !data.habits.length
  ) {

    monthlyRecap.textContent =
      "Ajoute une habitude pour commencer ton suivi.";

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


  monthlyRecap.innerHTML =
    data.habits
      .slice(0, 3)
      .map(
        habit => {

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

              <strong>
                ${completed}
              </strong>

              jour${
                completed > 1
                  ? "s"
                  : ""
              }

              sur

              <strong>
                ${monthlyGoal}
              </strong>

              fixé${
                monthlyGoal > 1
                  ? "s"
                  : ""
              }.

            </div>

          `;

        }
      )
      .join("");

}


/* =========================================================
   JOURNAL QUOTIDIEN (page Journal)
   ========================================================= */

function loadDailyFeelings(
  date = selectedJournalDate
) {

  const saved =
    data.dailyJournal[
      date
    ];


  document
    .querySelectorAll(
      ".feeling-option input"
    )
    .forEach(
      input => {

        input.checked =
          saved?.feelings?.includes(
            input.value
          ) || false;

      }
    );

}


/*
   Met à jour éventuellement le titre
   de la section journal si un élément
   avec cet ID existe dans le HTML.
*/

function updateJournalDateTitle() {

  const title =
    document.getElementById(
      "dailyJournalTitle"
    );


  if (!title) return;


  const today =
    dateKey(
      new Date()
    );


  if (
    selectedJournalDate === today
  ) {

    title.textContent =
      "Aujourd'hui";

    return;

  }


  const date =
    new Date(
      selectedJournalDate + "T00:00:00"
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


function loadJournals(
  date = selectedJournalDate
) {

  selectedJournalDate =
    date;


  const savedDaily =
    data.dailyJournal[
      date
    ];


  dailyJournal.value =
    savedDaily?.text || "";


  loadDailyFeelings(
    date
  );


  updateJournalDateTitle();


  /*
     Le bilan hebdomadaire reste lié
     à la semaine actuelle.
  */

  const journal =
    data.weeklyJournals[
      getWeekKey()
    ];


  if (!journal) {

    positive1.value = "";
    positive2.value = "";
    positive3.value = "";
    weeklyText.value = "";

    document
      .querySelectorAll(
        ".choice input"
      )
      .forEach(
        input =>
          input.checked = false
      );

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
    .querySelectorAll(
      ".choice input"
    )
    .forEach(
      input => {

        const category =
          input.dataset.category;


        input.checked =
          journal[category]?.includes(
            input.value
          ) || false;

      }
    );

}


/* =========================================================
   ENREGISTREMENT JOURNAL QUOTIDIEN
   ========================================================= */

saveDaily.addEventListener(
  "click",
  () => {

    const date =
      selectedJournalDate;


    const feelings =
      [
        ...document.querySelectorAll(
          ".feeling-option input:checked"
        )
      ].map(
        input =>
          input.value
      );


    data.dailyJournal[date] = {

      feelings,

      text:
        dailyJournal.value

    };


    saveData();


    saveDaily.textContent =
      "Enregistré ✓";


    setTimeout(
      () => {

        saveDaily.textContent =
          "Enregistrer";

      },
      1500
    );


    /*
      On actualise le calendrier pour
      afficher immédiatement le point
      indiquant qu'un journal existe,
      et le bloc journal du calendrier
      si la même date y est ouverte.
    */

    if (
      date === calendarSelectedJournalDate
    ) {

      openCalendarJournal(date);

    }


    renderCalendar();

  }
);


/* =========================================================
   BILAN HEBDOMADAIRE
   ========================================================= */

const positiveOptions = [

  "Je me suis bien senti·e",
  "J'ai pris du temps pour moi",
  "J'ai bien dormi",
  "J'ai fait quelque chose que j'aime",
  "J'ai été fier·ère de moi",
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
    document.getElementById(
      "positiveChoices"
    );


  const negativeContainer =
    document.getElementById(
      "negativeChoices"
    );


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

              ${index + 1}.
              ${escapeHTML(option)}

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

              ${index + 1}.
              ${escapeHTML(option)}

            </span>

          </label>

        `
      )
      .join("");

}


function isWeeklyJournalAvailable() {

  const now =
    new Date();


  const day =
    now.getDay();


  const hour =
    now.getHours();


  /* Dimanche à partir de 19h */

  if (
    day === 0 &&
    hour >= 19
  ) {

    return true;

  }


  /* Tout le lundi */

  if (
    day === 1
  ) {

    return true;

  }


  return false;

}


function updateWeeklyJournalAvailability() {

  if (
    isWeeklyJournalAvailable()
  ) {

    weeklyContent.classList.remove(
      "hidden"
    );


    weeklyJournalCard.classList.remove(
      "locked"
    );


    weeklyAvailability.textContent =
      "Ton bilan de la semaine est ouvert.";

  } else {

    weeklyContent.classList.add(
      "hidden"
    );


    weeklyJournalCard.classList.add(
      "locked"
    );


    weeklyAvailability.textContent =
      "Le bilan s'ouvre dimanche à 19h et reste disponible jusqu'au lundi soir.";

  }

}


function getWeekKey() {

  return dateKey(
    getMonday()
  );

}


saveWeekly.addEventListener(
  "click",
  () => {

    if (
      !isWeeklyJournalAvailable()
    ) {

      return;

    }


    if (
      !positive1.value.trim() ||
      !positive2.value.trim() ||
      !positive3.value.trim()
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
      getWeekKey()
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
        weeklyText.value

    };


    saveData();


    saveWeekly.textContent =
      "Bilan enregistré ✓";


    setTimeout(
      () => {

        saveWeekly.textContent =
          "Enregistrer mon bilan";

      },
      1800
    );


    renderWeeklyHistory();

  }
);


/* =========================================================
   HISTORIQUE DES BILANS HEBDOMADAIRES
   ========================================================= */

function renderWeeklyHistory() {

  const weekKeys =
    Object.keys(
      data.weeklyJournals
    ).sort(
      (a, b) =>
        b.localeCompare(a)
    );


  if (
    !weekKeys.length
  ) {

    weeklyHistoryList.innerHTML = `

      <p class="soft-text">

        Tu n'as pas encore de bilan
        hebdomadaire enregistré.

      </p>

    `;

    return;

  }


  weeklyHistoryList.innerHTML =
    weekKeys
      .map(
        weekKey => {

          const journal =
            data.weeklyJournals[
              weekKey
            ];


          const isOpen =
            weekKey ===
            openHistoryWeekKey;


          const positives =
            [
              journal.positive1,
              journal.positive2,
              journal.positive3
            ].filter(Boolean);


          return `

            <div
              class="
                history-item
                ${isOpen ? "open" : ""}
              "
            >

              <button
                class="history-item-header"
                data-week="${weekKey}"
              >

                <span>
                  ${getWeekRangeLabel(weekKey)}
                </span>

                <span class="history-chevron">
                  ${isOpen ? "−" : "+"}
                </span>

              </button>


              ${
                isOpen

                  ? `

                    <div class="history-item-body">

                      ${
                        journal.positiveChoices?.length

                          ? `
                            <div class="history-tags">
                              ${
                                journal.positiveChoices
                                  .map(
                                    item =>
                                      `<span class="history-tag positive">${escapeHTML(item)}</span>`
                                  )
                                  .join("")
                              }
                            </div>
                          `

                          : ""
                      }

                      ${
                        journal.negativeChoices?.length

                          ? `
                            <div class="history-tags">
                              ${
                                journal.negativeChoices
                                  .map(
                                    item =>
                                      `<span class="history-tag negative">${escapeHTML(item)}</span>`
                                  )
                                  .join("")
                              }
                            </div>
                          `

                          : ""
                      }

                      ${
                        positives.length

                          ? `
                            <ul class="history-positives">
                              ${
                                positives
                                  .map(
                                    item =>
                                      `<li>${escapeHTML(item)}</li>`
                                  )
                                  .join("")
                              }
                            </ul>
                          `

                          : ""
                      }

                      ${
                        journal.text?.trim()

                          ? `<p class="history-text">${escapeHTML(journal.text)}</p>`

                          : ""
                      }

                      ${
                        !journal.positiveChoices?.length &&
                        !journal.negativeChoices?.length &&
                        !positives.length &&
                        !journal.text?.trim()

                          ? `<p class="soft-text">Ce bilan est vide.</p>`

                          : ""
                      }

                    </div>

                  `

                  : ""
              }

            </div>

          `;

        }
      )
      .join("");


  document
    .querySelectorAll(
      ".history-item-header"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const week =
              button.dataset.week;


            openHistoryWeekKey =
              openHistoryWeekKey === week
                ? null
                : week;


            renderWeeklyHistory();

          }
        );

      }
    );

}


/* =========================================================
   ELEMENTS — COMPTE / DUO (FIRESTORE)
   ========================================================= */

const duoAuthSection =
  document.getElementById("duoAuthSection");

const duoLoginForm =
  document.getElementById("duoLoginForm");

const duoSignupForm =
  document.getElementById("duoSignupForm");

const loginUsername =
  document.getElementById("loginUsername");

const loginPassword =
  document.getElementById("loginPassword");

const loginError =
  document.getElementById("loginError");

const loginBtn =
  document.getElementById("loginBtn");

const showSignup =
  document.getElementById("showSignup");

const signupUsername =
  document.getElementById("signupUsername");

const signupPassword =
  document.getElementById("signupPassword");

const signupError =
  document.getElementById("signupError");

const signupBtn =
  document.getElementById("signupBtn");

const showLogin =
  document.getElementById("showLogin");

const duoAccountSection =
  document.getElementById("duoAccountSection");

const duoAccountUsername =
  document.getElementById("duoAccountUsername");

const logoutBtn =
  document.getElementById("logoutBtn");

const duoCodeGenerated =
  document.getElementById("duoCodeGenerated");

const duoGeneratedCode =
  document.getElementById("duoGeneratedCode");

const duoJoinError =
  document.getElementById("duoJoinError");

const duoPartnerName =
  document.getElementById("duoPartnerName");

const duoNavItem =
  document.getElementById("duoNavItem");

const duoRecapCard =
  document.getElementById("duoRecapCard");

const duoHabitsList =
  document.getElementById("duoHabitsList");

const addDuoHabitBtn =
  document.getElementById("addDuoHabitBtn");

const duoEmptyState =
  document.getElementById("duoEmptyState");

const colorButtons =
  document.querySelectorAll(
    ".color-swatch"
  );


/* =========================================================
   ETAT — COMPTE / DUO
   ========================================================= */

let currentUser = null;

/*
   Profil Firestore de l'utilisateur connecté :
   { username, duoId, color }
*/
let currentProfile = null;

/*
   Infos sur le duo actif une fois connecté :
   { duoId, partnerUid, partnerUsername, myColor, partnerColor }
*/
let duoState = null;

let duoHabitsUnsub = null;
let duoDocUnsub = null;
let duoReactionsUnsub = null;

let sharedHabits = [];

let sharedReactions = [];

/*
   Contexte du modal d'ajout d'habitude :
   "solo" (par défaut) ou "duo".
*/
let habitModalContext = "solo";

const REACTION_TYPES = [
  { type: "heart", icon: "❤️" },
  { type: "applause", icon: "👏" },
  { type: "fire", icon: "🔥" },
  { type: "flex", icon: "💪" }
];


/* =========================================================
   AUTHENTIFICATION
   ========================================================= */

function showAuthError(element, message) {

  element.textContent = message;

  element.classList.remove("hidden");

}


function hideAuthError(element) {

  element.classList.add("hidden");

}


showSignup.addEventListener(
  "click",
  () => {

    duoLoginForm.classList.add("hidden");

    duoSignupForm.classList.remove("hidden");

  }
);


showLogin.addEventListener(
  "click",
  () => {

    duoSignupForm.classList.add("hidden");

    duoLoginForm.classList.remove("hidden");

  }
);


signupBtn.addEventListener(
  "click",
  async () => {

    hideAuthError(signupError);

    const username =
      signupUsername.value.trim();

    const password =
      signupPassword.value;


    if (
      !username ||
      username.length < 3
    ) {

      showAuthError(
        signupError,
        "Choisis un nom d'utilisateur d'au moins 3 caractères."
      );

      return;

    }


    if (
      !password ||
      password.length < 6
    ) {

      showAuthError(
        signupError,
        "Le mot de passe doit contenir au moins 6 caractères."
      );

      return;

    }


    signupBtn.disabled = true;

    signupBtn.textContent = "Création...";


    try {

      const credential =
        await auth.createUserWithEmailAndPassword(
          usernameToEmail(username),
          password
        );


      await db.collection("users")
        .doc(credential.user.uid)
        .set({

          username,

          duoId: null,

          color: "blue",

          createdAt:
            firebase.firestore.FieldValue.serverTimestamp()

        });


      signupUsername.value = "";

      signupPassword.value = "";

    } catch (error) {

      console.error(
        "Erreur d'inscription :",
        error
      );

      showAuthError(
        signupError,
        translateAuthError(error)
      );

    }


    signupBtn.disabled = false;

    signupBtn.textContent = "Créer mon compte";

  }
);


loginBtn.addEventListener(
  "click",
  async () => {

    hideAuthError(loginError);

    const username =
      loginUsername.value.trim();

    const password =
      loginPassword.value;


    if (!username || !password) {

      showAuthError(
        loginError,
        "Renseigne ton nom d'utilisateur et ton mot de passe."
      );

      return;

    }


    loginBtn.disabled = true;

    loginBtn.textContent = "Connexion...";


    try {

      await auth.signInWithEmailAndPassword(
        usernameToEmail(username),
        password
      );

      loginPassword.value = "";

    } catch (error) {

      console.error(
        "Erreur de connexion :",
        error
      );

      showAuthError(
        loginError,
        translateAuthError(error)
      );

    }


    loginBtn.disabled = false;

    loginBtn.textContent = "Se connecter";

  }
);


logoutBtn.addEventListener(
  "click",
  () => {

    auth.signOut();

  }
);


function translateAuthError(error) {

  const map = {

    "auth/email-already-in-use":
      "Ce nom d'utilisateur est déjà pris.",

    "auth/invalid-email":
      "Ce nom d'utilisateur n'est pas valide.",

    "auth/wrong-password":
      "Mot de passe incorrect.",

    "auth/user-not-found":
      "Ce nom d'utilisateur n'existe pas.",

    "auth/invalid-credential":
      "Nom d'utilisateur ou mot de passe incorrect.",

    "auth/too-many-requests":
      "Trop de tentatives, réessaie dans un instant.",

    "auth/operation-not-allowed":
      "La connexion par mot de passe n'est pas activée sur le projet Firebase (Authentication → Sign-in method).",

    "auth/invalid-api-key":
      "La configuration Firebase (firebase-config.js) est incorrecte ou incomplète.",

    "auth/api-key-not-valid":
      "La configuration Firebase (firebase-config.js) est incorrecte ou incomplète.",

    "auth/network-request-failed":
      "Problème de connexion internet, réessaie.",

    "permission-denied":
      "Accès refusé par Firestore : vérifie que les règles de sécurité ont bien été publiées."

  };


  /*
     On garde le code brut en secours pour
     pouvoir diagnostiquer les cas non prévus
     (voir la console du navigateur pour le détail).
  */

  return (
    map[error.code] ||
    `Une erreur est survenue (${error.code || error.message || "inconnue"}).`
  );

}


/*
   Point d'entrée : réagit à chaque changement
   de session (connexion, déconnexion, ou
   reconnexion automatique sur un appareil
   déjà utilisé auparavant).
*/

auth.onAuthStateChanged(
  async user => {

    /* On se détache des anciens écouteurs Firestore */

    if (duoHabitsUnsub) duoHabitsUnsub();

    if (duoDocUnsub) duoDocUnsub();

    if (duoReactionsUnsub) duoReactionsUnsub();

    duoHabitsUnsub = null;

    duoDocUnsub = null;

    duoReactionsUnsub = null;


    currentUser = user;


    if (!user) {

      currentProfile = null;

      duoState = null;

      renderAuthState();

      renderDuoNav();

      return;

    }


    const profileSnap =
      await db.collection("users")
        .doc(user.uid)
        .get();


    currentProfile =
      profileSnap.data();


    renderAuthState();


    if (currentProfile?.duoId) {

      subscribeToDuo(
        currentProfile.duoId
      );

    } else {

      duoState = null;

      renderDuoAccountUI();

      renderDuoNav();

    }

  }
);


function renderAuthState() {

  const loggedIn =
    Boolean(currentUser);


  duoAuthSection.classList.toggle(
    "hidden",
    loggedIn
  );


  duoAccountSection.classList.toggle(
    "hidden",
    !loggedIn
  );


  if (loggedIn) {

    duoAccountUsername.textContent =
      currentProfile?.username || "";

  }

}


/* =========================================================
   CREATION / JONCTION DU DUO
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


generateDuo.addEventListener(
  "click",
  async () => {

    if (!currentUser) return;


    generateDuo.disabled = true;


    const code =
      generateCode();


    const duoRef =
      await db.collection("duos").add({

        code,

        member1: currentUser.uid,

        member2: null,

        status: "waiting",

        createdAt:
          firebase.firestore.FieldValue.serverTimestamp()

      });


    await db.collection("users")
      .doc(currentUser.uid)
      .update({ duoId: duoRef.id });


    duoGeneratedCode.textContent =
      code;


    duoCodeGenerated.classList.remove(
      "hidden"
    );


    generateDuo.disabled = false;


    subscribeToDuo(duoRef.id);

  }
);


joinDuo.addEventListener(
  "click",
  async () => {

    if (!currentUser) return;


    hideAuthError(duoJoinError);


    const code =
      duoCodeInput.value
        .trim()
        .toUpperCase();


    if (code.length !== 6) {

      showAuthError(
        duoJoinError,
        "Le code doit contenir 6 caractères."
      );

      return;

    }


    joinDuo.disabled = true;


    try {

      const results =
        await db.collection("duos")
          .where("code", "==", code)
          .where("status", "==", "waiting")
          .limit(1)
          .get();


      if (results.empty) {

        showAuthError(
          duoJoinError,
          "Ce code n'est pas valide ou a déjà été utilisé."
        );

        joinDuo.disabled = false;

        return;

      }


      const duoDoc =
        results.docs[0];


      if (
        duoDoc.data().member1 ===
        currentUser.uid
      ) {

        showAuthError(
          duoJoinError,
          "Tu ne peux pas rejoindre ton propre code."
        );

        joinDuo.disabled = false;

        return;

      }


      /*
        La personne qui rejoint prend
        automatiquement la couleur opposée
        à celle du premier membre.
      */

      const inviterSnap =
        await db.collection("users")
          .doc(duoDoc.data().member1)
          .get();


      const inviterColor =
        inviterSnap.data()?.color || "blue";


      const myColor =
        inviterColor === "blue"
          ? "yellow"
          : "blue";


      await duoDoc.ref.update({

        member2: currentUser.uid,

        status: "connected"

      });


      await db.collection("users")
        .doc(currentUser.uid)
        .update({

          duoId: duoDoc.id,

          color: myColor

        });


      duoCodeInput.value = "";


      subscribeToDuo(duoDoc.id);

    } catch (error) {

      showAuthError(
        duoJoinError,
        "Une erreur est survenue, réessaie."
      );

    }


    joinDuo.disabled = false;

  }
);


leaveDuo.addEventListener(
  "click",
  async () => {

    if (
      !currentUser ||
      !duoState
    ) {

      return;

    }


    if (
      !confirm(
        "Quitter le Duo ? Vos habitudes communes resteront visibles pour l'autre personne."
      )
    ) {

      return;

    }


    await db.collection("users")
      .doc(currentUser.uid)
      .update({ duoId: null });


    if (duoHabitsUnsub) duoHabitsUnsub();

    if (duoDocUnsub) duoDocUnsub();

    if (duoReactionsUnsub) duoReactionsUnsub();


    duoState = null;

    currentProfile.duoId = null;


    duoCodeGenerated.classList.add(
      "hidden"
    );


    renderDuoAccountUI();

    renderDuoNav();

  }
);


/*
   Choix de sa couleur dans le duo. On empêche
   les deux personnes d'avoir la même couleur.
*/

colorButtons.forEach(button => {

  button.addEventListener(
    "click",
    async () => {

      if (!currentUser || !duoState) return;


      const color =
        button.dataset.color;


      if (
        color === duoState.partnerColor
      ) {

        alert(
          "Ton/ta partenaire a déjà choisi cette couleur."
        );

        return;

      }


      await db.collection("users")
        .doc(currentUser.uid)
        .update({ color });


      currentProfile.color = color;

      duoState.myColor = color;


      renderColorButtons();

      renderDuoHabits();

    }
  );

});


function renderColorButtons() {

  colorButtons.forEach(button => {

    button.classList.toggle(
      "selected",
      button.dataset.color ===
      (currentProfile?.color || "blue")
    );

  });

}


/* =========================================================
   SOUSCRIPTION AU DUO ACTIF
   ========================================================= */

function subscribeToDuo(duoId) {

  duoDocUnsub =
    db.collection("duos")
      .doc(duoId)
      .onSnapshot(async docSnap => {

        const duoData =
          docSnap.data();


        if (
          !duoData ||
          duoData.status !== "connected"
        ) {

          duoState = null;

          renderDuoAccountUI();

          renderDuoNav();

          return;

        }


        const partnerUid =
          duoData.member1 === currentUser.uid
            ? duoData.member2
            : duoData.member1;


        const partnerSnap =
          await db.collection("users")
            .doc(partnerUid)
            .get();


        const partnerData =
          partnerSnap.data() || {};


        duoState = {

          duoId,

          partnerUid,

          partnerUsername:
            partnerData.username || "Ton/ta partenaire",

          myColor:
            currentProfile?.color || "blue",

          partnerColor:
            partnerData.color === "blue"
              ? "blue"
              : "yellow"

        };


        renderDuoAccountUI();

        renderDuoNav();

      });


  if (duoHabitsUnsub) duoHabitsUnsub();


  duoHabitsUnsub =
    db.collection("duos")
      .doc(duoId)
      .collection("habits")
      .onSnapshot(snapshot => {

        sharedHabits =
          snapshot.docs.map(doc => ({

            id: doc.id,

            ...doc.data()

          }));


        renderDuoHabits();

      });


  if (duoReactionsUnsub) duoReactionsUnsub();


  duoReactionsUnsub =
    db.collection("duos")
      .doc(duoId)
      .collection("reactions")
      .onSnapshot(snapshot => {

        sharedReactions =
          snapshot.docs.map(doc => ({

            id: doc.id,

            ...doc.data()

          }));


        renderDuoRecap();

      });

}


function renderDuoAccountUI() {

  if (!duoState) {

    duoDisconnected.classList.remove(
      "hidden"
    );

    duoConnected.classList.add(
      "hidden"
    );

    /*
      On ne cache surtout pas duoCodeGenerated
      ici : cette fonction est aussi appelée
      juste après avoir généré un code, tant que
      personne ne l'a encore rejoint (duoState
      reste null pendant toute l'attente). Le
      masquer ici faisait disparaître le code
      presque instantanément.
    */

    return;

  }


  duoDisconnected.classList.add(
    "hidden"
  );

  duoConnected.classList.remove(
    "hidden"
  );


  /*
    Une fois réellement connecté, on peut
    cacher le bloc "code généré" : il n'a
    plus lieu d'être affiché.
  */

  duoCodeGenerated.classList.add(
    "hidden"
  );


  duoPartnerName.textContent =
    duoState.partnerUsername;


  renderColorButtons();

}


function renderDuoNav() {

  const connected =
    Boolean(duoState);


  duoNavItem.classList.toggle(
    "hidden",
    !connected
  );


  document
    .querySelector(".bottom-nav")
    .classList.toggle(
      "four-items",
      connected
    );


  duoHabitsList.classList.toggle(
    "hidden",
    !connected
  );


  addDuoHabitBtn.classList.toggle(
    "hidden",
    !connected
  );


  duoEmptyState.classList.toggle(
    "hidden",
    connected
  );


  if (!connected) {

    duoRecapCard.classList.add(
      "hidden"
    );

  }

}


/* =========================================================
   HABITUDES COMMUNES
   ========================================================= */

addDuoHabitBtn.addEventListener(
  "click",
  () => {

    if (!duoState) return;


    habitModalContext = "duo";


    document.getElementById(
      "habitModalEyebrow"
    ).textContent =
      "HABITUDE COMMUNE";


    document.getElementById(
      "habitModalTitle"
    ).textContent =
      "Que voulez-vous suivre à deux ?";


    habitName.value = "";

    selectedGoal = 3;


    goalButtons.forEach(button => {

      button.classList.toggle(
        "selected",
        button.dataset.goal === "3"
      );

    });


    habitModal.classList.remove(
      "hidden"
    );


    setTimeout(
      () => habitName.focus(),
      100
    );

  }
);


function countWeekCompletedShared(
  habit,
  uid
) {

  return getWeekDays()
    .filter(day => {

      const key =
        dateKey(day);

      return Boolean(
        habit.completed?.[key]?.[uid]
      );

    })
    .length;

}


function renderDuoHabits() {

  if (!duoState) return;


  duoHabitsList.innerHTML = "";


  if (!sharedHabits.length) {

    duoHabitsList.innerHTML = `

      <div class="month-card">

        <div class="monthly-recap">

          Vous n'avez pas encore d'habitude commune.
          <br><br>
          Ajoutez-en une pour suivre vos progrès
          à deux.

        </div>

      </div>

    `;

    return;

  }


  const days =
    getWeekDays();


  const myUid =
    currentUser.uid;


  const partnerUid =
    duoState.partnerUid;


  sharedHabits.forEach(habit => {

    const myCompleted =
      countWeekCompletedShared(habit, myUid);

    const partnerCompleted =
      countWeekCompletedShared(habit, partnerUid);


    const card =
      document.createElement("div");


    card.className = "habit-card duo-habit-card";


    function buildRow(uid, colorClass, label) {

      const daysHTML =
        days.map((day, index) => {

          const key =
            dateKey(day);

          const checked =
            Boolean(habit.completed?.[key]?.[uid]);

          const today =
            key === dateKey(new Date());

          const canToggle =
            uid === myUid;


          return `

            <div class="day">

              <button
                class="
                  day-circle
                  duo-circle
                  ${colorClass}
                  ${checked ? "checked" : ""}
                  ${today ? "today" : ""}
                  ${canToggle ? "" : "readonly"}
                "
                data-habit="${habit.id}"
                data-date="${key}"
                data-uid="${uid}"
                ${canToggle ? "" : "disabled"}
              >

                ${checked ? "✓" : ""}

              </button>

              <span>${dayNames[index]}</span>

            </div>

          `;

        }).join("");


      return `

        <div class="duo-row">

          <span class="duo-row-label">
            ${escapeHTML(label)}
          </span>

          <div class="days">
            ${daysHTML}
          </div>

        </div>

      `;

    }


    card.innerHTML = `

      <div class="habit-top">

        <div>

          <div class="habit-name">
            ${escapeHTML(habit.name)}
          </div>

          <div class="habit-progress">
            Objectif : ${habit.goal}
            jour${habit.goal > 1 ? "s" : ""} / semaine
          </div>

        </div>


        ${
          habit.createdBy === myUid
            ? `<button class="delete-habit" data-delete-shared="${habit.id}">×</button>`
            : ""
        }

      </div>


      ${buildRow(myUid, duoState.myColor, "Toi")}

      ${buildRow(partnerUid, duoState.partnerColor, duoState.partnerUsername)}


      <div class="duo-progress-line">

        Toi : ${myCompleted}/${habit.goal}
        · ${duoState.partnerUsername} : ${partnerCompleted}/${habit.goal}

      </div>

    `;


    duoHabitsList.appendChild(card);

  });


  attachDuoHabitEvents();

  renderDuoRecap();

}


function attachDuoHabitEvents() {

  document
    .querySelectorAll(
      ".duo-circle:not(.readonly)"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        async () => {

          const habitId =
            button.dataset.habit;

          const date =
            button.dataset.date;

          const uid =
            button.dataset.uid;


          const habit =
            sharedHabits.find(
              h => h.id === habitId
            );

          if (!habit) return;


          const current =
            Boolean(
              habit.completed?.[date]?.[uid]
            );


          await db.collection("duos")
            .doc(duoState.duoId)
            .collection("habits")
            .doc(habitId)
            .update({

              [`completed.${date}.${uid}`]:
                !current

            });

        }
      );

    });


  document
    .querySelectorAll(
      "[data-delete-shared]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        async () => {

          const id =
            button.dataset.deleteShared;


          if (
            !confirm(
              "Supprimer cette habitude commune ?"
            )
          ) {

            return;

          }


          await db.collection("duos")
            .doc(duoState.duoId)
            .collection("habits")
            .doc(id)
            .delete();

        }
      );

    });

}


/* =========================================================
   ENCART DE RECONNAISSANCE + REACTIONS
   ========================================================= */

/*
   Détermine quelle "journée" mettre en avant et
   son libellé, selon la fenêtre 20h → 10h du
   lendemain matin. En dehors de cette fenêtre,
   l'encart reste caché.
*/

function getRecapWindow() {

  const now =
    new Date();

  const hour =
    now.getHours();


  /* Entre 20h et minuit : on parle du jour même */

  if (hour >= 20) {

    return {

      visible: true,

      label: "Aujourd'hui",

      dateKey: dateKey(now)

    };

  }


  /* Entre minuit et 10h : on parle de la veille */

  if (hour < 10) {

    const yesterday =
      new Date(now);

    yesterday.setDate(
      now.getDate() - 1
    );


    return {

      visible: true,

      label: "Hier",

      dateKey: dateKey(yesterday)

    };

  }


  return {

    visible: false,

    label: "",

    dateKey: null

  };

}


function getHabitsCompletedOn(uid, dayKey) {

  return sharedHabits.filter(
    habit =>
      Boolean(habit.completed?.[dayKey]?.[uid])
  );

}


function renderDuoRecap() {

  if (!duoState) return;


  const window =
    getRecapWindow();


  if (!window.visible) {

    duoRecapCard.classList.add("hidden");

    return;

  }


  duoRecapCard.classList.remove("hidden");


  const myUid =
    currentUser.uid;

  const partnerUid =
    duoState.partnerUid;


  function buildBlock(uid, name) {

    const habits =
      getHabitsCompletedOn(uid, window.dateKey);


    const habitsText =
      habits.length

        ? habits
            .map(h => escapeHTML(h.name))
            .join(", ")

        : "rien réalisé pour l'instant";


    const reactionsForThisDay =
      sharedReactions.filter(
        reaction =>
          reaction.toUid === uid &&
          reaction.dateKey === window.dateKey
      );


    const reactionButtons =
      REACTION_TYPES
        .map(reaction => {

          const count =
            reactionsForThisDay.filter(
              r => r.type === reaction.type
            ).length;


          const iSent =
            reactionsForThisDay.some(
              r =>
                r.type === reaction.type &&
                r.fromUid === myUid
            );


          const disabled =
            uid === myUid
              ? "disabled"
              : "";


          return `

            <button
              class="reaction-button ${iSent ? "sent" : ""}"
              data-reaction="${reaction.type}"
              data-to="${uid}"
              ${disabled}
            >
              ${reaction.icon}
              ${count > 0 ? `<span>${count}</span>` : ""}
            </button>

          `;

        })
        .join("");


    return `

      <div class="duo-recap-block">

        <p>

          <strong>${window.label}</strong>,
          ${escapeHTML(name)} a
          ${habits.length ? "réalisé" : ""}
          ${habits.length ? `<strong>${habitsText}</strong>` : habitsText}

        </p>


        <div class="reaction-row">
          ${reactionButtons}
        </div>

      </div>

    `;

  }


  duoRecapCard.innerHTML = `

    <div class="journal-card-header">

      <div>

        <p class="eyebrow">RECONNAISSANCE</p>

        <h2>Comment s'est passée la journée ?</h2>

      </div>

      <span class="journal-icon">✦</span>

    </div>

    ${buildBlock(myUid, "toi")}

    <div class="duo-recap-divider"></div>

    ${buildBlock(partnerUid, duoState.partnerUsername)}

  `;


  document
    .querySelectorAll(
      "#duoRecapCard .reaction-button:not([disabled])"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        async () => {

          const reactionType =
            button.dataset.reaction;

          const toUid =
            button.dataset.to;


          const alreadySent =
            sharedReactions.find(
              r =>
                r.type === reactionType &&
                r.toUid === toUid &&
                r.fromUid === myUid &&
                r.dateKey === window.dateKey
            );


          if (alreadySent) {

            await db.collection("duos")
              .doc(duoState.duoId)
              .collection("reactions")
              .doc(alreadySent.id)
              .delete();

            return;

          }


          await db.collection("duos")
            .doc(duoState.duoId)
            .collection("reactions")
            .add({

              fromUid: myUid,

              toUid,

              type: reactionType,

              dateKey: window.dateKey,

              createdAt:
                firebase.firestore.FieldValue.serverTimestamp()

            });

        }
      );

    });

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


        if (
          permission !== "granted"
        ) {

          data.notifications =
            false;

        }

      } catch {

        data.notifications =
          false;

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

  const monday =
    getMonday();


  const sunday =
    getSunday();


  weekDates.textContent =
    `${formatShortDate(monday)} — ${formatShortDate(sunday)}`;


  /*
    Le journal de la page Journal
    commence toujours sur aujourd'hui.
  */

  selectedJournalDate =
    dateKey(new Date());


  renderWelcome();

  renderChoiceLists();

  renderCalendarFeelingGrid();

  renderHabits();

  renderCalendarHabitSelector();

  renderCalendar();

  renderMonthlyRecap();

  updateNotificationToggle();

  updateWeeklyJournalAvailability();

  loadJournals(
    selectedJournalDate
  );

  renderWeeklyHistory();

}


initialize();
