const STORAGE_KEY = "alizeti_data_v02";

const DAYS = ["L", "M", "M", "J", "V", "S", "D"];

let data = loadData();

let selectedCalendarHabit = null;

let calendarDate = new Date();

let editingHabitId = null;

/* -----------------------------
DATA
----------------------------- */

function createInitialData() {

return {
name: "",
habits: [],
dailyJournal: [],
weeklyReflections: []
};

}

function loadData() {

const saved =
localStorage.getItem(STORAGE_KEY);

if (!saved) {
return createInitialData();
}

try {

```
const parsed = JSON.parse(saved);

return {
  ...createInitialData(),
  ...parsed
};
```

} catch {

```
return createInitialData();
```

}

}

function saveData() {

localStorage.setItem(
STORAGE_KEY,
JSON.stringify(data)
);

}

/* -----------------------------
DATE
----------------------------- */

function formatDate(date) {

const year =
date.getFullYear();

const month =
String(date.getMonth() + 1).padStart(2, "0");

const day =
String(date.getDate()).padStart(2, "0");

return `${year}-${month}-${day}`;

}

function getTodayKey() {

return formatDate(new Date());

}

function getMonday(date = new Date()) {

const d = new Date(date);

const day = d.getDay();

const difference =
day === 0 ? -6 : 1 - day;

d.setDate(
d.getDate() + difference
);

d.setHours(0, 0, 0, 0);

return d;

}

function getWeekDates(date = new Date()) {

const monday =
getMonday(date);

return DAYS.map((_, index) => {

```
const d =
  new Date(monday);

d.setDate(
  monday.getDate() + index
);

return d;
```

});

}

function getDayIndex(date) {

const day =
date.getDay();

return day === 0
? 6
: day - 1;

}

/* -----------------------------
GREETING
----------------------------- */

function renderGreeting() {

const hour =
new Date().getHours();

let greeting = "Bonjour";

if (hour >= 18) {

```
greeting = "Bonsoir";
```

} else if (hour >= 12) {

```
greeting = "Bon après-midi";
```

}

const name =
data.name
? `, ${data.name}`
: "";

document
.getElementById("greeting")
.textContent =
`${greeting}${name} 👋`;

const date =
new Date();

const label =
date.toLocaleDateString(
"fr-FR",
{
weekday: "long",
day: "numeric",
month: "long"
}
);

document
.getElementById("todayLabel")
.textContent =
label;

}

/* -----------------------------
HABITS
----------------------------- */

function getHabitWeekCount(habit) {

const weekDates =
getWeekDates();

return weekDates.filter(
date =>
habit.completed?.includes(
formatDate(date)
)
).length;

}

function renderHabits() {

const container =
document.getElementById("habitsList");

container.innerHTML = "";

document
.getElementById("habitCount")
.textContent =
`${data.habits.length} / 10`;

document
.getElementById("settingsHabitCount")
.textContent =
`${data.habits.length} / 10`;

if (data.habits.length === 0) {

```
container.innerHTML = `

  <div class="empty-state">

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
      ">
        ○
      </div>

      <strong style="
        display:block;
        color:#172033;
        margin-bottom:5px;
      ">
        Aucune habitude pour l'instant
      </strong>

      Commence doucement,
      avec quelque chose qui compte pour toi.

    </div>

  </div>

`;

renderMonthlySummary();

return;
```

}

data.habits.forEach(habit => {

```
const card =
  document.createElement("div");

card.className =
  "habit-card";

card.dataset.habitId =
  habit.id;


const count =
  getHabitWeekCount(habit);

const target =
  habit.frequency;


let statusHTML = "";


if (count > target) {

  statusHTML = `
    <span class="habit-status exceeded">
      ✦ Tu t'es surpassé
    </span>
  `;

} else if (count === target) {

  statusHTML = `
    <span class="habit-status completed">
      ✓ Complété
    </span>
  `;

}


const top =
  document.createElement("div");

top.className =
  "habit-top";

top.innerHTML = `

  <div>

    <div class="habit-name">
      ${escapeHTML(habit.name)}
    </div>

    <div class="habit-frequency">
      Objectif : ${target} jour${target > 1 ? "s" : ""} / semaine
    </div>

  </div>

`;


const actions =
  document.createElement("div");

actions.className =
  "habit-actions";


const editButton =
  document.createElement("button");

editButton.className =
  "text-button";

editButton.textContent =
  "Modifier";

editButton.onclick =
  () => editHabit(habit.id);

actions.appendChild(
  editButton
);


top.appendChild(
  actions
);


const progress =
  document.createElement("div");

progress.className =
  "habit-progress";

progress.innerHTML = `

  <span class="habit-progress-text">
    <strong>${count}</strong> / ${target} jour${target > 1 ? "s" : ""}
  </span>

  ${statusHTML}

`;


const daysContainer =
  document.createElement("div");

daysContainer.className =
  "habit-days";


getWeekDates().forEach(
  (date, index) => {

    const key =
      formatDate(date);

    const button =
      document.createElement("button");

    button.className =
      "day-dot";

    button.textContent =
      DAYS[index];


    if (
      habit.completed?.includes(key)
    ) {

      button.classList.add(
        "done"
      );

    }


    if (
      key === getTodayKey()
    ) {

      button.classList.add(
        "today"
      );

    }


    button.title =
      date.toLocaleDateString(
        "fr-FR"
      );


    button.onclick =
      () =>
        toggleHabit(
          habit.id,
          key
        );


    daysContainer.appendChild(
      button
    );

  }
);


card.appendChild(top);

card.appendChild(progress);

card.appendChild(
  daysContainer
);

container.appendChild(card);
```

});

renderMonthlySummary();

}

