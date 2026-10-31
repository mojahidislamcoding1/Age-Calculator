(() => {
  'use strict';

  const birthInput = document.getElementById('birthdate');
  const calcBtn = document.getElementById('calcBtn');
  const resultCard = document.getElementById('resultCard');
  const chips = document.querySelectorAll('.chip');

  // Elements
  const yearsNum = document.getElementById('yearsNum');
  const monthsVal = document.getElementById('monthsVal');
  const daysVal = document.getElementById('daysVal');
  const hoursVal = document.getElementById('hoursVal');
  const minsVal = document.getElementById('minsVal');
  const secsVal = document.getElementById('secsVal');
  const nextBirthday = document.getElementById('nextBirthday');
  const daysUntil = document.getElementById('daysUntil');
  const dayBorn = document.getElementById('dayBorn');
  const totalDays = document.getElementById('totalDays');

  let birthDate = null;
  let timer = null;

  // Set max date to today
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  birthInput.max = `${yyyy}-${mm}-${dd}`;

  function parseDate(str) {
    if (!str) return null;
    const [y, m, d] = str.split('-').map(Number);
    if (!y || !m || !d) return null;
    const date = new Date(y, m - 1, d);
    // validate
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
    if (date > new Date()) return null;
    return date;
  }

  function diff(birth, now) {
    // Age in years/months/days using calendar arithmetic
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      // borrow days from previous month
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
      months -= 1;
    }
    if (months < 0) {
      months += 12;
      years -= 1;
    }

    // Hours/mins/secs from time-of-day (birth assumed at 00:00 local)
    const ms = now.getTime() - birth.getTime();
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return { years, months, days, hours, mins, secs, totalSeconds, ms };
  }

  function formatNum(n) { return n.toLocaleString(); }

  function animateCount(el, target, duration = 600) {
    const start = parseInt(el.textContent.replace(/,/g, ''), 10) || 0;
    if (start === target) return;
    const startTime = performance.now();
    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(start + (target - start) * eased);
      el.textContent = formatNum(val);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function render() {
    if (!birthDate) return;
    const now = new Date();
    const d = diff(birthDate, now);

    // animate big number only on first render handled separately; here just set
    yearsNum.textContent = formatNum(d.years);
    monthsVal.textContent = formatNum(d.months);
    daysVal.textContent = formatNum(d.days);
    hoursVal.textContent = formatNum(d.hours);
    minsVal.textContent = formatNum(d.mins);
    secsVal.textContent = formatNum(d.secs);

    // Next birthday
    const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    function makeBirthday(y) {
      if (birthDate.getMonth() === 1 && birthDate.getDate() === 29) {
        const isLeap = (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
        if (!isLeap) return new Date(y, 2, 1); // March 1
        return new Date(y, 1, 29);
      }
      return new Date(y, birthDate.getMonth(), birthDate.getDate());
    }
    let next = makeBirthday(now.getFullYear());
    if (next < todayMid) next = makeBirthday(now.getFullYear() + 1);
    const daysUntilBday = Math.ceil((next - now) / (1000 * 60 * 60 * 24));
    nextBirthday.textContent = next.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    daysUntil.textContent = daysUntilBday <= 0 ? 'Today! 🎉' : `${formatNum(daysUntilBday)} days`;

    const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    dayBorn.textContent = weekdays[birthDate.getDay()];

    const total = Math.floor((now - birthDate) / (1000 * 60 * 60 * 24));
    totalDays.textContent = `${formatNum(total)} days`;
  }

  function calculate() {
    const bd = parseDate(birthInput.value);
    if (!bd) {
      resultCard.classList.remove('reveal');
      void resultCard.offsetWidth;
      birthInput.classList.add('shake');
      setTimeout(() => birthInput.classList.remove('shake'), 400);
      return;
    }
    birthDate = bd;
    if (timer) clearInterval(timer);
    resultCard.hidden = false;
    resultCard.classList.remove('reveal');
    void resultCard.offsetWidth;
    resultCard.classList.add('reveal');

    // animate years count up from 0
    const now = new Date();
    const d = diff(bd, now);
    yearsNum.textContent = '0';
    animateCount(yearsNum, d.years, 900);

    render();
    timer = setInterval(render, 1000);
  }

  calcBtn.addEventListener('click', calculate);
  birthInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') calculate();
  });

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const y = Number(chip.dataset.years);
      const d = new Date();
      d.setFullYear(d.getFullYear() - y);
      const str = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      birthInput.value = str;
      calculate();
    });
  });
})();
