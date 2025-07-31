const { jsPDF } = window.jspdf;

document.addEventListener("DOMContentLoaded", () => {
  const year = new Date().getFullYear();
  document.getElementById("yearInput").value = year;
  generateCalendar(year);
});

function showYear() {
  const year = parseInt(document.getElementById("yearInput").value);
  generateCalendar(year);
}

function prevYear() {
  document.getElementById("yearInput").stepDown();
  showYear();
}

function nextYear() {
  document.getElementById("yearInput").stepUp();
  showYear();
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

function generateCalendar(year) {
  const wrapper = document.getElementById("calendarWrapper");
  wrapper.innerHTML = "";
  const months = [...Array(12).keys()];
  months.forEach(month => {
    const container = document.createElement("div");
    container.className = "month";
    const date = new Date(year, month, 1);
    const monthName = date.toLocaleString("nl-NL", { month: "long" });
    container.innerHTML = `<h3>${monthName} ${year}</h3>` + generateMonthTable(year, month);
    wrapper.appendChild(container);
  });
}

function generateMonthTable(year, month) {
  const days = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
  const holidays = getDutchHolidays(year);
  const date = new Date(year, month, 1);
  let table = "<table><thead><tr><th>Wk</th>" + days.map(d => `<th>${d}</th>`).join("") + "</tr></thead><tbody>";

  const startDay = (date.getDay() + 6) % 7; // maandag = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let day = 1 - startDay;
  for (let week = 0; day <= daysInMonth; week++) {
    table += "<tr><td>" + getWeekNumber(new Date(year, month, Math.max(day, 1))) + "</td>";
    for (let d = 0; d < 7; d++, day++) {
      if (day < 1 || day > daysInMonth) {
        table += "<td></td>";
      } else {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const isWeekend = d >= 5;
        const isHoliday = holidays.includes(dateStr);
        table += `<td class="${isWeekend ? "weekend" : ""} ${isHoliday ? "holiday" : ""}">${day}</td>`;
      }
    }
    table += "</tr>";
  }

  table += "</tbody></table>";
  return table;
}

function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  return 1 + Math.floor((d - firstThursday) / (7 * 24 * 60 * 60 * 1000));
}

function getDutchHolidays(year) {
  const holidays = [];
  const add = (m, d) => holidays.push(`${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  add(1, 1);   // Nieuwjaarsdag
  add(4, 27);  // Koningsdag
  add(5, 5);   // Bevrijdingsdag
  add(12, 25); // Eerste Kerstdag
  add(12, 26); // Tweede Kerstdag
  // Pasen en Pinksteren (berekening)
  const easter = getEasterDate(year);
  const ascension = new Date(easter);
  ascension.setDate(easter.getDate() + 39);
  const pentecost = new Date(easter);
  pentecost.setDate(easter.getDate() + 49);
  const secondPentecost = new Date(easter);
  secondPentecost.setDate(easter.getDate() + 50);
  [easter, ascension, pentecost, secondPentecost].forEach(d => {
    holidays.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  });
  return holidays;
}

function getEasterDate(year) {
  const f = Math.floor,
        G = year % 19,
        C = f(year / 100),
        H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
        I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
        J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
        L = I - J,
        month = 3 + f((L + 40) / 44),
        day = L + 28 - 31 * f(month / 4);
  return new Date(year, month - 1, day);
}

function exportPDF() {
  const container = document.getElementById("calendarWrapper");
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  doc.html(container, {
    callback: pdf => pdf.save("kalender_" + document.getElementById("yearInput").value + ".pdf"),
    margin: [10, 10, 10, 10],
    html2canvas: { scale: 1, allowTaint: true }
  });
}