/* -----------------------------
TOGGLE HABIT
----------------------------- */

function toggleHabit(
habitId,
dateKey
) {

const habit =
data.habits.find(
h => h.id === habitId
);

if (!habit) return;

if (!habit.completed) {
habit.completed = [];
}

const previousCount =
getHabitWeekCount(habit);

const index =
habit.completed.indexOf(
dateKey
);

if (index >= 0) {

```
habit.completed.splice(
  index,
  1
);
```

} else {

```
habit.completed.push(
  dateKey
);
```

}

const newCount =
getHabitWeekCount(habit);

saveData();

renderHabits();

renderCalendar();

if (
newCount === habit.frequency &&
previousCount < habit.frequency
) {

```
showCelebration(
  "Objectif atteint",
  `${habit.frequency} jour${habit.frequency > 1 ? "s" : ""} cette semaine`
);
```

}

if (
newCount === habit.frequency + 1 &&
previousCount === habit.frequency
) {

```
showCelebration(
  "Tu t'es surpassé",
  "Tu es allé un peu plus loin que prévu."
);
```

}

}

/* -----------------------------
CELEBRATION
----------------------------- */

function showCelebration(
title,
text
) {

const celebration =
document.getElementById(
"celebration"
);

document
.getElementById(
"celebrationTitle"
)
.textContent =
title;

document
.getElementById(
"celebrationText"
)
.textContent =
text;

celebration.classList.remove(
"hidden"
);

setTimeout(() => {

```
celebration.classList.add(
  "hidden"
);
```

}, 1800);

}

/* -----------------------------
HABIT MODAL
----------------------------- */

