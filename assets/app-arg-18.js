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
    recoveredA17Session: localStorage.getItem("akwaos.a17PreviousRecovered") === "1",
    recoveredBioProfile: localStorage.getItem("akwaos.bioProfileRecovered") === "1",
    arg3RequestReady: localStorage.getItem("akwaos.arg3RequestReady") === "1",
    arg3DefenseComplete: localStorage.getItem("akwaos.arg3DefenseComplete") === "1",
    arg3AlarmRunning: false,
    arg3PurgeProgress: 0,
    arg3CommandIndex: -1,
    arg3LastCommandIndex: -1,
    arg3PurgeTimer: null,
    arg3AlarmTimers: [],
    arg3Music: null,
    arg3MusicFadeTimer: null,
    arg3MusicTargetVolume: 0.434,
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
03:14 — [FILE TERMINATES UNEXPECTEDLY]

RECOVERY MODE:
OPEN

REFERENCE:
TERMINAL HELP / OPEN`,
      html: `<div class="arg-document">
        <div>SECURITY SHIFT HANDOVER</div>
        <div>--------------------------------</div>
        <div>POST: A-17</div>
        <div>OFFICER: ADRIAN LAMO</div>
        <br>
        <div>02:40 — Сектор B закрыт на санитарный режим.</div>
        <div>02:58 — Получен запрос на доступ к старой карте лаборатории.</div>
        <div>03:07 — Камера 12 дала повторный ложный сигнал.</div>
        <div>03:11 — В журнале проходов обнаружена запись без ID.</div>
        <div>03:14 — [FILE TERMINATES UNEXPECTEDLY]</div>
        <br>
        <div>RECOVERY MODE:</div>
        <div class="arg-fragment-glitch arg-fragment-glitch--open arg-clue-stage1" data-fragment="OPEN">OPEN</div>
        <br>
        <div class="arg-reference">REFERENCE: TERMINAL HELP / OPEN</div>
      </div>`
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
SCIENTIST -> TEST SUBJECT

CLEARANCE:
LEVEL 0

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

Установлено:
> самостоятельная хаотичная активность;
> снижение активности при удалении от носителя;
> восстановление активности при приближении к носителю.

Материалы переданы в научный отдел.
В дальнейшей документации:
OSDEIN / SDE

--------------------------------
EXPERIMENT №626
--------------------------------

Гарсия добровольно вошёл в число участников
эксперимента №626.

Разработал первую классификацию:
TYPE 01
TYPE 02
TYPE 03
TYPE 04
TYPE 05

Для нестандартных проявлений ввёл:
SPECIALIZATION / СПЕЦИАЛИЗАЦИЯ

--------------------------------
REGISTERED CONTRIBUTION
--------------------------------

SDE_DISCOVERY
SDE_CARRIER_DEPENDENCY
OSDEIN_CLASSIFICATION
SPECIALIZATION

--------------------------------
DEATH RECORD
--------------------------------

DATE:
14.09.235 о.р.

INVOLVED PARTICIPANT:
ARTEMIS ASTERI DANTE

CAUSE OF DEATH:
TRAUMATIC INJURIES

PERSONNEL STATUS:
TERMINATED

FILE CLOSED:
14.09.235 о.р.`,
      html: `<div class="arg-document ixion-personnel-record">
        <div>AKWA SCIENTIFIC DIRECTORATE</div>
        <div>PERSONNEL ARCHIVE / SCIENTIFIC STAFF</div>
        <div>--------------------------------</div><br>

        <div>NAME:</div><div>IXION GARCIA</div><br>
        <div>AGE:</div><div>28</div><br>
        <div>POSITION:</div><div>SCIENTIST → TEST SUBJECT</div><br>
        <div>CLEARANCE:</div><div>LEVEL 0</div><br>
        <div>STATUS:</div><div>CLOSED</div><br>
        <div>DATE CLOSED:</div><div>14.09.235 о.р.</div><br>

        <div>--------------------------------</div>
        <div>SERVICE SUMMARY</div>
        <div>--------------------------------</div><br>

        <div>В ходе исследования образца крови Ноктурна обнаружена ранее неизвестная активная субстанция.</div><br>
        <div>Рабочее обозначение:</div>
        <div>SDE — SOULFUL DISORIENTED ENERGY</div><br>

        <div>Установлено:</div>
        <div>&gt; самостоятельная хаотичная активность;</div>
        <div>&gt; снижение активности при удалении от носителя;</div>
        <div>&gt; восстановление активности при приближении к носителю.</div><br>

        <div>Материалы переданы в научный отдел.</div>
        <div>В дальнейшей документации: OSDEIN / SDE</div><br>

        <div>--------------------------------</div>
        <div>EXPERIMENT №626</div>
        <div>--------------------------------</div><br>

        <div>Гарсия добровольно вошёл в число участников эксперимента №626.</div><br>
        <div>Первая классификация:</div>
        <div>TYPE 01 / TYPE 02 / TYPE 03 / TYPE 04 / TYPE 05</div><br>
        <div>Нестандартные проявления:</div>
        <div>SPECIALIZATION / СПЕЦИАЛИЗАЦИЯ</div><br>

        <div class="arg3-only">
          <div>--------------------------------</div>
          <div>LOCAL RESEARCH SHELL NOTE</div>
          <div>--------------------------------</div><br>

          <div>WRITE METHOD:</div>
          <div class="arg-fragment-glitch arg-fragment-glitch--stage3 arg-clue-stage3" data-fragment="ECHO">ECHO</div><br>

          <div>REQUEST TOKEN:</div>
          <div class="arg-fragment-glitch arg-fragment-glitch--stage3 arg-clue-stage3" data-fragment="SDE">SDE</div><br>

          <div>TARGET:</div>
          <div class="arg-fragment-glitch arg-fragment-glitch--stage3 arg-clue-stage3" data-fragment="IXION.REQ">IXION.REQ</div><br>

          <div class="arg-reference">REFERENCE: TERMINAL HELP / ECHO</div><br>
        </div>

        <div class="arg3-recovered-only">
          <div>--------------------------------</div>
          <div>RESTORED LOCAL RESEARCH CACHE</div>
          <div>--------------------------------</div><br>

          <div>REQUEST:</div>
          <div>SDE</div><br>

          <div>ORIGIN INDEX:</div>
          <div>IXION GARCIA</div><br>

          <div>RELATED SEARCH HISTORY</div><br>

          <div>ACCOUNT: AQ-S17-441</div><br>
          <div>03:01:44 // SDE</div>
          <div>03:02:17 // OSDEIN CLASSIFICATION</div>
          <div>03:03:02 // EXPERIMENT 626 / PARTICIPANTS</div>
          <div>03:04:51 // SUBJECT TRANSFER RECORDS</div>
          <div>03:06:13 // SECURITY MAP / HOLDING SECTOR</div><br>

          <div>SEVERAL REQUESTS EXCEEDED REGISTERED CLEARANCE.</div>
          <div>SEARCH HISTORY RESTORED FROM LOCAL RESEARCH CACHE.</div>
        </div>

        <div>--------------------------------</div>
        <div>DEATH RECORD</div>
        <div>--------------------------------</div><br>

        <div>DATE: 14.09.235 о.р.</div>
        <div>INVOLVED PARTICIPANT: ARTEMIS ASTERI DANTE</div>
        <div>CAUSE OF DEATH: TRAUMATIC INJURIES</div>
        <div>PERSONNEL STATUS: TERMINATED</div><br>
        <div>FILE CLOSED: 14.09.235 о.р.</div>
      </div>`
    },


    adrian_lamo: {
      title: "ADRIAN_LAMO_PERSONNEL.REP",
      body: `AKWA SCIENTIFIC DIRECTORATE
PERSONNEL ARCHIVE
--------------------------------

NAME:
ADRIAN LAMO

POSITION:
SECURITY OFFICER / NIGHT SHIFT

ID:
AQ-S17-441

CLEARANCE:
LEVEL 3

LOCAL NODE:
A17

LAST LOGIN:
03:14:07

STATUS:
ACTIVE

NOTES:
Обнаружено несоответствие одной биометрической записи.
Работа терминала разрешена.
Повторная сверка назначена автоматически.`,
      html: `<div class="arg-document">
        <div>AKWA SCIENTIFIC DIRECTORATE</div>
        <div>PERSONNEL ARCHIVE</div>
        <div>--------------------------------</div>
        <br>
        <div>NAME:</div>
        <div>ADRIAN LAMO</div>
        <br>
        <div>POSITION:</div>
        <div>SECURITY OFFICER / NIGHT SHIFT</div>
        <br>
        <div>ID:</div>
        <div class="arg-fragment-glitch arg-fragment-glitch--stage2 arg-clue-stage2" data-fragment="AQ-S17-441">AQ-S17-441</div>
        <br>
        <div>CLEARANCE:</div>
        <div>LEVEL 3</div>
        <br>
        <div>LOCAL NODE:</div>
        <div class="arg-fragment-glitch arg-clue-stage1" data-fragment="A17">A17</div>
        <br>
        <div>LAST LOGIN:</div>
        <div>03:14:07</div>
        <br>
        <div>STATUS:</div>
        <div>ACTIVE</div>
        <br>
        <div>NOTES:</div>
        <div>Обнаружено несоответствие одной биометрической записи.</div>
        <div>Работа терминала разрешена.</div>
        <div>Повторная сверка назначена автоматически.</div>
      </div>`
    },

    legit_tella: {
      title: "LEGIT_TELLA_ARCHIVE.REP",
      html: `<div class="corrupt-record">
        <div class="corrupt-record__head">AKWA PERSONNEL ARCHIVE // UNSTABLE RECORD</div>
        <div class="corrupt-record__line"><b>NAME:</b> LEGIT TELLA</div>
        <div class="corrupt-record__line"><b>AGE:</b> 30</div>
        <div class="corrupt-record__line"><b>POSITION:</b> [АРХИВИРОВАНО]</div>
        <div class="corrupt-record__line"><b>CLEARANCE:</b> LEVEL 4</div>
        <div class="corrupt-record__line"><b>STATUS:</b> ARCHIVED / PARTIALLY REMOVED</div>
        <div class="corrupt-record__line corrupt-record__line--dim">Связанные данные недоступны. Сегменты дела выведены из активного индекса.</div>
        <div class="corrupt-void" title="unstable memory sector"></div>
        <div class="corrupt-record__hint">WARNING: unstable archive zone. Не использовать повреждённую область.</div>
      </div>`,
      corrupt: true,
      logoutVoid: true
    },

    lonan: {
      title: "LONAN_DAMAGED.DAT",
      body: `AKWA SCIENTIFIC DIRECTORATE
PERSONNEL ARCHIVE / DAMAGED FILE
--------------------------------

NAME:
LONAN

AGE:
2*

POSITION:
EMPLOYEE -> TEST SUBJECT

CLEARANCE:
LEVEL 0

STATUS:
FILE DAMAGED

NOTES:
Часть персональной записи утрачена.
Переход из категории "сотрудник" в категорию
"подопытный" подтверждён.
Возраст указан с повреждением контрольного символа.`
    },

    varma_halla: {
      title: "VARMA_HALLA_SECURITY.REP",
      body: `AKWA SCIENTIFIC DIRECTORATE
PERSONNEL ARCHIVE
--------------------------------

NAME:
VARMA HALLA

AGE:
29

POSITION:
SECURITY OFFICER / AKWA BASE

CLEARANCE:
LEVEL 3

STATUS:
TRANSFERRED TO TEST SUBJECT

SUMMARY:
Сотрудник службы безопасности базы Akwa.
Позднее переведён в категорию подопытных.
Часть служебных допусков аннулирована,
архивный статус сохранён.`
    },

    valentina_hansen: {
      title: "VALENTINA_HANSEN_GEN.REP",
      body: `AKWA SCIENTIFIC DIRECTORATE
PERSONNEL ARCHIVE
--------------------------------

NAME:
VALENTINA RAKHMANOVA HANSEN

AGE:
32

POSITION:
GENETIC SCIENTIST

CLEARANCE:
LEVEL 2

STATUS:
ACTIVE RECORD

SUMMARY:
Научный сотрудник генетического профиля.
Запись доступна в сокращённом виде.
Подробные материалы вынесены в отдельный
исследовательский индекс.`
    },

    isaac_azim: {
      title: "ISAAC_AZIM_ORV.REP",
      body: `AKWA SCIENTIFIC DIRECTORATE
PERSONNEL ARCHIVE
--------------------------------

NAME:
ISAAC AZIM

AGE:
43

POSITION:
SCIENTIST / PROGRAMMER-ENGINEER ORV

CLEARANCE:
LEVEL 4

STATUS:
ACTIVE RECORD

SUMMARY:
Специалист по программным и инженерным системам ORV.
Допуск повышенного уровня.
Часть технических материалов привязана к системным узлам
и вынесена в отдельные служебные директории.`
    },

    sangus_torquemada: {
      title: "SANGUS_TORQUEMADA.ARCH",
      html: `<div class="corrupt-record">
        <div class="corrupt-record__head">AKWA PERSONNEL ARCHIVE // INDEX FAILURE</div>
        <div class="corrupt-record__line"><b>NAME:</b> SANGUS TORQUEMADA</div>
        <div class="corrupt-record__line"><b>STATUS:</b> [АРХИВИРОВАНО]</div>
        <div class="corrupt-record__line corrupt-record__line--dim">Остальные поля отсутствуют в локальном индексе.</div>
        <div class="corrupt-void" title="null sector"></div>
        <div class="corrupt-record__hint">CAUTION: clicking damaged sector may terminate session.</div>
      </div>`,
      corrupt: true,
      logoutVoid: true
    },

    leo_ellester: {
      title: "LEO_ELLESTER_PERSONNEL.REP",
      body: `AKWA SCIENTIFIC DIRECTORATE
PERSONNEL ARCHIVE
--------------------------------

NAME:
LEO ELLESTER

AGE:
25

POSITION:
SCIENTIST

CLEARANCE:
LEVEL 2

STATUS:
ACTIVE RECORD

SUMMARY:
Научный сотрудник общего профиля.
Личная запись доступна в краткой архивной форме.`
    },


    a17_previous_session: {
      title: "A17_PREVIOUS_SESSION.LOG",
      body: `AKWAOS SESSION RECOVERY
NODE: A17
--------------------------------

ACCOUNT:
AQ-S17-441

USER:
ADRIAN LAMO

SESSION 01
LOGIN: 02:51:06
LOGOUT: 03:03:41

SESSION 02
LOGIN: 02:57:18
LOGOUT: 03:14:07

SOURCE:
A17

--------------------------------

WARNING

SESSION TIME COLLISION DETECTED

OVERLAP:
00:06:23

IDENTITY CACHE:
VALID

BIOMETRIC CACHE:
MISMATCH

RECOVERY SOURCE:
BIO

REFERENCE:
TERMINAL HELP / BIO

--------------------------------

END OF FILE`,
      html: `<div class="arg-document">
        <div>AKWAOS SESSION RECOVERY</div>
        <div>NODE: A17</div>
        <div>--------------------------------</div><br>
        <div>ACCOUNT:</div><div>AQ-S17-441</div><br>
        <div>USER:</div><div>ADRIAN LAMO</div><br>
        <div>SESSION 01</div>
        <div>LOGIN: 02:51:06</div>
        <div>LOGOUT: 03:03:41</div><br>
        <div>SESSION 02</div>
        <div>LOGIN: 02:57:18</div>
        <div>LOGOUT: 03:14:07</div><br>
        <div>WARNING</div><br>
        <div>SESSION TIME COLLISION DETECTED</div><br>
        <div>BIOMETRIC CACHE:</div><div>MISMATCH</div><br>
        <div>RECOVERY SOURCE:</div>
        <div class="arg-fragment-glitch arg-fragment-glitch--stage2 arg-clue-stage2" data-fragment="BIO">BIO</div><br>
        <div class="arg-reference">REFERENCE: TERMINAL HELP / BIO</div><br>
        <div>--------------------------------</div>
        <div>END OF FILE</div>
      </div>`
    },


    bio_aq_s17_441: {
      title: "AQ-S17-441.CHK",
      body: `AKWA BIOMETRIC VALIDATION CACHE
--------------------------------

PROFILE:
AQ-S17-441

REGISTERED USER:
ADRIAN LAMO

ACCESS STATUS:
VALID

FACIAL MATCH:
91.4%

VOICE MATCH:
88.1%

RETINAL MATCH:
FAILED

BODY PROFILE:
INCONSISTENT

--------------------------------

WARNING:

CURRENT BIOMETRIC SAMPLE
DOES NOT FULLY MATCH
REGISTERED PERSONNEL RECORD.

SECURITY RESPONSE:
SESSION RETAINED

REASON:
MANUAL OVERRIDE

OVERRIDE SOURCE:
[CORRUPTED]

--------------------------------

END OF FILE`
    },


    ixion_request: {
      title: "IXION.REQ",
      body: `AKWA RESEARCH REQUEST CACHE
--------------------------------

REQUEST:
SDE

ORIGIN INDEX:
IXION GARCIA

STATUS:
RESTORED

--------------------------------

RELATED SEARCH HISTORY

ACCOUNT:
AQ-S17-441

03:01:44
QUERY:
SDE

03:02:17
QUERY:
OSDEIN CLASSIFICATION

03:03:02
QUERY:
EXPERIMENT 626 / PARTICIPANTS

03:04:51
QUERY:
SUBJECT TRANSFER RECORDS

03:06:13
QUERY:
SECURITY MAP / HOLDING SECTOR

--------------------------------

REQUESTOR:
ADRIAN LAMO

CLEARANCE:
LEVEL 3

SEVERAL REQUESTS EXCEEDED
REGISTERED CLEARANCE.

--------------------------------

ARCHIVE NOTE:

SEARCH HISTORY RESTORED
FROM LOCAL RESEARCH CACHE.

END OF FILE`
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

ARCHIVAL CLASS:
PREVIOUS_SESSION

SOURCE:
LOCAL SECURITY CACHE

Если запрос создавался автоматически, сообщите системному администратору.`,
      html: `<div class="arg-document">
        <div>FROM: ARCHIVE CONTROL</div>
        <div>TO: AQ-S17-441</div>
        <div>TIME: 02:53</div>
        <br>
        <div>Ваш профиль повторно запросил старую схему лабораторного комплекса.</div>
        <br>
        <div>Запрос отклонён:</div>
        <div>SEC-MAP / clearance 4 required.</div>
        <br>
        <div>ARCHIVAL CLASS:</div>
        <div class="arg-fragment-glitch arg-clue-stage1" data-fragment="PREVIOUS_SESSION">PREVIOUS_SESSION</div>
        <br>
        <div>SOURCE:</div>
        <div>LOCAL SECURITY CACHE</div>
        <br>
        <div>Если запрос создавался автоматически, сообщите системному администратору.</div>
      </div>`
    },
    mail_service: {
      title: "MAIL // SYSTEM SERVICE",
      body: `FROM: SYSTEM SERVICE
TO: AQ-S17-441
TIME: 03:09

Плановая проверка локального профиля обнаружила расхождение одной биометрической контрольной суммы.

Работа терминала разрешена.
Повторная проверка назначена автоматически.

REPORT FORMAT:
.LOG

BIO-CACHE FORMAT:
.CHK

REF: BIO-CACHE / AQ-S17-441`,
      html: `<div class="arg-document">
        <div>FROM: SYSTEM SERVICE</div>
        <div>TO: AQ-S17-441</div>
        <div>TIME: 03:09</div>
        <br>
        <div>Плановая проверка локального профиля обнаружила расхождение одной биометрической контрольной суммы.</div>
        <br>
        <div>Работа терминала разрешена.</div>
        <div>Повторная проверка назначена автоматически.</div>
        <br>
        <div>REPORT FORMAT:</div>
        <div class="arg-fragment-glitch arg-clue-stage1" data-fragment=".LOG">.LOG</div>
        <br>
        <div>BIO-CACHE FORMAT:</div>
        <div class="arg-fragment-glitch arg-fragment-glitch--stage2 arg-clue-stage2" data-fragment=".CHK">.CHK</div>
        <br>
        <div>REF: BIO-CACHE / AQ-S17-441</div>
      </div>`
    }
  };

  const commandTable = {
    help() {
      return [
        "AVAILABLE COMMANDS",
        "help, help open, help bio, help echo, whoami, status, ls, dir, cat <file>, open <file>, history, cls, clear, date, ver, netstat, ps"
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
      if (state.recoveredA17Session) rows.push("A17_PREVIOUS_SESSION.LOG    [RECOVERED]");
      if (state.recoveredBioProfile) rows.push("AQ-S17-441.CHK         [RECOVERED]");
      if (state.arg3RequestReady) rows.push("IXION.REQ                 [READY]");
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

  function ensureBioOverrideProcess() {
    if (!state.recoveredBioProfile) return;
    const processList = $("#process-list");
    if (!processList || $("#bio-override-process")) return;

    const row = document.createElement("div");
    row.id = "bio-override-process";
    row.className = "process-row process-row--interactive";
    row.innerHTML = `<span>017</span><b>BIO_OVERRIDE</b><i>SUSPENDED</i>`;
    row.setAttribute("title", "Open process details");
    row.addEventListener("click", () => {
      errorTone();
      toast("BIO_OVERRIDE // OWNER: UNKNOWN // LAST USED: 03:14", true);
      appendSystemEvent("[03:14] BIO_OVERRIDE owner unresolved / creation date corrupted");
    });
    processList.appendChild(row);
  }

  function updateArgStageVisuals() {
    document.body.classList.remove(
      "arg-stage-1",
      "arg-stage-2",
      "arg-stage-3",
      "arg-stage-3-ready",
      "arg-stage-complete"
    );

    if (state.arg3DefenseComplete) {
      document.body.classList.add("arg-stage-complete");
      return;
    }

    if (state.arg3RequestReady) {
      document.body.classList.add("arg-stage-3-ready");
      return;
    }

    if (state.recoveredBioProfile) {
      document.body.classList.add("arg-stage-3");
      return;
    }

    if (state.recoveredA17Session) {
      document.body.classList.add("arg-stage-2");
      return;
    }

    document.body.classList.add("arg-stage-1");
  }

  function ensureIxionRequestRow() {
    if (!state.arg3RequestReady) return;
    const browser = $("#window-files .file-browser");
    if (!browser || $("#ixion-request-row")) return;

    const row = document.createElement("button");
    row.id = "ixion-request-row";
    row.className = "file-row file-row--generated";
    row.type = "button";
    row.dataset.file = "ixion_request";
    row.innerHTML = `
      <span class="file-row__icon">▤</span>
      <span>IXION.REQ</span>
      <small>3 KB</small>
    `;
    row.addEventListener("click", () => openFile("ixion_request"));
    browser.appendChild(row);
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

    if (id === "system") {
      ensureBioOverrideProcess();
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

  function clearCorruptViewer() {
    const viewer = $("#file-viewer");
    const content = $("#viewer-content");
    viewer.classList.remove("viewer-corrupt");
    content.classList.remove("viewer-content--corrupt");
    $$(".corrupt-void", content).forEach(node => node.replaceWith(node.cloneNode(true)));
  }

  function forceLogout() {
    document.body.classList.add("glitch");
    setTimeout(() => {
      window.location.reload();
    }, 420);
  }

  function bindCorruptVoid() {
    const content = $("#viewer-content");
    $$(".corrupt-void", content).forEach(node => {
      node.addEventListener("click", () => {
        errorTone();
        forceLogout();
      }, { once: true });
    });
  }

  function openFile(key) {
    registerInteraction(`file:${key}`);
    const item = fileContents[key];
    if (!item) return;
    const viewer = $("#file-viewer");
    const content = $("#viewer-content");
    clearCorruptViewer();
    $("#viewer-title").innerHTML = `<span class="window-led"></span> ${item.title}`;

    if (item.html) {
      content.innerHTML = item.html;
    } else {
      content.textContent = item.body || "";
    }

    if (item.corrupt) {
      viewer.classList.add("viewer-corrupt");
      content.classList.add("viewer-content--corrupt");
      if (item.logoutVoid) bindCorruptVoid();
    }

    viewer.classList.remove("is-hidden");
    focusWindow(viewer);
    state.opened.add("viewer");
    syncTaskbar();

    if (key === "nocturne" || item.corrupt) errorTone();
    else clickTone();

    if (key === "ixion_garcia") {
      if (state.arg3RequestReady) {
        setTimeout(() => triggerArg3SecurityEvent(), 1100);
      }
    }
  }

  const arg3DefenseCommands = [
    "WATCHDOG HOLD",
    "ROUTE A17 LOCAL",
    "CACHE MIRROR 441",
    "MOUNT IXION SHADOW",
    "LOCK PURGE QUEUE",
    "TRACE ADRIAN LOCAL",
    "RESTORE INDEX A17",
    "HOLD ARCHIVE WRITE",
    "MIRROR CACHE IXION",
    "FREEZE DELETE PIPE",
    "ROUTE RECOVERY 441",
    "BYPASS PURGE LOCK",
    "RELINK ARCHIVE NODE",
    "HOLD DATABASE FLUSH",
    "MOUNT LOCAL SHADOW",
    "RESTORE SESSION A17"
  ];

  function ensureArg3Music() {
    if (state.arg3Music) return state.arg3Music;

    const audio = new Audio("./assets/audio/arg3-hack-theme.mp3");
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;

    state.arg3Music = audio;
    return audio;
  }

  function stopArg3MusicFade() {
    if (state.arg3MusicFadeTimer) {
      clearInterval(state.arg3MusicFadeTimer);
      state.arg3MusicFadeTimer = null;
    }
  }

  function fadeArg3MusicTo(targetVolume, duration = 3200, stopAfter = false) {
    const audio = ensureArg3Music();
    stopArg3MusicFade();

    const startVolume = Number.isFinite(audio.volume) ? audio.volume : 0;
    const target = Math.max(0, Math.min(1, targetVolume));
    const startTime = performance.now();

    state.arg3MusicFadeTimer = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = t * t * (3 - 2 * t);

      audio.volume = Math.max(
        0,
        Math.min(1, startVolume + (target - startVolume) * eased)
      );

      if (t >= 1) {
        stopArg3MusicFade();

        if (stopAfter && target <= 0.001) {
          audio.pause();
          audio.currentTime = 0;
        }
      }
    }, 70);
  }

  function startArg3Music() {
    const audio = ensureArg3Music();
    stopArg3MusicFade();

    audio.volume = 0.014;
    audio.currentTime = 0;

    audio.play()
      .then(() => {
        fadeArg3MusicTo(state.arg3MusicTargetVolume, 6500, false);
      })
      .catch(() => {
        // If the browser blocks autoplay, the next keyboard interaction
        // will retry playback.
      });
  }

  function retryArg3MusicFromInteraction() {
    const audio = ensureArg3Music();
    if (!audio.paused) return;

    audio.play()
      .then(() => fadeArg3MusicTo(state.arg3MusicTargetVolume, 4200, false))
      .catch(() => {});
  }

  function fadeOutArg3Music() {
    if (!state.arg3Music) return;
    fadeArg3MusicTo(0, 3800, true);
  }

  function arg3ErrorBurst() {
    errorTone();
    setTimeout(() => makeTone(92, 0.16, 0.035, "sawtooth"), 70);
    setTimeout(() => makeTone(248, 0.07, 0.025, "square"), 190);
  }

  function createArg3ErrorWindows() {
    const layer = $("#arg3-error-layer");
    if (!layer) return;

    layer.innerHTML = "";
    layer.classList.remove("is-hidden");

    const errors = [
      "UNAUTHORIZED DATA ACCESS",
      "RESEARCH CACHE BREACH",
      "ACCOUNT INTEGRITY FAILURE",
      "SECURITY WATCHDOG ACTIVE",
      "AKWA DATABASE LOCK",
      "ACCOUNT PURGE REQUESTED"
    ];

    errors.forEach((message, i) => {
      const w = document.createElement("div");
      w.className = "arg3-error-window arg3-error-window--centered";
      w.style.setProperty("--error-index", String(i));
      w.style.animationDelay = `${i * 105}ms`;

      w.innerHTML = `
        <div class="arg3-error-window__bar">
          <span>Error</span>
          <span>×</span>
        </div>
        <div class="arg3-error-window__body">
          <b>ERROR ${String(91 + i * 13).padStart(3, "0")}</b>
          <span>${message}</span>
        </div>
      `;

      layer.appendChild(w);
    });
  }

  function clearArg3AlarmTimers() {
    state.arg3AlarmTimers.forEach(id => clearTimeout(id));
    state.arg3AlarmTimers = [];
  }

  function scheduleArg3Alarm(fn, ms) {
    const id = setTimeout(fn, ms);
    state.arg3AlarmTimers.push(id);
    return id;
  }

  function setArg3DefensePrompt() {
    const prompt = $("#arg3-command-prompt");
    if (!prompt) return;

    if (state.arg3PurgeProgress <= 0) {
      prompt.textContent = "PURGE INTERRUPTED";
      prompt.dataset.command = "";
      return;
    }

    let nextIndex = Math.floor(Math.random() * arg3DefenseCommands.length);

    if (arg3DefenseCommands.length > 1) {
      while (nextIndex === state.arg3LastCommandIndex) {
        nextIndex = Math.floor(Math.random() * arg3DefenseCommands.length);
      }
    }

    state.arg3CommandIndex = nextIndex;
    state.arg3LastCommandIndex = nextIndex;

    const cmd = arg3DefenseCommands[nextIndex];
    prompt.textContent = cmd;
    prompt.dataset.command = cmd;
  }

  function setArg3PurgeProgress(value) {
    state.arg3PurgeProgress = Math.max(0, Math.min(100, value));
    const fill = $("#arg3-purge-fill");
    const label = $("#arg3-purge-percent");

    if (fill) fill.style.height = `${state.arg3PurgeProgress}%`;
    if (label) label.textContent = `${Math.floor(state.arg3PurgeProgress).toString().padStart(2, "0")}%`;
  }

  function stopArg3PurgeTimer() {
    if (state.arg3PurgeTimer) {
      clearInterval(state.arg3PurgeTimer);
      state.arg3PurgeTimer = null;
    }
  }

  function failArg3Defense() {
    stopArg3PurgeTimer();
    fadeOutArg3Music();
    const status = $("#arg3-defense-status");
    const prompt = $("#arg3-command-prompt");
    const input = $("#arg3-defense-input");

    if (status) status.textContent = "DATA PURGE COMPLETE // SESSION TERMINATED";
    if (prompt) prompt.textContent = "RECOVERY FAILED";
    if (input) input.disabled = true;

    document.body.classList.add("arg3-defense-failed");
    arg3ErrorBurst();

    scheduleArg3Alarm(() => {
      window.location.reload();
    }, 2300);
  }

  function completeArg3Defense() {
    stopArg3PurgeTimer();
    fadeOutArg3Music();
    state.arg3DefenseComplete = true;
    localStorage.setItem("akwaos.arg3DefenseComplete", "1");
    updateArgStageVisuals();

    const status = $("#arg3-defense-status");
    const prompt = $("#arg3-command-prompt");
    const input = $("#arg3-defense-input");

    if (status) status.textContent = "PURGE ABORTED // ADRIAN RECOVERY ROUTE ACCEPTED";
    if (prompt) prompt.textContent = "DATA DELETION STOPPED";
    if (input) input.disabled = true;

    setArg3PurgeProgress(0);
    makeTone(320, 0.18, 0.026, "sine");
    setTimeout(() => makeTone(480, 0.18, 0.024, "sine"), 150);
    setTimeout(() => makeTone(720, 0.22, 0.022, "sine"), 300);

    appendSystemEvent("[--:--] purge sequence aborted by recovery route / source A.LAMO");

    scheduleArg3Alarm(() => {
      $("#arg3-defense")?.classList.add("is-hidden");
      $("#arg3-error-layer")?.classList.add("is-hidden");
      document.body.classList.remove("arg3-defense-active", "arg3-prealarm");
      state.arg3AlarmRunning = false;
      toast("RECOVERY ROUTE ACCEPTED // LOCAL DATA PRESERVED.");
    }, 2200);
  }

  function submitArg3DefenseCommand(raw) {
    const prompt = $("#arg3-command-prompt");
    const expected = prompt?.dataset.command || "";
    if (!expected) return;

    retryArg3MusicFromInteraction();

    const normalized = raw.trim().replace(/\s+/g, " ").toUpperCase();
    const input = $("#arg3-defense-input");
    const status = $("#arg3-defense-status");

    if (normalized === expected) {
      const rollback = 10 + Math.random() * 6;
      setArg3PurgeProgress(state.arg3PurgeProgress - rollback);

      if (status) {
        status.textContent = `COMMAND ACCEPTED // PURGE ROLLBACK -${Math.round(rollback)}%`;
      }

      makeTone(620, 0.07, 0.022, "square");
      setTimeout(() => makeTone(760, 0.06, 0.018, "square"), 65);

      if (input) input.value = "";

      if (state.arg3PurgeProgress <= 0.01) {
        setArg3PurgeProgress(0);
        completeArg3Defense();
        return;
      }

      setArg3DefensePrompt();
      if (input) input.focus();
      return;
    }

    const penalty = 4 + Math.random() * 3;
    setArg3PurgeProgress(state.arg3PurgeProgress + penalty);

    if (status) {
      status.textContent = `COMMAND REJECTED // PURGE ACCELERATED +${Math.round(penalty)}%`;
    }

    if (input) {
      input.value = "";
      input.classList.add("is-error");
      setTimeout(() => input.classList.remove("is-error"), 180);
      input.focus();
    }

    arg3ErrorBurst();
  }

  function beginArg3Defense() {
    if (state.arg3DefenseComplete || state.arg3AlarmRunning) return;

    state.arg3AlarmRunning = true;
    state.arg3CommandIndex = -1;
    state.arg3LastCommandIndex = -1;
    clearArg3AlarmTimers();

    const defense = $("#arg3-defense");
    const input = $("#arg3-defense-input");
    const status = $("#arg3-defense-status");

    if (!defense || !input) return;

    defense.classList.remove("is-hidden");
    document.body.classList.remove("arg3-prealarm");
    document.body.classList.add("arg3-defense-active");

    setArg3PurgeProgress(46);
    setArg3DefensePrompt();
    startArg3Music();

    if (status) status.textContent = "ADRIAN TRACE: COMMAND SEQUENCE FOUND";
    input.disabled = false;
    input.value = "";
    setTimeout(() => input.focus(), 100);

    const alert2 = $("#arg3-alert-2");
    const adrianHint = $("#arg3-adrian-hint");

    alert2?.classList.add("is-dim");
    adrianHint?.classList.remove("is-visible");

    scheduleArg3Alarm(() => alert2?.classList.remove("is-dim"), 420);
    scheduleArg3Alarm(() => adrianHint?.classList.add("is-visible"), 780);

    state.arg3PurgeTimer = setInterval(() => {
      if (!state.arg3AlarmRunning) return;
      setArg3PurgeProgress(state.arg3PurgeProgress + 0.34);

      if (state.arg3PurgeProgress >= 100) {
        failArg3Defense();
      }
    }, 200);
  }

  function triggerArg3SecurityEvent() {
    if (!state.arg3RequestReady || state.arg3DefenseComplete || state.arg3AlarmRunning) return;

    state.arg3AlarmRunning = true;
    document.body.classList.add("arg3-prealarm");
    createArg3ErrorWindows();

    const layer = $("#arg3-error-layer");
    layer?.classList.add("arg3-error-layer--active");

    let burst = 0;
    const alarmInterval = setInterval(() => {
      if (burst >= 9 || !state.arg3AlarmRunning) {
        clearInterval(alarmInterval);
        return;
      }
      arg3ErrorBurst();
      burst += 1;
    }, 300);

    scheduleArg3Alarm(() => {
      document.body.classList.add("arg3-prealarm-warning");
    }, 1100);

    scheduleArg3Alarm(() => {
      document.body.classList.add("arg3-prealarm-account");
    }, 2050);

    scheduleArg3Alarm(() => {
      document.body.classList.add("arg3-prealarm-adrian");
    }, 3150);

    scheduleArg3Alarm(() => {
      document.body.classList.add("arg3-prealarm-transition");
    }, 4200);

    scheduleArg3Alarm(() => {
      state.arg3AlarmRunning = false;
      document.body.classList.remove(
        "arg3-prealarm-warning",
        "arg3-prealarm-account",
        "arg3-prealarm-adrian",
        "arg3-prealarm-transition"
      );
      beginArg3Defense();
    }, 5000);
  }

  function isArg3CopyProtected() {
    return (
      document.body.classList.contains("arg-stage-3") ||
      document.body.classList.contains("arg-stage-3-ready") ||
      document.body.classList.contains("arg3-prealarm") ||
      document.body.classList.contains("arg3-defense-active")
    ) && !state.arg3DefenseComplete;
  }

  function setupArg3CopyProtection() {
    document.addEventListener("copy", (event) => {
      if (!isArg3CopyProtected()) return;

      event.preventDefault();

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText("").catch(() => {});
      }

      toast("COPY BLOCKED // ARG3 SECURITY MODE");
      makeTone(145, 0.08, 0.018, "square");
    });

    document.addEventListener("cut", (event) => {
      if (!isArg3CopyProtected()) return;

      const target = event.target;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }

      event.preventDefault();
    });

    document.addEventListener("contextmenu", (event) => {
      if (!isArg3CopyProtected()) return;

      const target = event.target;
      if (target && target.closest && target.closest("#arg3-defense-input")) {
        event.preventDefault();
        return;
      }

      if (
        target &&
        target.closest &&
        (
          target.closest(".arg3-defense") ||
          target.closest(".arg3-error-layer") ||
          target.closest(".ixion-personnel-record")
        )
      ) {
        event.preventDefault();
        toast("CONTEXT ACTION BLOCKED // ARG3 SECURITY MODE");
      }
    });

    document.addEventListener("selectstart", (event) => {
      if (!isArg3CopyProtected()) return;

      const target = event.target;
      if (target && target.closest && target.closest("#arg3-defense-input")) {
        return;
      }

      if (
        target &&
        target.closest &&
        (
          target.closest(".arg3-defense") ||
          target.closest(".arg3-error-layer") ||
          target.closest(".ixion-personnel-record")
        )
      ) {
        event.preventDefault();
      }
    });
  }

  function setupArg3DefenseForm() {
    const form = $("#arg3-defense-form");
    const input = $("#arg3-defense-input");
    if (!form || !input) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submitArg3DefenseCommand(input.value);
    });
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

    if (cmd === "echo") {
      const normalizedEcho = command.replace(/\s+/g, " ").trim().toUpperCase();

      if (normalizedEcho === "ECHO SDE > IXION.REQ") {
        if (!state.recoveredBioProfile) {
          terminalPrint(["ACCESS CONTEXT INVALID."], "term-error");
          errorTone();
          return;
        }

        if (state.arg3RequestReady) {
          terminalPrint([
            "IXION.REQ already exists.",
            "STATUS: READY"
          ], "term-warn");
          return;
        }

        terminalPrint([
          "1 FILE CREATED.",
          "A:\\USERS\\ALAMO\\IXION.REQ",
          "",
          "FILE WATCH EVENT DETECTED..."
        ], "term-warn");
        clickTone();

        setTimeout(() => {
          terminalPrint([
            "REQUEST TOKEN ACCEPTED: SDE",
            "RESEARCH_INDEX_SERVICE attached.",
            "RESTORING LOCAL CACHE..."
          ], "term-warn");
          makeTone(360, 0.12, 0.025, "square");
        }, 650);

        setTimeout(() => {
          state.arg3RequestReady = true;
          localStorage.setItem("akwaos.arg3RequestReady", "1");
          updateArgStageVisuals();
          ensureIxionRequestRow();
          terminalPrint([
            "IXION.REQ   3 KB   [READY]",
            "PERSONNEL LINK UPDATED: IXION GARCIA"
          ], "term-warn");
          appendSystemEvent("[--:--] IXION.REQ created / research cache restored");
          makeTone(520, 0.14, 0.022, "sine");
        }, 1450);

        return;
      }

      terminalPrint([
        "WRITE ERROR.",
        "Use: help echo"
      ], "term-error");
      errorTone();
      return;
    }

    // Hidden developer/testing command. Intentionally omitted from HELP.
    if (cmd === "arg3reset") {
      stopArg3PurgeTimer();
      clearArg3AlarmTimers();
      stopArg3MusicFade();

      if (state.arg3Music) {
        try {
          state.arg3Music.pause();
          state.arg3Music.currentTime = 0;
          state.arg3Music.volume = 0;
        } catch (_) {}
      }

      localStorage.removeItem("akwaos.arg3RequestReady");
      localStorage.removeItem("akwaos.arg3DefenseComplete");

      state.arg3RequestReady = false;
      state.arg3DefenseComplete = false;
      state.arg3AlarmRunning = false;
      state.arg3PurgeProgress = 0;
      state.arg3CommandIndex = -1;
      state.arg3LastCommandIndex = -1;

      const ixionRow = $("#ixion-request-row");
      if (ixionRow) ixionRow.remove();

      document.body.classList.remove(
        "arg-stage-3-ready",
        "arg-stage-complete",
        "arg3-defense-active",
        "arg3-defense-failed",
        "arg3-prealarm",
        "arg3-prealarm-warning",
        "arg3-prealarm-account",
        "arg3-prealarm-adrian",
        "arg3-prealarm-transition"
      );

      updateArgStageVisuals();

      $("#arg3-defense")?.classList.add("is-hidden");
      $("#arg3-error-layer")?.classList.add("is-hidden");

      terminalPrint([
        "ARG3 LOCAL STATE RESET.",
        "IXION.REQ REMOVED.",
        "ARG1 / ARG2 STATE PRESERVED.",
        "",
        "RELOADING AKWAOS..."
      ], "term-warn");

      makeTone(260, 0.08, 0.02, "square");
      setTimeout(() => makeTone(180, 0.1, 0.018, "square"), 90);
      setTimeout(() => window.location.reload(), 850);
      return;
    }

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
        "A17_PREVIOUS_SESSION.LOG": "a17_previous_session",
        "AQ-S17-441.CHK": "bio_aq_s17_441",
        "IXION.REQ": "ixion_request",
        "ADRIAN_LAMO_PERSONNEL.REP": "adrian_lamo",
        "LEGIT_TELLA_ARCHIVE.REP": "legit_tella",
        "LONAN_DAMAGED.DAT": "lonan",
        "VARMA_HALLA_SECURITY.REP": "varma_halla",
        "VALENTINA_HANSEN_GEN.REP": "valentina_hansen",
        "ISAAC_AZIM_ORV.REP": "isaac_azim",
        "SANGUS_TORQUEMADA.ARCH": "sangus_torquemada",
        "LEO_ELLESTER_PERSONNEL.REP": "leo_ellester",
        "FLYN_0.CHK": "ghost"
      };
      const key = aliases[arg];
      if (!key || (key === "ghost" && !state.secretFlags.ghostIndex)) {
        terminalPrint(["File not found."], "term-error");
        errorTone();
        return;
      }

      if (key === "a17_previous_session" && !state.recoveredA17Session) {
        state.recoveredA17Session = true;
        localStorage.setItem("akwaos.a17PreviousRecovered", "1");
        updateArgStageVisuals();
        terminalPrint([
          "RECOVERY POINTER ACCEPTED.",
          "Restoring deleted index entry...",
          "A17_PREVIOUS_SESSION.LOG [RECOVERED]"
        ], "term-warn");
        appendSystemEvent("[--:--] A17_PREVIOUS_SESSION.LOG restored from residual cache");
      }

      if (key === "bio_aq_s17_441" && !state.recoveredBioProfile) {
        state.recoveredBioProfile = true;
        localStorage.setItem("akwaos.bioProfileRecovered", "1");
        updateArgStageVisuals();
        terminalPrint([
          "BIO-CACHE POINTER ACCEPTED.",
          "Restoring checksum record...",
          "AQ-S17-441.CHK [RECOVERED]"
        ], "term-warn");
        appendSystemEvent("[03:14] AQ-S17-441.CHK restored / profile mismatch retained");
        ensureBioOverrideProcess();
      }

      terminalPrint(fileContents[key].body.split("\n"));
      return;
    }

    if (cmd === "help" && arg === "OPEN") {
      terminalPrint([
        "AKWAOS FILE RECOVERY // OPEN",
        "--------------------------------",
        "Syntax:",
        "OPEN <NODE>_<ARCHIVAL_CLASS><FORMAT>",
        "",
        "Fields may be stored in separate system records.",
        "Corrupted interface fragments can contain recovery pointer values.",
        "",
        "Example:",
        "OPEN B04_MAINTENANCE.LOG",
        "",
        "The example is syntactic only."
      ], "term-warn");
      return;
    }

    if (cmd === "help" && (arg === "BIO" || arg === "BIO-CACHE" || arg === "BIOCACHE")) {
      terminalPrint([
        "AKWAOS BIO-CACHE RECOVERY",
        "--------------------------------",
        "Syntax:",
        "OPEN <PROFILE_ID><FORMAT>",
        "",
        "PROFILE_ID is taken from the personnel record.",
        "FORMAT is defined by SYSTEM SERVICE.",
        "",
        "Example:",
        "OPEN AQ-S02-118.CHK",
        "",
        "The example is syntactic only."
      ], "term-warn");
      return;
    }

    if (cmd === "help" && arg === "ECHO") {
      terminalPrint([
        "AKWAOS LOCAL FILE WRITE",
        "--------------------------------",
        "Syntax:",
        "ECHO <DATA> > <FILE>",
        "",
        "Creates a local request file and writes DATA into it.",
        "",
        "Example:",
        "ECHO TEST > SAMPLE.REQ",
        "",
        "The example is syntactic only."
      ], "term-warn");
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

  function setupMayWondersNo() {
    const row = $("#may-wonders-row");
    if (!row) return;

    if (localStorage.getItem("akwaos.mayWondersVanished") === "1") {
      row.remove();
      return;
    }

    row.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const sound = new Audio("./assets/audio/may-wonders-no.mp3");
      sound.volume = 0.82;

      row.classList.add("may-vanishing");
      document.body.classList.add("may-system-stutter");

      try {
        sound.currentTime = 0;
        sound.play().catch(() => {});
      } catch (_) {}

      localStorage.setItem("akwaos.mayWondersVanished", "1");

      setTimeout(() => {
        row.classList.add("may-vanishing--phase2");
      }, 520);

      setTimeout(() => {
        row.remove();
        document.body.classList.remove("may-system-stutter");
      }, 2380);
    }, { once: true });
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
    setupMayWondersNo();
    setupArg3DefenseForm();
    setupArg3CopyProtection();
    restoreCorruptionState();
    updateArgStageVisuals();
    ensureBioOverrideProcess();
    ensureIxionRequestRow();
  }

  init();
})();
