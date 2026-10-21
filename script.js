(function () {
  const cfg = window.DATE_CONFIG;
  const steps = [...document.querySelectorAll(".step")];
  const lastStep = steps.length - 1;
  let current = 0;

  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, "0");
  function fillSelect(sel, items) {
    items.forEach(([value, text]) => sel.add(new Option(text, value)));
  }

  // ----- Navigace -----
  function show(i) {
    steps[current].classList.remove("active");
    current = i;
    steps[current].classList.add("active");
    $("progressBar").style.width = (current / lastStep) * 100 + "%";
    if (current === lastStep - 1) renderSummary();
  }

  document.querySelectorAll("[data-next]").forEach((b) =>
    b.addEventListener("click", () => validate(current) && show(current + 1))
  );
  document.querySelectorAll("[data-back]").forEach((b) =>
    b.addEventListener("click", () => show(current - 1))
  );

  // ----- Krok 0: Ano / utíkající Ne -----
  $("yesBtn").addEventListener("click", () => show(1));
  const noBtn = $("noBtn");
  const noTexts = ["Ne 🫣", "Opravdu?", "Fakt ne?", "Zkus to znova 🥺", "Tohle nejde 😜", "Klikni na Ano!"];
  let noCount = 0;
  function dodge(e) {
    e.preventDefault();
    const card = document.querySelector(".card").getBoundingClientRect();
    noBtn.style.position = "fixed";
    noBtn.style.left = card.left + Math.random() * Math.max(card.width - 180, 0) + "px";
    noBtn.style.top = card.top + Math.random() * Math.max(card.height - 60, 0) + "px";
    noBtn.textContent = noTexts[++noCount % noTexts.length];
  }
  noBtn.addEventListener("mouseenter", dodge);
  noBtn.addEventListener("click", dodge);
  noBtn.addEventListener("touchstart", dodge, { passive: false });

  // ----- Krok 1: datum (den. měsíc rok) a čas (24 h) -----
  const MONTHS = ["leden", "únor", "březen", "duben", "květen", "červen",
    "červenec", "srpen", "září", "říjen", "listopad", "prosinec"];
  const today = new Date();
  fillSelect($("daySelect"), Array.from({ length: 31 }, (_, i) => [i + 1, i + 1 + "."]));
  fillSelect($("monthSelect"), MONTHS.map((m, i) => [i, m]));
  fillSelect($("yearSelect"), [0, 1].map((o) => [today.getFullYear() + o, today.getFullYear() + o]));
  fillSelect($("hourSelect"), Array.from({ length: 24 }, (_, h) => [h, pad(h)]));
  fillSelect($("minuteSelect"), [0, 15, 30, 45].map((m) => [m, pad(m)]));
  $("daySelect").value = today.getDate();
  $("monthSelect").value = today.getMonth();
  $("hourSelect").value = 19;

  function getDate() {
    return new Date(+$("yearSelect").value, +$("monthSelect").value, +$("daySelect").value);
  }

  // ----- Mřížky s možnostmi (text, pak emoji) -----
  function buildOptions(containerId, items) {
    const box = $(containerId);
    items.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option";
      btn.dataset.value = item.label;
      const name = document.createElement("span");
      name.textContent = item.label;
      const emoji = document.createElement("span");
      emoji.className = "emoji";
      emoji.textContent = item.emoji;
      btn.append(name, emoji);
      btn.addEventListener("click", () => btn.classList.toggle("selected"));
      box.appendChild(btn);
    });
    // Vlastní odpověď
    const wrap = document.createElement("div");
    wrap.className = "option other-input";
    const other = document.createElement("input");
    other.placeholder = "Něco jiného…";
    wrap.appendChild(other);
    box.appendChild(wrap);
  }

  function getChoices(containerId) {
    const box = $(containerId);
    const picked = [...box.querySelectorAll(".option.selected")].map((o) => o.dataset.value);
    const other = box.querySelector(".other-input input").value.trim();
    if (other) picked.push(other);
    return picked;
  }

  buildOptions("activityOptions", cfg.activities);
  buildOptions("foodOptions", cfg.foods);

  // ----- Jméno + hláška -----
  fillSelect($("nameSelect"), cfg.names.map((n) => [n, n]));
  $("nameSelect").addEventListener("change", (e) => {
    const v = e.target.value;
    $("joke").textContent = v && v !== cfg.realName
      ? cfg.jokes[Math.floor(Math.random() * cfg.jokes.length)]
      : "";
    $("err3").textContent = "";
  });

  // ----- Validace -----
  function validate(step) {
    const err = (msg) => {
      const el = $("err" + step);
      if (el) el.textContent = msg;
      return !msg;
    };
    switch (step) {
      case 1: {
        const d = getDate();
        if (d.getDate() !== +$("daySelect").value) return err("Tenhle den v daném měsíci není 🙃");
        const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (d < midnight) return err("Tohle datum už bylo ⏳");
        return err("");
      }
      case 2: {
        const any = getChoices("activityOptions").length + getChoices("foodOptions").length;
        return err(any ? "" : "Vyber aktivitu, jídlo, nebo obojí ✨");
      }
      case 3: {
        const v = $("nameSelect").value;
        if (!v) return err("Vyber, kdo jsi 😉");
        if (v !== cfg.realName) return err("Tudy cesta nevede, vyber správné jméno 😉");
        return err("");
      }
      default: return true;
    }
  }

  // ----- Shrnutí a odeslání -----
  function collect() {
    const d = getDate();
    return {
      "Jméno": $("nameSelect").value,
      "Datum": `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()} (${d.toLocaleDateString("cs-CZ", { weekday: "long" })})`,
      "Čas": `${pad($("hourSelect").value)}:${pad($("minuteSelect").value)}`,
      "Aktivita": getChoices("activityOptions").join(", ") || "-",
      "Jídlo": getChoices("foodOptions").join(", ") || "-",
      "Poznámky": $("notesInput").value.trim() || "-",
    };
  }

  function renderSummary() {
    const dl = $("summary");
    dl.innerHTML = "";
    Object.entries(collect()).forEach(([k, v]) => {
      const row = document.createElement("div");
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = k;
      dd.textContent = v;
      row.append(dt, dd);
      dl.appendChild(row);
    });
  }

  const sendBtn = $("sendBtn");
  sendBtn.addEventListener("click", async () => {
    const errEl = $("sendErr");
    errEl.textContent = "";
    sendBtn.disabled = true;
    sendBtn.textContent = "Odesílám…";
    const data = collect();
    try {
      const res = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(cfg.formSubmitEmail), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...data,
          _subject: `Rande: ${data["Jméno"]}, ${data["Datum"]} v ${data["Čas"]}`,
          _template: "table",
          _captcha: "false",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) !== "true") throw new Error(json.message || "Požadavek selhal");
      show(lastStep);
    } catch (e) {
      errEl.textContent = "Nepodařilo se odeslat 😕 (" + e.message + "). Zkus to prosím znovu.";
      sendBtn.disabled = false;
      sendBtn.textContent = "Odeslat 💘";
    }
  });
})();