function openHabitModal(
habit = null
) {

const modal =
document.getElementById(
"habitModal"
);

modal.classList.remove(
"hidden"
);

editingHabitId =
habit?.id || null;

document
.getElementById(
"habitModalTitle"
)
.textContent =
habit
? "Modifier l'habitude"
: "Créer une habitude";

document
.getElementById(
"habitName"
)
.value =
habit?.name || "";

const frequency =
habit?.frequency || 7;

document
.querySelectorAll(
"#frequencySelector button"
)
.forEach(button => {

```
  button.classList.toggle(
    "selected",
    Number(
      button.dataset.days
    ) === frequency
  );

});
```

document
.getElementById(
"saveHabitButton"
)
.textContent =
habit
? "Enregistrer"
: "Ajouter";

}

function closeHabitModal() {

document
.getElementById(
"habitModal"
)
.classList.add(
"hidden"
);

editingHabitId =
null;

}

function saveHabitFromModal() {

const name =
document
.getElementById(
"habitName"
)
.value
.trim();

if (!name) {

```
alert(
  "Donne un nom à ton habitude."
);

return;
```

}

const selected =
document.querySelector(
"#frequencySelector button.selected"
);

const frequency =
Number(
selected?.dataset.days || 7
);

if (editingHabitId) {

```
const habit =
  data.habits.find(
    h => h.id === editingHabitId
  );

if (habit) {

  habit.name =
    name;

  habit.frequency =
    frequency;

}
```

} else {

```
if (
  data.habits.length >= 10
) {

  alert(
    "Tu as atteint la limite de 10 habitudes."
  );

  return;

}


data.habits.push({

  id:
    crypto.randomUUID(),

  name,

  frequency,

  completed: []

});
```

}

saveData();

renderHabits();

closeHabitModal();

}

function editHabit(id) {

const habit =
data.habits.find(
h => h.id === id
);

if (!habit) return;

openHabitModal(
habit
);

}

/* -----------------------------
MONTHLY SUMMARY
----------------------------- */

function getMonthDates(
year,
month
) {

const dates = [];

const days =
new Date(
year,
month + 1,
0
).getDate();

for (
let day = 1;
day <= days;
day++
) {

```
dates.push(
  new Date(
    year,
    month,
    day
  )
);
```

}

return dates;

}

function getExpectedDaysForMonth(
habit,
year,
month
) {

const dates =
getMonthDates(
year,
month
);

let expected = 0;

dates.forEach(date => {

```
const index =
  getDayIndex(date);

/*
  On calcule une moyenne hebdomadaire
  répartie sur les jours du mois.

  L'objectif reste celui défini
  par l'utilisateur.
*/

const daysInMonth =
  dates.length;

const expectedForMonth =
  Math.round(
    habit.frequency *
    (daysInMonth / 7)
  );


expected =
  expectedForMonth;
```

});

return expected;

}

function renderMonthlySummary() {

const container =
document.getElementById(
"monthlySummaryList"
);

if (!container) return;

container.innerHTML = "";

const now =
new Date();

const year =
now.getFullYear();

const month =
now.getMonth();

document
.getElementById(
"monthlyTitle"
)
.textContent =
now.toLocaleDateString(
"fr-FR",
{
month: "long"
}
)
.replace(/^./, c => c.toUpperCase());

if (
data.habits.length === 0
) {

```
container.innerHTML = `
  <div style="
    color:#718096;
    font-size:12px;
    padding:8px 2px;
  ">
    Ton récap apparaîtra ici lorsque tu auras créé une habitude.
  </div>
`;

return;
```

}

data.habits.forEach(
habit => {

```
  const dates =
    getMonthDates(
      year,
      month
    );


  const completed =
    dates.filter(
      date =>
        habit.completed?.includes(
          formatDate(date)
        )
    ).length;


  const expected =
    getExpectedDaysForMonth(
      habit,
      year,
      month
    );


  const percentage =
    expected === 0
      ? 0
      : Math.min(
          100,
          Math.round(
            completed /
            expected *
            100
          )
        );


  const item =
    document.createElement(
      "div"
    );

  item.className =
    "monthly-item";


  item.innerHTML = `

    <div class="monthly-item-top">

      <strong>
        ${escapeHTML(habit.name)}
      </strong>

      <span>
        ${completed} jour${completed > 1 ? "s" : ""}
        sur ${expected} prévu${expected > 1 ? "s" : ""}
      </span>

    </div>

    <div class="monthly-bar">

      <div style="
        width:${percentage}%;
      "></div>

    </div>

  `;


  container.appendChild(
    item
  );

}
```

);

}

/* -----------------------------
CALENDAR
----------------------------- */

function renderCalendarHabitSelector() {

const container =
document.getElementById(
"calendarHabitSelector"
);

container.innerHTML = "";

if (
data.habits.length === 0
) return;

if (
!selectedCalendarHabit ||
!data.habits.some(
h =>
h.id === selectedCalendarHabit
)
) {

```
selectedCalendarHabit =
  data.habits[0].id;
```

}

data.habits.forEach(
habit => {

```
  const button =
    document.createElement(
      "button"
    );

  button.textContent =
    habit.name;


  button.classList.toggle(
    "active",
    habit.id ===
      selectedCalendarHabit
  );


  button.onclick = () => {

    selectedCalendarHabit =
      habit.id;

    renderCalendarHabitSelector();

    renderCalendar();

  };


  container.appendChild(
    button
  );

}
```

);

}

function renderCalendar() {

const grid =
document.getElementById(
"calendarGrid"
);

const title =
document.getElementById(
"calendarMonth"
);

grid.innerHTML = "";

const year =
calendarDate.getFullYear();

const month =
calendarDate.getMonth();

title.textContent =
calendarDate.toLocaleDateString(
"fr-FR",
{
month: "long",
year: "numeric"
}
);

const firstDay =
new Date(
year,
month,
1
);

const daysInMonth =
new Date(
year,
month + 1,
0
).getDate();

const startingDay =
getDayIndex(
firstDay
);

for (
let i = 0;
i < startingDay;
i++
) {

```
const empty =
  document.createElement(
    "div"
  );

empty.className =
  "calendar-day empty";

grid.appendChild(
  empty
);
```

}

const habit =
data.habits.find(
h =>
h.id ===
selectedCalendarHabit
);

for (
let day = 1;
day <= daysInMonth;
day++
) {

```
const date =
  new Date(
    year,
    month,
    day
  );


const key =
  formatDate(date);


const cell =
  document.createElement(
    "div"
  );

cell.className =
  "calendar-day";

cell.textContent =
  day;


if (
  habit?.completed?.includes(
    key
  )
) {

  cell.classList.add(
    "done"
  );

}


if (
  key === getTodayKey()
) {

  cell.classList.add(
    "today"
  );

}


grid.appendChild(
  cell
);
```

}

}

function changeMonth(
amount
) {

calendarDate =
new Date(
calendarDate.getFullYear(),
calendarDate.getMonth() +
amount,
1
);

renderCalendar();

}

/* -----------------------------
DAILY JOURNAL
----------------------------- */

function saveDailyJournal() {

const textarea =
document.getElementById(
"dailyNotes"
);

const notes =
textarea.value.trim();

if (!notes) {

```
alert(
  "Écris quelques mots avant d'enregistrer."
);

return;
```

}

data.dailyJournal.unshift({

```
id:
  crypto.randomUUID(),

date:
  getTodayKey(),

notes
```

});

saveData();

textarea.value = "";

renderReflectionHistory();

}

/* -----------------------------
WEEKLY WINDOW
----------------------------- */

function isWeeklyReflectionOpen() {

const now =
new Date();

const day =
now.getDay();

const hour =
now.getHours();

/*
Dimanche à partir de 19h
jusqu'au lundi 23h59.

```
Dimanche = 0
Lundi = 1
```

*/

if (
day === 0 &&
hour >= 19
) {

```
return true;
```

}

if (
day === 1
) {

```
return true;
```

}

return false;

}

function renderWeeklyReflectionAvailability() {

const locked =
document.getElementById(
"weeklyLocked"
);

const reflection =
document.getElementById(
"weeklyReflection"
);

const status =
document.getElementById(
"weeklyStatus"
);

if (
isWeeklyReflectionOpen()
) {

```
locked.classList.add(
  "hidden"
);

reflection.classList.remove(
  "hidden"
);

status.textContent =
  "Disponible";
```

} else {

```
locked.classList.remove(
  "hidden"
);

reflection.classList.add(
  "hidden"
);

status.textContent =
  "Dimanche 19h";
```

}

}

/* -----------------------------
WEEKLY REFLECTION
----------------------------- */

function setupReflectionChoices() {

document
.querySelectorAll(
".reflection-choices button"
)
.forEach(
button => {

```
    button.onclick =
      () => {

        button.classList.toggle(
          "selected"
        );

      };

  }
);
```

}

function saveWeeklyReflection() {

const positive =
[
...document.querySelectorAll(
"#positiveChoices button.selected"
)
].map(
button =>
button.dataset.choice
);

const difficult =
[
...document.querySelectorAll(
"#negativeChoices button.selected"
)
].map(
button =>
button.dataset.choice
);

const positiveOne =
document
.getElementById(
"positiveOne"
)
.value
.trim();

const positiveTwo =
document
.getElementById(
"positiveTwo"
)
.value
.trim();

const positiveThree =
document
.getElementById(
"positiveThree"
)
.value
.trim();

const notes =
document
.getElementById(
"weeklyNotes"
)
.value
.trim();

if (
!positiveOne ||
!positiveTwo ||
!positiveThree
) {

```
alert(
  "Prends un instant pour noter tes 3 choses positives de la semaine."
);

return;
```

}

data.weeklyReflections.unshift({

```
id:
  crypto.randomUUID(),

week:
  formatDate(
    getMonday()
  ),

positive,

difficult,

positiveThings: [
  positiveOne,
  positiveTwo,
  positiveThree
],

notes
```

});

saveData();

document
.querySelectorAll(
".reflection-choices button"
)
.forEach(
button =>
button.classList.remove(
"selected"
)
);

document
.getElementById(
"positiveOne"
)
.value = "";

document
.getElementById(
"positiveTwo"
)
.value = "";

document
.getElementById(
"positiveThree"
)
.value = "";

document
.getElementById(
"weeklyNotes"
)
.value = "";

renderReflectionHistory();

alert(
"Ton bilan a été enregistré."
);

}

/* -----------------------------
REFLECTION HISTORY
----------------------------- */

function renderReflectionHistory() {

const container =
document.getElementById(
"reflectionHistory"
);

container.innerHTML = "";

const entries = [];

data.dailyJournal.forEach(
entry => {

```
  entries.push({

    date:
      entry.date,

    type:
      "Journal quotidien",

    content:
      entry.notes,

    positive:
      false

  });

}
```

);

data.weeklyReflections.forEach(
entry => {

```
  entries.push({

    date:
      entry.week,

    type:
      "Bilan de la semaine",

    content:
      entry.positiveThings.join(
        " · "
      ),

    positive:
      true

  });

}
```

);

entries.sort(
(a, b) =>
b.date.localeCompare(
a.date
)
);

if (
entries.length === 0
) {

```
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
```

}

entries.forEach(
entry => {

```
  const div =
    document.createElement(
      "div"
    );

  div.className =
    "reflection-entry";


  const date =
    new Date(
      entry.date
    );


  const formatted =
    date.toLocaleDateString(
      "fr-FR",
      {
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    );


  div.innerHTML = `

    <div class="reflection-entry-date">
      ${formatted}
    </div>

    <div class="reflection-entry-type">
      ${entry.type}
    </div>

    <p class="${
      entry.positive
        ? "reflection-positive"
        : ""
    }">
      ${escapeHTML(
        entry.content
      )}
    </p>

  `;


  container.appendChild(
    div
  );

}
```

);

}

/* -----------------------------
NAVIGATION
----------------------------- */

function navigateTo(
pageId
) {

document
.querySelectorAll(
".page"
)
.forEach(
page =>
page.classList.remove(
"active"
)
);

const page =
document.getElementById(
pageId
);

if (page) {

```
page.classList.add(
  "active"
);
```

}

document
.querySelectorAll(
".nav-item"
)
.forEach(
button => {

```
    button.classList.toggle(
      "active",
      button.dataset.page ===
        pageId
    );

  }
);
```

if (
pageId === "calendarPage"
) {

```
renderCalendarHabitSelector();

renderCalendar();
```

}

if (
pageId === "reflectionPage"
) {

```
renderReflectionHistory();

renderWeeklyReflectionAvailability();
```

}

if (
pageId === "settingsPage"
) {

```
updateSettings();
```

}

}

/* -----------------------------
SETTINGS
----------------------------- */

function updateSettings() {

document
.getElementById(
"currentName"
)
.textContent =
data.name ||
"Non renseigné";

}

function changeName() {

const name =
prompt(
"Comment veux-tu être appelé(e) dans Alizeti ?",
data.name || ""
);

if (
name === null
) return;

data.name =
name.trim();

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

localStorage.removeItem(
STORAGE_KEY
);

data =
createInitialData();

renderAll();

}

/* -----------------------------
UTILS
----------------------------- */

function escapeHTML(
value
) {

return String(value)
.replaceAll(
"&",
"&"
)
.replaceAll(
"<",
"<"
)
.replaceAll(
">",
">"
)
.replaceAll(
'"',
"""
)
.replaceAll(
"'",
"'"
);

}

/* -----------------------------
RENDER ALL
----------------------------- */

function renderAll() {

renderGreeting();

renderHabits();

renderCalendarHabitSelector();

renderCalendar();

renderReflectionHistory();

renderWeeklyReflectionAvailability();

updateSettings();

}

/* -----------------------------
EVENTS
----------------------------- */

document
.querySelectorAll(
".nav-item"
)
.forEach(
button => {

```
  button.onclick =
    () =>
      navigateTo(
        button.dataset.page
      );

}
```

);

document
.getElementById(
"settingsButton"
)
.onclick =
() =>
navigateTo(
"settingsPage"
);

document
.getElementById(
"addHabitButton"
)
.onclick =
() =>
openHabitModal();

document
.getElementById(
"closeHabitModal"
)
.onclick =
() =>
closeHabitModal();

document
.querySelector(
".modal-overlay"
)
.onclick =
() =>
closeHabitModal();

document
.getElementById(
"saveHabitButton"
)
.onclick =
() =>
saveHabitFromModal();

document
.querySelectorAll(
"#frequencySelector button"
)
.forEach(
button => {

```
  button.onclick =
    () => {

      document
        .querySelectorAll(
          "#frequencySelector button"
        )
        .forEach(
          item =>
            item.classList.remove(
              "selected"
            )
        );

      button.classList.add(
        "selected"
      );

    };

}
```

);

document
.getElementById(
"previousMonth"
)
.onclick =
() =>
changeMonth(-1);

document
.getElementById(
"nextMonth"
)
.onclick =
() =>
changeMonth(1);

document
.getElementById(
"saveDailyJournal"
)
.onclick =
() =>
saveDailyJournal();

document
.getElementById(
"saveWeeklyReflection"
)
.onclick =
() =>
saveWeeklyReflection();

document
.getElementById(
"changeNameButton"
)
.onclick =
() =>
changeName();

document
.getElementById(
"resetButton"
)
.onclick =
() =>
resetData();

setupReflectionChoices();

renderAll();
