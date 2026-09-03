(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const state = {
    booted: false,
    z: 200,
    opened: new Set(),
    terminalHistory: [],
    historyIndex: 0,
    trace: 0,
    entropy: Number(localStorage.getItem("akwaos.entropy") || 0),
    corruptionStage: Number(localStorage.getItem("akwaos.corruptionStage") || 0),
    lastReason: "",
    secretFlags: {
      ghostIndex: false
    }
  };

  const bootMessages = [
    ["00A1", "Power bus integrity", "OK"],
    ["00A3", "Memory lattice 640 KB", "OK"],
    ["00B7", "Mounting A:\\SYSTEM", "OK"],
    ["00C1", "Loading AKWA kernel 7.14.92-R", "OK"],
    ["01D2", "Restoring personnel cache", "OK"],
    ["01F0", "Checking research archive index", "WARN"],
    ["0214", "External uplink", "DISABLED"],
    ["026A", "Biometric profile AQ-S17-441", "OK"],
    ["02B9", "Security daemon / local only", "OK"],
    ["03E1", "RECYCLE cache integrity", "WARN"],
    ["04A0", "Starting desktop shell", "OK"]
  ];

  const fileContents = {
    protocol: {
      title: "PROTOCOL_626.TXT",
      body: `PROJECT №626 // EXCERPT
--------------------------------
OBJECTIVE:
Контролируемая связь носителя с внутренним феноменом.

STATUS:
Испытания продолжаются.

SERUM:
Стабилизирующая формула версии 6.2.

NOTICE:
Расхождение состава партии [REDACTED] зафиксировано после передачи в сектор C.

Доступ к полному отчёту ограничен.`
    },
    shift: {
      title: "SHIFT_HANDOVER_14.MEM",
      body: `SECURITY SHIFT HANDOVER
--------------------------------
POST: A-17
OFFICER: ADRIAN LAMO

02:40 — Сектор B закрыт на санитарный режим.
02:58 — Получен запрос на доступ к старой карте лаборатории.
03:07 — Камера 12 дала повторный ложный сигнал.
03:11 — В журнале проходов обнаружена запись без ID.
03:14 — [FILE TERMINATES UNEXPECTEDLY]`
    },
    nocturne: {
      title: "NOCTURNE_OBSERVATION.LOG",
      body: `ACCESS DENIED

Security clearance required: LEVEL 4
Current profile: LEVEL 3

Incident token: N04-7C-19`
    },
    beacon: {
      title: "BEACON_FRAGMENT.DAT",
      body: `▒▒ HEADER CORRUPTED ▒▒

B-00 / OBJECT "BEACON"
signal: 14.7 Hz
response: ███ █ ████
operator note:
"оно не отвечает. оно ..."

▒▒ CRC FAILURE ▒▒`
    },
    artemis_event: {
      title: "626_ASTERI_DANTE_EVENT.REP",
      body: `AKWA SCIENTIFIC DIRECTORATE
ARCHIVE / INCIDENT EXCERPT
--------------------------------

PARTICIPANT:
ARTEMIS ASTERI DANTE

PROGRAM:
EXPERIMENT №626

RECORD TYPE:
BEHAVIOURAL / ANOMALOUS EVENT

--------------------------------
INCIDENT SUMMARY
--------------------------------

В ходе содержания участник эксперимента №626
Артемис Астери Данте вступил в конфликт
с Иксионом Гарсией.

Вербальный конфликт перешёл в физическое столкновение.

По завершении инцидента Гарсия не подавал признаков жизни.
Смерть подтверждена медицинским персоналом.

Для Артемиса зарегистрирован первый подтверждённый
случай причинения смерти другому человеку.

После инцидента отмечено изменение отношения
других участников программы к Артемису:
избегание контакта, увеличение дистанции,
выраженные признаки страха.

--------------------------------
ANOMALOUS OBSERVATION
--------------------------------

Позднее у Артемиса зарегистрировано проявление
феномена, классифицированного как OSDEIN.

Локализация:
LEFT EYE

Описание:
интенсивное ярко-синее свечение,
визуально напоминающее пламя.

Источник и механизм проявления:
НЕ УСТАНОВЛЕН.

--------------------------------

ARCHIVE NOTE:
Отдельная выдержка из журнала событий.
Полное дело участника в данном архиве отсутствует.`
    },

    ixion_garcia: {
      title: "IXION_GARCIA_PERSONNEL.REP",
      body: `AKWA SCIENTIFIC DIRECTORATE
PERSONNEL ARCHIVE / SCIENTIFIC STAFF
--------------------------------

NAME:
IXION GARCIA

AGE:
28

POSITION:
SCIENTIST

STATUS:
CLOSED

DATE CLOSED:
14.09.235 о.р.

--------------------------------
SERVICE SUMMARY
--------------------------------

В ходе исследования образца крови Ноктурна
Иксионом Гарсией была обнаружена ранее
неизвестная активная субстанция.

Рабочее обозначение:

SDE — SOULFUL DISORIENTED ENERGY

Первичными наблюдениями установлено:

> субстанция сохраняет самостоятельную
  хаотичную активность;

> активность снижается при удалении
  образца от исходного носителя;

> основные показатели крови при этом
  существенно не изменяются;

> при повторном приближении образца
  к исходному носителю активность
  SDE восстанавливается.

Материалы были переданы в научный отдел.
В дальнейшей документации за феноменом
закрепилось название:

OSDEIN / SDE

--------------------------------
EXPERIMENT №626
--------------------------------

После начала испытаний Осдейна Гарсия
добровольно вошёл в число участников
эксперимента №626.

Продолжая наблюдения за проявлениями энергии,
он выявил повторяющиеся закономерности
и составил первую классификацию:

TYPE 01
TYPE 02
TYPE 03
TYPE 04
TYPE 05

Для проявлений, не соответствовавших
основным категориям, Гарсия ввёл обозначение:

SPECIALIZATION / СПЕЦИАЛИЗАЦИЯ

Позднее категория стала рассматриваться
как условный шестой тип Осдейна.

--------------------------------
REGISTERED CONTRIBUTION
--------------------------------

SDE_DISCOVERY
Первичное обнаружение Осдейна.

SDE_CARRIER_DEPENDENCY
Установлена зависимость активности
SDE от исходного носителя.

OSDEIN_CLASSIFICATION
Разработана первая классификация
основных типов Осдейна.

SPECIALIZATION
Выделена категория нестандартных проявлений.

--------------------------------
DEATH RECORD
--------------------------------

DATE:
14.09.235 о.р.

LOCATION:
AKWA LABORATORY COMPLEX

RELATED PROGRAM:
EXPERIMENT №626

INVOLVED PARTICIPANT:
ARTEMIS ASTERI DANTE

STATUS:
DEATH CONFIRMED

Иксион Гарсия погиб в результате конфликта
с Артемисом Астери Данте, участником
эксперимента №626.

Полученные повреждения оказались
несовместимы с жизнью.

По результатам внутреннего расследования
непосредственная ответственность за смерть
Гарсии была отнесена к Артемису.

CAUSE OF DEATH:
TRAUMATIC INJURIES

PERSONNEL STATUS:
TERMINATED

--------------------------------

FILE CLOSED:
14.09.235 о.р.`
    },

    ghost: {
      title: "FLYN_0.CHK",
      body: `RECOVERED CACHE FRAGMENT
--------------------------------
owner: unknown
alias field: [NULL]
route: SECURITY / A-17 / NIGHT

"...если они всё ещё верят имени в пропуске,
значит они смотрят не туда."

fragment ends.`
    },
    mail_shift: {
      title: "MAIL // SECURITY DESK",
      body: `FROM: SECURITY DESK
TO: AQ-S17-441
TIME: 02:31

Пересменка задерживается на 18 минут.
До прибытия смены сохранить пост A-17 и не покидать сектор без подтверждения.

Отдельно:
камера C-12 снова регистрирует движение при пустом коридоре.
Техслужба считает это остаточной ошибкой сенсора.`
    },
    mail_archive: {
      title: "MAIL // ARCHIVE CONTROL",
      body: `FROM: ARCHIVE CONTROL
TO: AQ-S17-441
TIME: 02:53

Ваш профиль повторно запросил старую схему лабораторного комплекса.

Запрос отклонён:
SEC-MAP / clearance 4 required.

Если запрос создавался автоматически, сообщите системному администратору.`
    },
    mail_service: {
      title: "MAIL // SYSTEM SERVICE",
      body: `FROM: SYSTEM SERVICE
TO: AQ-S17-441
TIME: 03:09

Плановая проверка локального профиля обнаружила расхождение одной биометрической контрольной суммы.

Работа терминала разрешена.
Повторная проверка назначена автоматически.

REF: BIO-CACHE / AQ-S17-441`
    }
  };

  const commandTable = {
    help() {
      return [
        "AVAILABLE COMMANDS",
        "help, whoami, status, ls, dir, cat <file>, open <file>, history, cls, clear, date, ver, netstat, ps"
      ];
    },
    whoami() {
      return [
        "ADRIAN LAMO",
        "AQ-S17-441 // SECURITY OFFICER",
        "clearance: LEVEL 3"
      ];
    },
    status() {
      return [
        "NODE A-17: ONLINE",
        "EXTERNAL NETWORK: DISABLED",
        "ARCHIVE INDEX: DEGRADED",
        "BIOMETRIC PROFILE: 1 MISMATCH"
      ];
    },
    ls() {
      const rows = [
        "PROTOCOL_626.TXT",
        "NOCTURNE_OBSERVATION.LOG",
        "BEACON_FRAGMENT.DAT",
        "SHIFT_HANDOVER_14.MEM",
        "626_ASTERI_DANTE_EVENT.REP",
        "IXION_GARCIA_PERSONNEL.REP"
      ];
      if (state.secretFlags.ghostIndex) rows.push("FLYN_0.CHK");
      return rows;
    },
    dir() {
      return commandTable.ls();
    },
    netstat() {
      const rows = [
        "LOCAL ROUTING TABLE",
        "A-17     127.0.0.1     ACTIVE",
        "ARCH-2   10.4.2.12     DEGRADED",
        "SEC-C    10.4.7.03     PASSIVE",
        "UPLINK   ---           DISABLED"
      ];
      if (state.corruptionStage >= 2) rows.push("???      10.4.?.??     UNRESOLVED");
      return rows;
    },
    ps() {
      const rows = [
        "001 KERNEL.SYS       ACTIVE",
        "014 WATCHDOG.EXE     ACTIVE",
        "027 AQ_INDEXER       IDLE",
        "041 SEC_CACHE        ACTIVE"
      ];
      if (state.corruptionStage >= 2) rows.push("0?? USER_SYNC         WAIT");
      return rows;
    },
    history() {
      return state.terminalHistory.length ? state.terminalHistory : ["history empty"];
    },
    date() {
      return ["SYSTEM DATE: ██/██/████", `RTC: ${new Date().toLocaleTimeString("ru-RU")}`];
    },
    ver() {
      return ["AKWAOS 7.14.92-R", "SHELL 3.8.1", "LOCAL NODE A-17"];
    }
  };

  function makeTone(freq = 520, duration = 0.05, volume = 0.02, type = "square") {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = makeTone.ctx || (makeTone.ctx = new AudioCtx());
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = volume;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  }

  function clickTone() {
    makeTone(780, 0.035, 0.018, "square");
  }

  function errorTone() {
    makeTone(180, 0.1, 0.025, "sawtooth");
    setTimeout(() => makeTone(120, 0.12, 0.018, "sawtooth"), 80);
  }

  function bootTone() {
    [220, 330, 440, 660].forEach((f, i) => {
      setTimeout(() => makeTone(f, 0.12, 0.018, "sine"), i * 90);
    });
  }

  function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    const full = now.toLocaleTimeString("ru-RU");
    $("#desktop-time").textContent = time;
    $("#boot-clock").textContent = full;
  }

  function toast(message, tone = false) {
    const el = $("#system-toast");
    el.textContent = message;
    el.classList.remove("is-hidden");
    if (tone) errorTone();
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.add("is-hidden"), 3200);
  }

  function bootSystem() {
    if (state.booted) return;
    state.booted = true;
    clickTone();

    $("#boot-gate").classList.add("is-hidden");
    $("#boot-screen").classList.remove("is-hidden");

    const logo = $("#akwa-logo");
    requestAnimationFrame(() => logo.classList.add("is-resolving"));

    const lines = $("#boot-lines");
    const progress = $("#boot-progress-bar");
    let i = 0;

    setTimeout(bootTone, 580);

    const tick = () => {
      if (i >= bootMessages.length) {
        progress.style.width = "100%";
        setTimeout(enterDesktop, 720);
        return;
      }

      const [code, text, status] = bootMessages[i];
      const row = document.createElement("div");
      row.className = "boot-line";
      row.innerHTML = `
        <span class="boot-line__code">${code}</span>
        <span>${text}</span>
        <span class="boot-line__status ${status === "WARN" ? "warn" : ""}">${status}</span>
      `;
      lines.appendChild(row);
      lines.scrollTop = lines.scrollHeight;
      makeTone(status === "WARN" ? 260 : 610, 0.025, 0.009);

      i += 1;
      progress.style.width = `${Math.round((i / bootMessages.length) * 100)}%`;
      const delay = status === "WARN" ? 350 : 145 + Math.random() * 165;
      setTimeout(tick, delay);
    };

    setTimeout(tick, 1250);
  }

  function enterDesktop() {
    $("#boot-screen").classList.add("is-hidden");
    const desktop = $("#desktop");
    desktop.classList.remove("is-hidden");
    requestAnimationFrame(() => desktop.classList.add("is-active"));
    localStorage.setItem("akwaos.booted", "1");
    setTimeout(() => toast("Сессия восстановлена: AQ-S17-441 / ADRIAN LAMO"), 1200);
  }

  function titleForWindow(id) {
    const map = {
      files: "АРХИВЫ",
      terminal: "ТЕРМИНАЛ",
      personnel: "ПЕРСОНАЛ",
      research: "ИССЛЕДОВАНИЯ",
      security: "SECURITY",
      mail: "MAIL",
      system: "SYSTEM",
      network: "NETWORK",
      game: "CALIBRATE.EXE",
      trash: "УДАЛЁННОЕ",
      viewer: "FILE VIEWER"
    };
    return map[id] || id.toUpperCase();
  }

  function focusWindow(el) {
    state.z += 1;
    el.style.zIndex = state.z;
  }

  function syncTaskbar() {
    const host = $("#taskbar-apps");
    host.innerHTML = "";
    [...state.opened].filter(id => id !== "viewer").forEach(id => {
      const btn = document.createElement("button");
      btn.className = "taskbar-app";
      btn.type = "button";
      btn.textContent = titleForWindow(id);
      btn.addEventListener("click", () => {
        const win = $(`[data-window="${id}"]`);
        if (!win) return;
        win.classList.remove("is-hidden");
        focusWindow(win);
      });
      host.appendChild(btn);
    });
  }

  function appendSystemEvent(message) {
    const log = $("#system-event-log");
    if (!log) return;
    const p = document.createElement("p");
    p.textContent = message;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
  }

  function applyCorruptionStage(stage, announce = false) {
    state.corruptionStage = Math.max(state.corruptionStage, stage);
    localStorage.setItem("akwaos.corruptionStage", String(state.corruptionStage));

    document.body.classList.toggle("system-corruption-1", state.corruptionStage >= 1);
    document.body.classList.toggle("system-corruption-2", state.corruptionStage >= 2);
    document.body.classList.toggle("system-corruption-3", state.corruptionStage >= 3);

    const integrity = state.corruptionStage >= 3 ? 94.1 : state.corruptionStage >= 2 ? 96.2 : state.corruptionStage >= 1 ? 97.1 : 97.8;
    const integrityValue = $("#integrity-value");
    const integrityMeter = $("#integrity-meter");
    const desktopIntegrity = $("#desktop-integrity-status");
    if (integrityValue) integrityValue.textContent = `${integrity.toFixed(1)}%`;
    if (integrityMeter) integrityMeter.style.width = `${integrity}%`;
    if (desktopIntegrity) desktopIntegrity.textContent = `INTEGRITY: ${integrity.toFixed(1)}%`;

    if (state.corruptionStage >= 2) {
      const processList = $("#process-list");
      if (processList && !$("#anomaly-process")) {
        const row = document.createElement("div");
        row.id = "anomaly-process";
        row.innerHTML = `<span>0??</span><b>USER_SYNC</b><i>WAIT</i>`;
        processList.appendChild(row);
      }
      $("#ghost-route-line")?.classList.remove("is-hidden");
      $("#ghost-node")?.classList.remove("is-hidden");
      const net = $("#desktop-net-status");
      if (net) net.textContent = "NET: ISOLATED / TABLE DEGRADED";
    }

    if (state.corruptionStage >= 3) {
      const security = $("#desktop-security-status");
      if (security) security.textContent = "SECURITY: LEVEL 3 / CACHE MISMATCH";
    }

    if (announce) {
      if (stage === 1) {
        toast("RTC variance detected. System clock resynchronized.", true);
        appendSystemEvent("[--:--] RTC variance corrected by WATCHDOG");
      } else if (stage === 2) {
        toast("Routing table variance. Local node count changed.", true);
        appendSystemEvent("[--:--] unresolved local route added to cache");
      } else if (stage === 3) {
        toast("Profile cache validation failed. Session retained.", true);
        appendSystemEvent("[--:--] BIO-CACHE checksum mismatch / session retained");
      }
      document.body.classList.add("glitch");
      setTimeout(() => document.body.classList.remove("glitch"), 260);
    }
  }

  function registerInteraction(reason = "generic") {
    state.lastReason = reason;
    state.entropy += 1;
    localStorage.setItem("akwaos.entropy", String(state.entropy));

    if (state.entropy >= 4 && state.corruptionStage < 1) {
      applyCorruptionStage(1, true);
    } else if (state.entropy >= 9 && state.corruptionStage < 2) {
      applyCorruptionStage(2, true);
    } else if (state.entropy >= 15 && state.corruptionStage < 3) {
      applyCorruptionStage(3, true);
    }
  }

  function openWindow(id) {
    clickTone();
    registerInteraction(`open:${id}`);
    const win = $(`[data-window="${id}"]`);
    if (!win) return;
    win.classList.remove("is-hidden");
    focusWindow(win);
    state.opened.add(id);
    syncTaskbar();

    if (id === "terminal") {
      setTimeout(() => $("#terminal-input")?.focus(), 50);
    }
  }

  function closeWindow(id) {
    clickTone();
    const win = $(`[data-window="${id}"]`);
    if (!win) return;
    win.classList.add("is-hidden");
    state.opened.delete(id);
    syncTaskbar();
  }

  function makeDraggable(win) {
    const handle = $(".drag-handle", win);
    if (!handle) return;

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    handle.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button")) return;
      dragging = true;
      focusWindow(win);
      handle.setPointerCapture(e.pointerId);
      const rect = win.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startLeft = rect.left;
      startTop = rect.top;
    });

    handle.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const maxLeft = Math.max(0, window.innerWidth - win.offsetWidth);
      const maxTop = Math.max(0, window.innerHeight - 50);
      const left = Math.min(maxLeft, Math.max(0, startLeft + e.clientX - startX));
      const top = Math.min(maxTop, Math.max(0, startTop + e.clientY - startY));
      win.style.left = `${left}px`;
      win.style.top = `${top}px`;
    });

    const stop = () => { dragging = false; };
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
  }

  function openFile(key) {
    registerInteraction(`file:${key}`);
    const item = fileContents[key];
    if (!item) return;
    const viewer = $("#file-viewer");
    $("#viewer-title").innerHTML = `<span class="window-led"></span> ${item.title}`;
    $("#viewer-content").textContent = item.body;
    viewer.classList.remove("is-hidden");
    focusWindow(viewer);
    state.opened.add("viewer");

    if (key === "nocturne") errorTone();
    else clickTone();
  }

  function terminalPrint(lines, cls = "") {
    const output = $("#terminal-output");
    const arr = Array.isArray(lines) ? lines : [String(lines)];
    arr.forEach(line => {
      const p = document.createElement("p");
      if (cls) p.className = cls;
      p.textContent = line;
      output.appendChild(p);
    });
    output.scrollTop = output.scrollHeight;
  }

  function handleCommand(raw) {
    const command = raw.trim();
    if (!command) return;

    state.terminalHistory.push(command);
    state.historyIndex = state.terminalHistory.length;
    registerInteraction(`cmd:${command.split(/\s+/)[0].toLowerCase()}`);
    terminalPrint([`A:\\USERS\\ALAMO>${command}`], "term-dim");

    const [head, ...rest] = command.split(/\s+/);
    const cmd = head.toLowerCase();
    const arg = rest.join(" ")
      .trim()
      .replace(/^["']|["']$/g, "")
      .toUpperCase();

    if (cmd === "clear" || cmd === "cls") {
      $("#terminal-output").innerHTML = "";
      return;
    }

    if (cmd === "cat" || cmd === "type" || cmd === "open") {
      const aliases = {
        "PROTOCOL_626.TXT": "protocol",
        "NOCTURNE_OBSERVATION.LOG": "nocturne",
        "BEACON_FRAGMENT.DAT": "beacon",
        "SHIFT_HANDOVER_14.MEM": "shift",
        "626_ASTERI_DANTE_EVENT.REP": "artemis_event",
        "IXION_GARCIA_PERSONNEL.REP": "ixion_garcia",
        "FLYN_0.CHK": "ghost"
      };
      const key = aliases[arg];
      if (!key || (key === "ghost" && !state.secretFlags.ghostIndex)) {
        terminalPrint(["File not found."], "term-error");
        errorTone();
        return;
      }
      terminalPrint(fileContents[key].body.split("\n"));
      return;
    }

    if (commandTable[cmd]) {
      terminalPrint(commandTable[cmd]());
      return;
    }

    if (cmd === "ping") {
      terminalPrint(["External routing disabled.", "127.0.0.1  <1ms"], "term-warn");
      return;
    }

    if (cmd === "akwa") {
      terminalPrint(["AKWA SCIENTIFIC DIRECTORATE", "Facility status: ARCHIVED / UNVERIFIED"]);
      return;
    }

    if (cmd === "626") {
      terminalPrint(["Syntax deprecated. Use: cat PROTOCOL_626.TXT"]);
      return;
    }

    terminalPrint([`'${head}' is not recognized by AKWA SHELL.`], "term-error");
    errorTone();
  }

  function setupTerminal() {
    const form = $("#terminal-form");
    const input = $("#terminal-input");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleCommand(input.value);
      input.value = "";
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        state.historyIndex = Math.max(0, state.historyIndex - 1);
        input.value = state.terminalHistory[state.historyIndex] || "";
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        state.historyIndex = Math.min(state.terminalHistory.length, state.historyIndex + 1);
        input.value = state.terminalHistory[state.historyIndex] || "";
      }
    });
  }

  function setupCalibration() {
    $("#calibrate-button").addEventListener("click", () => {
      const track = $(".calibration__track");
      const marker = $("#cal-marker");
      const trackRect = track.getBoundingClientRect();
      const markerRect = marker.getBoundingClientRect();
      const pct = ((markerRect.left - trackRect.left) / trackRect.width) * 100;
      const distance = Math.abs(50 - pct);
      const score = Math.max(0, 100 - distance * 3.2);
      const rounded = score.toFixed(1);

      $("#calibrate-result").textContent =
        score >= 98.3
          ? `RESULT: ${rounded}% // LOCAL RECORD OVERRIDDEN`
          : `RESULT: ${rounded}% // record: A.LAMO 98.3%`;

      makeTone(score >= 90 ? 880 : 360, 0.08, 0.02, "square");

      if (score >= 99.2 && !state.secretFlags.ghostIndex) {
        state.secretFlags.ghostIndex = true;
        localStorage.setItem("akwaos.ghostIndex", "1");
        setTimeout(() => {
          toast("Filesystem variance detected. Archive index changed.", true);
          $(".desktop")?.classList.add("glitch");
          setTimeout(() => $(".desktop")?.classList.remove("glitch"), 260);
        }, 450);
      }
    });
  }

  function setupHiddenTrace() {
    const watermark = $(".desktop__watermark");
    let taps = 0;
    let timer = null;

    watermark.addEventListener("click", () => {
      taps += 1;
      clearTimeout(timer);
      timer = setTimeout(() => taps = 0, 900);

      if (taps >= 4) {
        taps = 0;
        state.trace += 1;
        toast(`TRACE EVENT ${String(state.trace).padStart(2, "0")} // source mismatch`, true);
        document.body.classList.add("glitch");
        setTimeout(() => document.body.classList.remove("glitch"), 240);
      }
    });

    $("#trash-icon").addEventListener("dblclick", () => {
      if (!state.secretFlags.ghostIndex) {
        toast("RECYCLE CACHE: residual blocks present, index unavailable.");
      }
    });
  }

  function setupMenu() {
    $("#akwa-menu").addEventListener("click", () => {
      clickTone();
      toast("AKWAOS LOCAL SHELL // shutdown controls disabled by administrator.");
    });
  }

  function setupSecurity() {
    $("#security-map-button")?.addEventListener("click", () => {
      registerInteraction("security:map");
      errorTone();
      toast("SEC-MAP: clearance 4 required. Request written to audit cache.");
      appendSystemEvent("[--:--] denied SEC-MAP request by AQ-S17-441");
    });
  }

  function setupMail() {
    $$(".mail-row").forEach(row => {
      row.addEventListener("click", () => {
        openFile(row.dataset.file);
        row.querySelector(".mail-row__flag").textContent = "○";
      });
    });
  }

  function setupNetwork() {
    $$(".network-node").forEach(node => {
      node.addEventListener("click", () => {
        registerInteraction(`network:${node.dataset.node}`);
        const detail = $("#network-detail");
        const key = node.dataset.node;
        const details = {
          "A-17": "A-17 // local workstation // current session AQ-S17-441",
          "ARCH-2": "ARCH-2 // archival index // degraded response / read-only",
          "SEC-C": "SEC-C // security cache // passive routing only",
          "UNKNOWN": "Route entry has no registered hostname. Source field is blank."
        };
        if (detail) detail.textContent = details[key] || "No node data.";
        if (key === "UNKNOWN") {
          errorTone();
          appendSystemEvent("[--:--] unresolved route queried from A-17");
        } else {
          clickTone();
        }
      });
    });
  }

  function restoreCorruptionState() {
    applyCorruptionStage(state.corruptionStage, false);
  }

  function init() {
    updateClock();
    setInterval(updateClock, 1000);

    if (localStorage.getItem("akwaos.ghostIndex") === "1") {
      state.secretFlags.ghostIndex = true;
    }

    $("#start-system").addEventListener("click", bootSystem);

    $$("[data-open]").forEach(btn => {
      btn.addEventListener("click", () => openWindow(btn.dataset.open));
    });

    $$("[data-close]").forEach(btn => {
      btn.addEventListener("click", () => closeWindow(btn.dataset.close));
    });

    $$(".os-window").forEach(win => {
      makeDraggable(win);
      win.addEventListener("pointerdown", () => focusWindow(win));
    });

    $$(".file-row").forEach(row => {
      row.addEventListener("click", () => openFile(row.dataset.file));
    });

    setupTerminal();
    setupCalibration();
    setupHiddenTrace();
    setupMenu();
    setupSecurity();
    setupMail();
    setupNetwork();
    restoreCorruptionState();
  }

  init();
})();
