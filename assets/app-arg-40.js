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
    adrianMailIntroRead: localStorage.getItem("akwaos.adrianMailIntroRead") === "1",
    adrianMailBridgeReady: localStorage.getItem("akwaos.adrianMailBridgeReady") === "1",
    adrianMailLinkRead: localStorage.getItem("akwaos.adrianMailLinkRead") === "1",
    arg4RecycleOpened: localStorage.getItem("akwaos.arg4RecycleOpened") === "1",
    arg4HintMailRead: localStorage.getItem("akwaos.arg4HintMailRead") === "1",
    arg4RecoveryPending: false,
    arg4Recovered: localStorage.getItem("akwaos.arg4Recovered") === "1",
    arg4ResultMailRead: localStorage.getItem("akwaos.arg4ResultMailRead") === "1",
    arg5Started: false,
    arg5Complete: localStorage.getItem("akwaos.arg5Complete") === "1",
    arg5Route: ["A17"],
    arg5Trace: 8,
    arg5Connected: true,
    arg5CacheLeft: 10,
    arg5TraceTimer: null,
    arg5CacheTimer: null,
    arg5HintStage: 0,
    arg6Unlocked: localStorage.getItem("akwaos.arg6Unlocked") === "1",
    arg6Trace: 6,
    arg6LockedFragments: [false, false, false, false],
    arg6FragmentValues: ["---", "---", "---", "---"],
    arg6CycleTimers: [null, null, null, null],
    arg6TraceTimer: null,
    arg6IsaacProfileRead: localStorage.getItem("akwaos.arg6IsaacProfileRead") === "1",
    arg6AdrianMailRead: localStorage.getItem("akwaos.arg6AdrianMailRead") === "1",
    arg6AdrianDefenseComplete: localStorage.getItem("akwaos.arg6AdrianDefenseComplete") === "1",
    arg6AdrianDefenseRunning: false,
    arg6SecurityLock: 28,
    arg6AdrianLinkStrength: 72,
    arg6DefenseSeconds: 60,
    arg6DefenseTimer: null,
    arg6DefenseTick: null,
    arg6SweepTimer: null,
    arg6SweepPosition: 0,
    arg6ActionLocked: false,
    arg6AimScore: 0,
    arg6AimErrors: 0,
    arg6AimLink: 100,
    arg6AimSeconds: 45,
    arg6AimTargetId: 0,
    arg6AimSpawnTimer: null,
    arg6AimClockTimer: null,
    arg6AimTargets: new Map(),
    arg6AimLevel: 1,
    arg7SendCount: Number(localStorage.getItem("akwaos.arg7SendCount") || "0"),
    arg7SummaryRevealed: localStorage.getItem("akwaos.arg7SummaryRevealed") === "1",
    arg7FinalDraftRevealed: localStorage.getItem("akwaos.arg7FinalDraftRevealed") === "1",
    arg7FinalSent: localStorage.getItem("akwaos.arg7FinalSent") === "1",
    arg7RecipientGlitchTimer: null,
    arg7CinematicStarted: false,
    arg7CinematicTimerIds: [],
    arg7ShutdownTimer: null,
    arg7FinaleAudio: null,
    arg7RevealAudio: null,
    arg7RevealAudioFadeTimer: null,
    mailNotificationTimer: null,
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

    alamo_request: {
      title: "ALAMO.REQ",
      body: `AKWA LOCAL MAIL RELAY REQUEST
--------------------------------

OWNER:
A.LAMO

TOKEN:
CONNECT

SOURCE:
A:\\USERS\\ALAMO\\ALAMO.REQ

SERVICE:
MAIL_RELAY_SERVICE

STATUS:
LINKED

CHANNEL:
LOCAL / DEGRADED

INBOUND MAIL:
ENABLED

OUTBOUND DIRECT REPLY:
BLOCKED

END OF FILE`
    },

    mail_adrian_blocked: {
      title: "MAIL // A.LAMO // BLOCKED CHANNEL",
      body: `FROM: A.LAMO
TO: AQ-S17-441
TIME: --:--
ROUTE: [DEGRADED]

Я под системным блоком.

Нормально общаться через MAIL не могу.
Ответы режутся раньше, чем доходят до меня.

Ты уже создавал локальный запрос для Иксиона.
Сделай такой же для меня.

WRITE METHOD:
ECHO

REQUEST TOKEN:
CONNECT

TARGET:
ALAMO.REQ

REFERENCE:
TERMINAL HELP / ECHO

Создай файл локально.
Если старый MAIL_RELAY_SERVICE ещё работает,
я увижу его.`,
      html: `<div class="arg-document adrian-mail-document">
        <div>FROM: A.LAMO</div>
        <div>TO: AQ-S17-441</div>
        <div>TIME: --:--</div>
        <div>ROUTE: <span class="adrian-mail-broken">[DEGRADED]</span></div>
        <br>
        <div class="adrian-mail-broken">Я п_д системным бл_ком.</div>
        <br>
        <div>Нормально общаться через MAIL не могу.</div>
        <div>Ответы режутся раньше, чем доходят до меня.</div>
        <br>
        <div>Ты уже создавал локальный запрос для Иксиона.</div>
        <div>Сделай такой же для меня.</div>
        <br>
        <div>WRITE METHOD:</div>
        <div class="adrian-mail-fragment">ECHO</div>
        <br>
        <div>REQUEST TOKEN:</div>
        <div class="adrian-mail-fragment">CONNECT</div>
        <br>
        <div>TARGET:</div>
        <div class="adrian-mail-fragment">ALAMO.REQ</div>
        <br>
        <div>REFERENCE:</div>
        <div>TERMINAL HELP / ECHO</div>
      </div>`
    },

    mail_adrian_linked: {
      title: "MAIL // A.LAMO // LOCAL LINK",
      body: `FROM: A.LAMO
TO: AQ-S17-441
TIME: --:--
ROUTE: LOCAL RELAY

Привет.
Меня зовут Адриан Ламо.
Я владелец этого ПК.

Вижу ALAMO.REQ.

Канал всё ещё под фильтром,
но теперь я могу оставлять тебе сообщения
через локальный relay.

Не отвечай на это письмо.
Пока система держит меня под блоком,
я сам буду выходить на связь.

Они удаляли записи.
Но удалённое здесь не всегда уничтожается.

Начни с места,
куда система отправляет удалённое.`,
      html: `<div class="arg-document adrian-mail-document adrian-mail-document--linked">
        <div>FROM: A.LAMO</div>
        <div>TO: AQ-S17-441</div>
        <div>TIME: --:--</div>
        <div>ROUTE: <span class="adrian-mail-linked-status">LOCAL RELAY</span></div>
        <br>
        <div class="adrian-mail-greeting">&gt; Привет.</div>
        <div class="adrian-mail-greeting">&gt; Меня зовут Адриан Ламо.</div>
        <div class="adrian-mail-greeting adrian-mail-greeting--owner">&gt; Я владелец этого ПК.</div>
        <br>
        <div>&gt; Вижу ALAMO.REQ.</div>
        <br>
        <div>&gt; Канал всё ещё под фильтром, но теперь я могу оставлять тебе сообщения через локальный relay.</div>
        <br>
        <div>&gt; Не отвечай на это письмо.</div>
        <div>&gt; Пока система держит меня под блоком, я сам буду выходить на связь.</div>
        <br>
        <div>&gt; Они удаляли записи.</div>
        <div>&gt; Но удалённое здесь не всегда уничтожается.</div>
        <br>
        <div class="adrian-mail-next-hint">&gt; Начни с места, куда система отправляет удалённое.</div>
      </div>`
    },

    arg4_recovered: {
      title: "R14_A17.REC",
      body: `AKWA SECURITY SHADOW CACHE
--------------------------------

SOURCE:
R14 / A17

ORIGINAL OBJECT:
[REMOVED]

CLASS:
SECURITY

STATUS:
PARTIAL RECOVERY

--------------------------------

RECOVERED REQUESTS:

SUBJECT TRANSFER RECORDS
SECURITY MAP / HOLDING SECTOR
NIGHT SHIFT ACCESS ROUTES

REQUEST ACCOUNT:
AQ-S17-441

ACCESS LEVEL:
3

--------------------------------

WARNING:

REQUESTED MATERIAL
EXCEEDED ACCOUNT CLEARANCE.

AUTHORIZATION SOURCE:
[UNKNOWN]

--------------------------------

DELETION REQUEST:
MANUAL

REQUESTOR:
AQ-S17-441

TIME:
03:12:09

--------------------------------

RECOVERY FRAGMENT:

"...нужен путь внутрь.
не через главный вход."

END OF RECOVERABLE DATA`
    },

    mail_adrian_recycle_hint: {
      title: "MAIL // A.LAMO // RECYCLE",
      body: `FROM: A.LAMO
TO: AQ-S17-441
TIME: --:--
ROUTE: LOCAL RELAY

Ты видишь пустую корзину.

Она не пустая.

AKWA удаляет запись из обычного индекса,
но некоторое время сохраняет теневой индекс.

Не ищи имя файла.
Ищи запись об удалении.

Если увидишь R14 —
это не номер файла.

Это слот восстановления.

REFERENCE:
TERMINAL HELP / RECOVER`,
      html: `<div class="arg-document adrian-mail-document">
        <div>FROM: A.LAMO</div>
        <div>TO: AQ-S17-441</div>
        <div>TIME: --:--</div>
        <div>ROUTE: LOCAL RELAY</div>
        <br>
        <div>&gt; Ты видишь пустую корзину.</div>
        <div>&gt; Она не пустая.</div>
        <br>
        <div>&gt; AKWA удаляет запись из обычного индекса, но некоторое время сохраняет теневой индекс.</div>
        <br>
        <div>&gt; Не ищи имя файла.</div>
        <div>&gt; Ищи запись об удалении.</div>
        <br>
        <div>&gt; Если увидишь <b>R14</b> — это не номер файла.</div>
        <div>&gt; Это слот восстановления.</div>
        <br>
        <div>REFERENCE:</div>
        <div class="adrian-mail-next-hint">TERMINAL HELP / RECOVER</div>
      </div>`
    },

    mail_adrian_arg4_result: {
      title: "MAIL // A.LAMO // R14",
      body: `FROM: A.LAMO
TO: AQ-S17-441
TIME: --:--
ROUTE: LOCAL RELAY

Ты восстановил запись.

Этот запрос действительно прошёл
через аккаунт ADRIAN LAMO.

Но это был не я.

Не всё, что система считает именем,
является человеком.

Имя в системе подтверждает доступ.
Не личность.

Если хочешь понять,
кто пользовался этим ПК —

не ищи имя.
Ищи причину.

В R14 была ещё одна ссылка.

SEC-C

Если хочешь узнать,
куда пытались попасть с моего аккаунта —

нам придётся открыть сектор безопасности.`,
      html: `<div class="arg-document adrian-mail-document adrian-mail-document--linked">
        <div>FROM: A.LAMO</div>
        <div>TO: AQ-S17-441</div>
        <div>TIME: --:--</div>
        <div>ROUTE: LOCAL RELAY</div>
        <br>
        <div>&gt; Ты восстановил запись.</div>
        <br>
        <div>&gt; Этот запрос действительно прошёл через аккаунт <b>ADRIAN LAMO</b>.</div>
        <div class="adrian-mail-identity-hint">&gt; Но это был не я.</div>
        <br>
        <div class="adrian-mail-identity-hint">&gt; Не всё, что система считает именем, является человеком.</div>
        <div>&gt; Имя в системе подтверждает доступ.</div>
        <div>&gt; Не личность.</div>
        <br>
        <div>&gt; Если хочешь понять, кто пользовался этим ПК —</div>
        <div>&gt; не ищи имя.</div>
        <div>&gt; Ищи причину.</div>
        <br>
        <div>&gt; В R14 была ещё одна ссылка.</div>
        <div class="adrian-mail-sec-c">&gt; SEC-C</div>
        <br>
        <div>&gt; Нам придётся открыть сектор безопасности.</div>
      </div>`
    },

    mail_adrian_isaac_link: {
      title: "MAIL // A.LAMO // PRIVATE LINK",
      body: `FROM: A.LAMO
TO: AQ-S17-441
TIME: --:--
ROUTE: LOCAL RELAY

Ты закончил с Айзеком.

Есть ещё кое-что.

Я не могу отправить это через обычный MAIL.
Система режет содержимое.

Открой ссылку ниже.

A17://LOCAL/ALAMO/TRACE-NULL

Не копируй адрес.
Просто открой.

— A.LAMO`,
      html: `<div class="arg-document adrian-mail-document">
        <div>FROM: A.LAMO</div>
        <div>TO: AQ-S17-441</div>
        <div>TIME: --:--</div>
        <div>ROUTE: LOCAL RELAY</div>
        <br>
        <div>&gt; Ты закончил с Айзеком.</div>
        <div>&gt; Есть ещё кое-что.</div>
        <br>
        <div>&gt; Я не могу отправить это через обычный MAIL.</div>
        <div>&gt; Система режет содержимое.</div>
        <br>
        <div>&gt; Открой ссылку ниже.</div>
        <br>
        <button id="arg6-adrian-private-link" class="arg6-adrian-mail-link" type="button">A17://LOCAL/ALAMO/TRACE-NULL</button>
        <br><br>
        <div class="muted">&gt; Не копируй адрес. Просто открой.</div>
        <br>
        <div>— A.LAMO</div>
      </div>`
    },

    mail_arg7_stock_reply: {
      title: "MAIL // A.LAMO // REPLY",
      body: `FROM: A.LAMO
TO: AQ-S17-441
TIME: --:--
ROUTE: LOCAL RELAY

Меня зовут Адриан Ламо.

--------------------------------
REPLY HASH:
ALAMO-01 / 7C44

CACHE:
HIT`,
      html: `<div class="arg-document adrian-mail-document arg7-stock-reply">
        <div>FROM: A.LAMO</div>
        <div>TO: AQ-S17-441</div>
        <div>TIME: --:--</div>
        <div>ROUTE: LOCAL RELAY</div>
        <br>
        <div class="arg7-stock-reply__main">Меня зовут Адриан Ламо.</div>
        <br><br>
        <div class="arg7-stock-reply__meta">REPLY HASH: ALAMO-01 / 7C44</div>
        <div class="arg7-stock-reply__meta">CACHE: HIT</div>
      </div>`
    },

    mail_arg7_search_summary: {
      title: "SYSTEM // SESSION QUERY SUMMARY",
      body: `AKWAOS LOCAL QUERY SUMMARY
--------------------------------

ACCOUNT:
AQ-S17-441

RECOVERED REQUEST CLUSTER:

AKWA INTERNAL STRUCTURE
SECURITY ROUTES
NIGHT SHIFT ACCESS
HOLDING SECTOR
SUBJECT TRANSFER RECORDS
EXPERIMENT №626
ASTERI DANTE

PATTERN SOURCE:
A.LAMO LOCAL CACHE

STATUS:
QUERY SEQUENCE COMPLETE

NOTE:
Recovered requests form
a single directed search pattern.`,
      html: `<div class="arg-document arg7-query-summary">
        <div>AKWAOS LOCAL QUERY SUMMARY</div>
        <br>
        <div>ACCOUNT: <b>AQ-S17-441</b></div>
        <br>
        <div>RECOVERED REQUEST CLUSTER:</div>
        <div class="arg7-query-list">
          <span>AKWA INTERNAL STRUCTURE</span>
          <span>SECURITY ROUTES</span>
          <span>NIGHT SHIFT ACCESS</span>
          <span>HOLDING SECTOR</span>
          <span>SUBJECT TRANSFER RECORDS</span>
          <span>EXPERIMENT №626</span>
          <span class="arg7-query-list__asteri">ASTERI DANTE</span>
        </div>
        <br>
        <div>PATTERN SOURCE: A.LAMO LOCAL CACHE</div>
        <div>STATUS: QUERY SEQUENCE COMPLETE</div>
        <br>
        <div class="muted">Recovered requests form a single directed search pattern.</div>
      </div>`
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
        "help, help open, help bio, help echo, help recover, whoami, status, ls, dir, cat <file>, open <file>, history, cls, clear, date, ver, netstat, ps"
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
      if (state.adrianMailBridgeReady) rows.push("ALAMO.REQ                 [MAIL RELAY]");
      if (state.arg4Recovered) rows.push("R14_A17.REC              [PARTIAL RESTORE]");
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

    let stage = "1";

    if (state.arg3DefenseComplete) {
      stage = "complete";
      document.body.classList.add("arg-stage-complete");
    } else if (state.arg3RequestReady) {
      stage = "3-ready";
      document.body.classList.add("arg-stage-3-ready");
    } else if (state.recoveredBioProfile) {
      stage = "3";
      document.body.classList.add("arg-stage-3");
    } else if (state.recoveredA17Session) {
      stage = "2";
      document.body.classList.add("arg-stage-2");
    } else {
      stage = "1";
      document.body.classList.add("arg-stage-1");
    }

    document.body.dataset.argStage = stage;
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
    updateArgStageVisuals();
    clickTone();

    if (id === "trash" && state.adrianMailLinkRead) {
      if (!state.arg4RecycleOpened) {
        setTimeout(() => {
          triggerArg4Recycle();
        }, 900);
      } else {
        updateArg4Visuals();
      }
    }
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
    updateArgStageVisuals();
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

    if (key === "mail_adrian_isaac_link") {
      setTimeout(bindArg6AdrianPrivateLink, 40);
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
    revealAdrianMailAfterArg3();

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

    const penalty = 3 + Math.random() * 2;
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

    if (status) status.textContent = "ADRIAN TRACE: TYPE THE SHOWN COMMAND // CORRECT INPUT ROLLS PURGE BACK";
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
      setArg3PurgeProgress(state.arg3PurgeProgress + 0.20);

      if (state.arg3PurgeProgress >= 100) {
        failArg3Defense();
      }
    }, 250);
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

      if (normalizedEcho === "ECHO CONNECT > ALAMO.REQ") {
        if (!state.arg3DefenseComplete) {
          terminalPrint([
            "MAIL RELAY CONTEXT UNAVAILABLE.",
            "NO ACTIVE A.LAMO REQUEST."
          ], "term-error");
          errorTone();
          return;
        }

        if (state.adrianMailBridgeReady) {
          terminalPrint([
            "ALAMO.REQ already exists.",
            "MAIL_RELAY_SERVICE: LINKED"
          ], "term-warn");
          return;
        }

        terminalPrint([
          "1 FILE CREATED.",
          "A:\\USERS\\ALAMO\\ALAMO.REQ",
          "",
          "LOCAL FILE WATCH DETECTED..."
        ], "term-warn");
        clickTone();

        setTimeout(() => {
          terminalPrint([
            "REQUEST TOKEN ACCEPTED: CONNECT",
            "MAIL_RELAY_SERVICE attached.",
            "NEGOTIATING DEGRADED CHANNEL..."
          ], "term-warn");
          makeTone(330, 0.11, 0.02, "square");
        }, 650);

        setTimeout(() => {
          state.adrianMailBridgeReady = true;
          localStorage.setItem("akwaos.adrianMailBridgeReady", "1");

          ensureAlamoRequestRow();
          ensureAdrianMailRows();

          terminalPrint([
            "ALAMO.REQ   1 KB   [MAIL RELAY]",
            "LOCAL CHANNEL: PARTIAL LINK"
          ], "term-warn");

          appendSystemEvent("[--:--] A.LAMO local mail relay attached");
          showMailNotification("НОВОЕ СООБЩЕНИЕ", "A.LAMO: Привет. Меня зовут Адриан Ламо...");
        }, 1500);

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
    if (cmd === "fullreset") {
      try {
        stopArg7RecipientGlitch();
        clearArg7CinematicTimers();
        stopArg7RevealAudio();
        stopArg7FinaleAudio();
        stopArg6DefenseTimers();
        stopArg6Timers();
        stopArg5Timers();
        stopArg3PurgeTimer();
        clearArg3AlarmTimers();
        stopArg3MusicFade();
      } catch (_) {}

      const removedKeys = [];

      for (let i = localStorage.length - 1; i >= 0; i -= 1) {
        const key = localStorage.key(i);

        if (key && key.startsWith("akwaos.")) {
          removedKeys.push(key);
          localStorage.removeItem(key);
        }
      }

      for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
        const key = sessionStorage.key(i);

        if (key && key.startsWith("akwaos.")) {
          sessionStorage.removeItem(key);
        }
      }

      terminalPrint([
        "AKWAOS FULL RESET.",
        "",
        `LOCAL STATE OBJECTS REMOVED: ${removedKeys.length}`,
        "ARG1 / ARG2 / ARG3 / ARG4 / ARG5 / ARG6 / ARG7 CLEARED.",
        "MAIL / RECYCLE / PERSONNEL / SECRET FLAGS CLEARED.",
        "",
        "RESTORING FIRST BOOT STATE..."
      ], "term-warn");

      makeTone(260, 0.08, 0.02, "square");
      setTimeout(() => makeTone(190, 0.10, 0.018, "square"), 110);
      setTimeout(() => makeTone(120, 0.14, 0.016, "square"), 240);

      setTimeout(() => {
        window.location.reload();
      }, 900);

      return;
    }

    // Hidden developer/testing command. Intentionally omitted from HELP.
    if (cmd === "lastargreset") {
      stopArg7RecipientGlitch();
      clearArg7CinematicTimers();
      stopArg7RevealAudio();
      stopArg7FinaleAudio();

      localStorage.removeItem("akwaos.arg7SendCount");
      localStorage.removeItem("akwaos.arg7SummaryRevealed");
      localStorage.removeItem("akwaos.arg7FinalDraftRevealed");
      localStorage.removeItem("akwaos.arg7FinalSent");

      state.arg7SendCount = 0;
      state.arg7SummaryRevealed = false;
      state.arg7FinalDraftRevealed = false;
      state.arg7FinalSent = false;
      state.arg7CinematicStarted = false;

      document.body.classList.remove(
        "arg7-cinematic-active",
        "arg7-crt-shutting-down",
        "arg7-crt-black"
      );

      $("#arg7-cinematic-overlay")?.classList.add("is-hidden");
      $("#arg7-fake-cursor")?.classList.add("is-hidden");
      $("#arg7-shutdown-overlay")?.classList.add("is-hidden");
      $("#arg7-thankyou")?.classList.remove("is-visible");

      $("#mail-arg7-stock-reply")?.remove();
      $("#mail-arg7-summary")?.remove();
      $("#mail-arg7-final-draft")?.remove();

      const composer = $("#arg7-composer");
      composer?.classList.add("is-hidden");
      composer?.classList.remove("arg7-composer--cinematic");

      const recipient = $("#arg7-compose-recipient");
      if (recipient) {
        recipient.textContent = "A.LAMO";
        recipient.classList.remove("arg7-compose-recipient--corrupt");
      }

      const composeText = $("#arg7-compose-text");
      if (composeText) {
        composeText.readOnly = false;
        composeText.value = "";
      }

      const cinematicComposeBody = $("#arg7-cinematic-compose-body");
      if (cinematicComposeBody) {
        cinematicComposeBody.innerHTML = "";
        cinematicComposeBody.classList.add("is-hidden");
      }
      composeText?.classList.remove("is-hidden");

      const composeStatus = $("#arg7-compose-status");
      if (composeStatus) composeStatus.textContent = "READY";

      const composeSend = $("#arg7-compose-send");
      if (composeSend) {
        composeSend.disabled = false;
        composeSend.textContent = "SEND";
      }

      updateMailCount();
      updateArg7MailAvailability();

      terminalPrint([
        "LAST ARG ROLLBACK.",
        "ARG7 STATE CLEARED.",
        "ARG1 / ARG2 / ARG3 / ARG4 / ARG5 / ARG6 PRESERVED.",
        "",
        "RELOADING AKWAOS..."
      ], "term-warn");

      makeTone(260, 0.08, 0.02, "square");
      setTimeout(() => makeTone(180, 0.10, 0.018, "square"), 100);

      setTimeout(() => {
        window.location.reload();
      }, 850);

      return;
    }

    // Hidden developer/testing command. Intentionally omitted from HELP.
    if (cmd === "arg7reset") {
      stopArg7RecipientGlitch();

      localStorage.removeItem("akwaos.arg7SendCount");
      localStorage.removeItem("akwaos.arg7SummaryRevealed");
      localStorage.removeItem("akwaos.arg7FinalDraftRevealed");
      localStorage.removeItem("akwaos.arg7FinalSent");

      state.arg7SendCount = 0;
      state.arg7SummaryRevealed = false;
      state.arg7FinalDraftRevealed = false;
      state.arg7FinalSent = false;
      state.arg7CinematicStarted = false;
      clearArg7CinematicTimers();
      stopArg7RevealAudio();
      stopArg7FinaleAudio();

      document.body.classList.remove(
        "arg7-cinematic-active",
        "arg7-crt-shutting-down",
        "arg7-crt-black"
      );

      $("#arg7-cinematic-overlay")?.classList.add("is-hidden");
      $("#arg7-fake-cursor")?.classList.add("is-hidden");
      $("#arg7-shutdown-overlay")?.classList.add("is-hidden");
      $("#arg7-thankyou")?.classList.remove("is-visible");
      $("#arg7-composer")?.classList.remove("arg7-composer--cinematic");

      const arg7Recipient = $("#arg7-compose-recipient");
      if (arg7Recipient) arg7Recipient.textContent = "A.LAMO";

      const arg7Text = $("#arg7-compose-text");
      if (arg7Text) {
        arg7Text.readOnly = false;
        arg7Text.value = "";
      }

      const arg7CinematicBody = $("#arg7-cinematic-compose-body");
      if (arg7CinematicBody) {
        arg7CinematicBody.innerHTML = "";
        arg7CinematicBody.classList.add("is-hidden");
      }

      arg7Text?.classList.remove("is-hidden");

      $("#mail-arg7-stock-reply")?.remove();
      $("#mail-arg7-summary")?.remove();
      $("#mail-arg7-final-draft")?.remove();
      $("#arg7-composer")?.classList.add("is-hidden");

      updateMailCount();
      updateArg7MailAvailability();

      terminalPrint([
        "ARG7 MAIL EPILOGUE RESET.",
        "ARG6 COMPLETION PRESERVED.",
        "OUTBOX RECOVERY REMOVED."
      ], "term-warn");

      return;
    }

    // Hidden developer/testing command. Intentionally omitted from HELP.
    if (cmd === "arg6finalreset") {
      stopArg6DefenseTimers();

      localStorage.removeItem("akwaos.arg6IsaacProfileRead");
      localStorage.removeItem("akwaos.arg6AdrianMailRead");
      localStorage.removeItem("akwaos.arg6AdrianDefenseComplete");
      localStorage.removeItem("akwaos.arg7SendCount");
      localStorage.removeItem("akwaos.arg7SummaryRevealed");
      localStorage.removeItem("akwaos.arg7FinalDraftRevealed");
      localStorage.removeItem("akwaos.arg7FinalSent");

      state.arg6IsaacProfileRead = false;
      state.arg6AdrianMailRead = false;
      state.arg6AdrianDefenseComplete = false;
      state.arg6AdrianDefenseRunning = false;
      state.arg6SecurityLock = 28;
      state.arg6AdrianLinkStrength = 72;
      state.arg6DefenseSeconds = 60;
      state.arg6AimScore = 0;
      state.arg6AimErrors = 0;
      state.arg6AimLink = 100;
      state.arg6AimSeconds = 50;
      state.arg6AimLevel = 1;

      $("#mail-adrian-isaac-link")?.remove();
      $("#arg6-adrian-sequence")?.classList.add("is-hidden");

      document.body.classList.remove(
        "arg6-blackout-active",
        "arg6-defense-failed",
        "arg6-sweep-hot"
      );

      terminalPrint([
        "ARG6 FINAL SEQUENCE RESET.",
        "A.LAMO PRIVATE LINK REMOVED.",
        "ISAAC SESSION PRESERVED."
      ], "term-warn");

      return;
    }

    // Hidden developer/testing command. Intentionally omitted from HELP.
    if (cmd === "arg6reset") {
      stopArg6Timers();

      localStorage.removeItem("akwaos.arg6Unlocked");
      localStorage.removeItem("akwaos.arg6IsaacProfileRead");
      localStorage.removeItem("akwaos.arg6AdrianMailRead");
      localStorage.removeItem("akwaos.arg6AdrianDefenseComplete");

      state.arg6Unlocked = false;
      state.arg6IsaacProfileRead = false;
      state.arg6AdrianMailRead = false;
      state.arg6AdrianDefenseComplete = false;
      state.arg6AdrianDefenseRunning = false;
      state.arg6Trace = 6;
      state.arg6LockedFragments = [false, false, false, false];
      state.arg6FragmentValues = ["---", "---", "---", "---"];

      $("#arg6-orv")?.classList.add("is-hidden");
      $("#arg6-auth")?.classList.remove("is-hidden");
      $("#arg6-account")?.classList.add("is-hidden");

      document.body.classList.remove("arg6-running", "arg6-failed");

      terminalPrint([
        "ARG6 LOCAL STATE RESET.",
        "ISAAC AZIM SERVICE SESSION LOCKED.",
        "ARG1 / ARG2 / ARG3 / ARG4 / ARG5 STATE PRESERVED.",
        "",
        "RELOADING AKWAOS..."
      ], "term-warn");

      setTimeout(() => window.location.reload(), 650);
      return;
    }

    // Hidden developer/testing command. Intentionally omitted from HELP.
    if (cmd === "arg5reset") {
      stopArg5Timers();

      localStorage.removeItem("akwaos.arg5Complete");

      state.arg5Started = false;
      state.arg5Complete = false;
      state.arg5Route = ["A17"];
      state.arg5Trace = 8;
      state.arg5Connected = true;
      state.arg5CacheLeft = 10;
      state.arg5HintStage = 0;

      $("#arg5-routing")?.classList.add("is-hidden");
      $("#arg5-result")?.classList.add("is-hidden");

      document.body.classList.remove(
        "arg5-running",
        "arg5-failed",
        "arg5-complete"
      );

      updateArg5Availability();

      terminalPrint([
        "ARG5 LOCAL STATE RESET.",
        "SEC-C ROUTING MATRIX RESTORED.",
        "ARG1 / ARG2 / ARG3 / ARG4 STATE PRESERVED.",
        "",
        "RELOADING AKWAOS..."
      ], "term-warn");

      setTimeout(() => window.location.reload(), 650);
      return;
    }

    // Hidden developer/testing command. Intentionally omitted from HELP.
    if (cmd === "arg4reset") {
      localStorage.removeItem("akwaos.arg4RecycleOpened");
      localStorage.removeItem("akwaos.arg4HintMailRead");
      localStorage.removeItem("akwaos.arg4Recovered");
      localStorage.removeItem("akwaos.arg4ResultMailRead");

      state.arg4RecycleOpened = false;
      state.arg4HintMailRead = false;
      state.arg4RecoveryPending = false;
      state.arg4Recovered = false;
      state.arg4ResultMailRead = false;

      $("#arg4-recovered-row")?.remove();
      $("#mail-adrian-recycle-hint")?.remove();
      $("#mail-adrian-arg4-result")?.remove();

      document.body.classList.remove(
        "arg4-active",
        "arg4-recovered",
        "arg4-sec-c-ready"
      );

      if (state.adrianMailLinkRead) {
        document.body.classList.add("arg4-recycle-ready");
      }

      terminalPrint([
        "ARG4 LOCAL STATE RESET.",
        "R14_A17.REC REMOVED.",
        "ARG1 / ARG2 / ARG3 STATE PRESERVED.",
        "",
        "RELOADING AKWAOS..."
      ], "term-warn");

      setTimeout(() => window.location.reload(), 650);
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
      localStorage.removeItem("akwaos.adrianMailIntroRead");
      localStorage.removeItem("akwaos.adrianMailBridgeReady");
      localStorage.removeItem("akwaos.adrianMailLinkRead");

      state.arg3RequestReady = false;
      state.arg3DefenseComplete = false;
      state.adrianMailIntroRead = false;
      state.adrianMailBridgeReady = false;
      state.adrianMailLinkRead = false;
      state.arg3AlarmRunning = false;
      state.arg3PurgeProgress = 0;
      state.arg3CommandIndex = -1;
      state.arg3LastCommandIndex = -1;

      const ixionRow = $("#ixion-request-row");
      if (ixionRow) ixionRow.remove();
      $("#alamo-request-row")?.remove();
      $("#mail-adrian-intro")?.remove();
      $("#mail-adrian-linked")?.remove();
      $("#mail-notification")?.classList.add("is-hidden");
      document.body.classList.remove(
        "adrian-mail-unread",
        "adrian-mail-awaiting-file",
        "adrian-mail-linked"
      );

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

    if (state.arg4RecoveryPending) {
      if (cmd === "y" || cmd === "yes") {
        state.arg4RecoveryPending = false;

        terminalPrint([
          "PARTIAL RESTORE ACCEPTED.",
          "RESTORING RECOVERABLE FRAGMENTS..."
        ], "term-warn");
        clickTone();

        setTimeout(() => {
          state.arg4Recovered = true;
          localStorage.setItem("akwaos.arg4Recovered", "1");

          ensureArg4RecoveredRow();
          updateArg4Visuals();

          terminalPrint([
            "PARTIAL RESTORE COMPLETE.",
            "",
            "OUTPUT:",
            "R14_A17.REC"
          ], "term-warn");

          appendSystemEvent("[--:--] recycle shadow object R14 restored / partial");

          setTimeout(() => {
            ensureArg4MailRows();
            showMailNotification("НОВОЕ СООБЩЕНИЕ", "FROM: A.LAMO // R14");
          }, 1100);
        }, 1200);

        return;
      }

      if (cmd === "n" || cmd === "no") {
        state.arg4RecoveryPending = false;
        terminalPrint(["RESTORE CANCELLED."], "term-warn");
        return;
      }

      terminalPrint([
        "CONFIRM PARTIAL RESTORE.",
        "TYPE Y OR N."
      ], "term-error");
      return;
    }

    if (cmd === "recover") {
      const normalizedRecover = command.replace(/\s+/g, " ").trim().toUpperCase();

      if (!state.arg4RecycleOpened) {
        terminalPrint([
          "RECYCLE SHADOW INDEX NOT INITIALIZED."
        ], "term-error");
        errorTone();
        return;
      }

      if (normalizedRecover === "RECOVER R14_A17.SEC") {
        if (state.arg4Recovered) {
          terminalPrint([
            "R14_A17.REC already restored.",
            "STATUS: PARTIAL"
          ], "term-warn");
          return;
        }

        terminalPrint([
          "RECYCLE SHADOW INDEX FOUND.",
          "",
          "SLOT: R14",
          "NODE: A17",
          "CLASS: SEC",
          "",
          "RESTORING...",
          "██████░░░░ 61%"
        ], "term-warn");

        setTimeout(() => {
          state.arg4RecoveryPending = true;
          terminalPrint([
            "ERROR",
            "",
            "OBJECT NAME REMOVED.",
            "CONTENT FRAGMENTS AVAILABLE.",
            "",
            "RESTORE PARTIAL OBJECT?",
            "[Y/N]"
          ], "term-error");
          errorTone();
        }, 1050);

        return;
      }

      terminalPrint([
        "SHADOW OBJECT NOT FOUND.",
        "Use: help recover"
      ], "term-error");
      errorTone();
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
        "ALAMO.REQ": "alamo_request",
        "R14_A17.REC": "arg4_recovered",
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

    if (cmd === "help" && arg === "RECOVER") {
      terminalPrint([
        "AKWA SHADOW RECOVERY UTILITY",
        "--------------------------------",
        "Syntax:",
        "RECOVER <SLOT>_<NODE>.<CLASS>",
        "",
        "Restores an object from the recycle shadow index.",
        "",
        "Example:",
        "RECOVER R03_B12.LOG",
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

  const arg6Targets = ["A17", "IA", "L4", "ENG"];

  const arg6Pools = [
    ["A03", "A11", "C17", "A17", "B04", "SEC"],
    ["AZ", "IA", "AL", "IX", "OR", "AI"],
    ["L1", "L2", "L3", "L4", "L5", "SYS"],
    ["SCI", "SEC", "ENG", "GEN", "MED", "OPS"]
  ];

  function stopArg6Timers() {
    state.arg6CycleTimers.forEach((timer, index) => {
      if (timer) {
        clearInterval(timer);
        state.arg6CycleTimers[index] = null;
      }
    });

    if (state.arg6TraceTimer) {
      clearInterval(state.arg6TraceTimer);
      state.arg6TraceTimer = null;
    }
  }

  function updateArg6UI() {
    const trace = Math.max(0, Math.min(100, state.arg6Trace));
    const label = $("#arg6-trace-label");
    const fill = $("#arg6-trace-fill");

    if (label) label.textContent = `${Math.round(trace).toString().padStart(2, "0")}%`;
    if (fill) fill.style.width = `${trace}%`;

    state.arg6FragmentValues.forEach((value, index) => {
      const node = $(`#arg6-value-${index}`);
      if (node) node.textContent = value;

      const card = $(`.arg6-fragment[data-fragment-index="${index}"]`);
      const button = $(`.arg6-lock[data-fragment-lock="${index}"]`);

      card?.classList.toggle("is-locked", state.arg6LockedFragments[index]);

      if (button) {
        button.disabled = state.arg6LockedFragments[index];
        button.textContent = state.arg6LockedFragments[index] ? "LOCKED" : "LOCK";
      }
    });
  }

  function startArg6Cycles() {
    stopArg6Timers();

    state.arg6Trace = 6;
    state.arg6LockedFragments = [false, false, false, false];
    state.arg6FragmentValues = ["---", "---", "---", "---"];

    arg6Pools.forEach((pool, index) => {
      let cursor = Math.floor(Math.random() * pool.length);

      state.arg6CycleTimers[index] = setInterval(() => {
        if (state.arg6LockedFragments[index]) return;

        cursor = (cursor + 1) % pool.length;
        state.arg6FragmentValues[index] = pool[cursor];

        const node = $(`#arg6-value-${index}`);
        if (node) node.textContent = pool[cursor];
      }, 420 + index * 65);
    });

    state.arg6TraceTimer = setInterval(() => {
      state.arg6Trace += state.arg6Trace >= 70 ? 0.95 : 0.52;

      if (state.arg6Trace >= 100) {
        failArg6Auth();
        return;
      }

      updateArg6UI();
    }, 600);

    const status = $("#arg6-auth-status");
    if (status) status.textContent = "SESSION FRAGMENTS CYCLING...";
    updateArg6UI();
  }

  function lockArg6Fragment(index) {
    if (state.arg6Unlocked || state.arg6LockedFragments[index]) return;

    const current = state.arg6FragmentValues[index];
    const target = arg6Targets[index];

    if (current === target) {
      state.arg6LockedFragments[index] = true;
      state.arg6Trace = Math.max(0, state.arg6Trace - 9);

      if (state.arg6CycleTimers[index]) {
        clearInterval(state.arg6CycleTimers[index]);
        state.arg6CycleTimers[index] = null;
      }

      const status = $("#arg6-auth-status");
      if (status) {
        status.textContent = `FRAGMENT ${String(index + 1).padStart(2, "0")} SYNCHRONIZED // TRACE -9%`;
      }

      makeTone(620, 0.07, 0.018, "square");
      setTimeout(() => makeTone(780, 0.07, 0.015, "square"), 70);

      if (state.arg6LockedFragments.every(Boolean)) {
        completeArg6Auth();
      }

      updateArg6UI();
      return;
    }

    state.arg6Trace = Math.min(100, state.arg6Trace + 13);

    const status = $("#arg6-auth-status");
    if (status) {
      status.textContent = `FRAGMENT ${String(index + 1).padStart(2, "0")} MISMATCH // AUDIT +13%`;
    }

    errorTone();

    if (state.arg6Trace >= 100) {
      failArg6Auth();
      return;
    }

    updateArg6UI();
  }

  function failArg6Auth() {
    stopArg6Timers();

    state.arg6Trace = 100;
    updateArg6UI();

    const status = $("#arg6-auth-status");
    if (status) status.textContent = "AUDIT TRACE 100% // SERVICE SESSION REJECTED";

    document.body.classList.add("arg6-failed");
    arg3ErrorBurst();

    setTimeout(() => {
      document.body.classList.remove("arg6-failed");
      startArg6Cycles();
    }, 2100);
  }

  function completeArg6Auth() {
    stopArg6Timers();

    state.arg6Unlocked = true;
    localStorage.setItem("akwaos.arg6Unlocked", "1");

    const status = $("#arg6-auth-status");
    if (status) status.textContent = "SERVICE TOKEN RESTORED // ISAAC AZIM";

    makeTone(410, 0.11, 0.018, "sine");
    setTimeout(() => makeTone(590, 0.12, 0.016, "sine"), 120);
    setTimeout(() => makeTone(820, 0.16, 0.014, "sine"), 250);

    setTimeout(() => {
      $("#arg6-auth")?.classList.add("is-hidden");
      $("#arg6-account")?.classList.remove("is-hidden");
    }, 800);

    appendSystemEvent("[--:--] ISAAC AZIM service session restored / clearance LEVEL 4");
  }

  function openArg6() {
    if (!state.arg5Complete) return;

    const overlay = $("#arg6-orv");
    if (!overlay) return;

    overlay.classList.remove("is-hidden");
    document.body.classList.add("arg6-running");

    if (state.arg6Unlocked) {
      $("#arg6-auth")?.classList.add("is-hidden");
      $("#arg6-account")?.classList.remove("is-hidden");
      return;
    }

    $("#arg6-auth")?.classList.remove("is-hidden");
    $("#arg6-account")?.classList.add("is-hidden");
    startArg6Cycles();
  }

  function closeArg6() {
    stopArg6Timers();
    $("#arg6-orv")?.classList.add("is-hidden");
    document.body.classList.remove("arg6-running", "arg6-failed");
  }

  function showArg6File(key) {
    const view = $("#arg6-file-view");
    if (!view) return;

    const files = {
      isaac: `ISAAC_AZIM.PROFILE
--------------------------------
NAME:
ISAAC AZIM

AGE:
43

POSITION:
PROGRAMMER / ENGINEER

CLEARANCE:
LEVEL 4

DIVISION:
ENGINEERING / ORV

SERVICE ACCOUNT:
ACTIVE

AUTHORIZED SYSTEMS:
ENGINEERING CACHE
LOCAL SECURITY EXPORT
INTERNAL SERVICE DIRECTORY

NOTES:
Служебный профиль имеет доступ
к инженерным и диагностическим
разделам внутренней сети AKWA.

STATUS:
ACTIVE PERSONNEL RECORD`,

      service: `ENGINEERING_SERVICE.LOG
--------------------------------
SERVICE OWNER: ISAAC AZIM
ENGINEERING CACHE: ACTIVE

CORE: ONLINE
MOTION: STABLE
SDE INTERFACE: STABLE

03:07:42
ROUTE PACKAGE RECEIVED FROM A17

03:08:03
SECURITY MAP COPY STORED

03:09:18
HOLDING SECTOR ROUTE CACHED

STATUS:
LOCAL MEMORY RETAINED`,

      sde: `SDE_INTERFACE.NFO
--------------------------------
ENGINEERING REFERENCE:
CONTROLLED OSDEIN CONDUCTION.

SOURCE:
SDE INTERFACE CORE

FUNCTION:
RECEIVE / HOLD / REDIRECT
OSDEIN ENERGY THROUGH
ARTIFICIAL CONTROL CHANNELS.

OPERATOR:
ENGINEERING

WARNING:
UNSTABLE WITHOUT CALIBRATION.`,

      export: `SEC_EXPORT.CPY
--------------------------------
SOURCE:
A17:\\SEC-C\\NIGHT.ROUTE

DESTINATION:
LOCAL:\\SERVICE\\ROUTE.CPY

CREATED:
03:07:42

ACCOUNT:
AQ-S17-441

STATUS:
EXPORT COMPLETE

SECONDARY OWNER:
[NOT RECORDED]`,

      memory: `ORV_04_MEM.MAP
--------------------------------
CACHE:
LOCAL SERVICE

SERVICE OWNER:
ISAAC AZIM

MEMORY SLOT:
M-04

SDE CORE:
ACTIVE

LAST ROUTE CACHE:
HOLDING SECTOR

LAST SECURITY PACKAGE:
A17 / SEC-C / NIGHT.ROUTE

REMOTE SERVICE:
AVAILABLE

SESSION OWNER:
ISAAC AZIM

NOTE:
Local service cache retained a copy
after A17 session termination.`
    };

    view.textContent = files[key] || "FILE UNAVAILABLE.";

    if (key === "memory") {
      view.classList.add("arg6-file-view--important");
    } else {
      view.classList.remove("arg6-file-view--important");
    }

    if (key === "isaac" && !state.arg6IsaacProfileRead) {
      state.arg6IsaacProfileRead = true;
      localStorage.setItem("akwaos.arg6IsaacProfileRead", "1");

      setTimeout(() => {
        ensureArg6AdrianPrivateMail();
        showMailNotification("НОВОЕ СООБЩЕНИЕ", "FROM: A.LAMO // PRIVATE LINK");
      }, 800);
    }

    clickTone();
  }

  function switchArg6Tab(tab) {
    $$(".arg6-tab").forEach(button => {
      button.classList.toggle("is-active", button.dataset.arg6Tab === tab);
    });

    ["files", "logs", "history"].forEach(name => {
      $(`#arg6-pane-${name}`)?.classList.toggle("is-hidden", name !== tab);
    });

    clickTone();
  }

  function ensureArg6AdrianPrivateMail() {
    if (!state.arg6IsaacProfileRead) return;

    const list = $("#mail-list");
    if (!list || $("#mail-adrian-isaac-link")) return;

    const row = document.createElement("button");
    row.id = "mail-adrian-isaac-link";
    row.className = "mail-row mail-row--adrian";
    row.type = "button";
    row.dataset.file = "mail_adrian_isaac_link";
    row.innerHTML = `
      <span class="mail-row__flag">${state.arg6AdrianMailRead ? "○" : "●"}</span>
      <span><b>A.LAMO</b><small>PRIVATE LINK / TRACE-NULL</small></span>
      <time>--:--</time>
    `;

    row.addEventListener("click", () => {
      openFile("mail_adrian_isaac_link");
      const flag = row.querySelector(".mail-row__flag");
      if (flag) flag.textContent = "○";

      state.arg6AdrianMailRead = true;
      localStorage.setItem("akwaos.arg6AdrianMailRead", "1");

      setTimeout(bindArg6AdrianPrivateLink, 40);
    });

    list.appendChild(row);
    updateMailCount();
  }

  function bindArg6AdrianPrivateLink() {
    const link = $("#arg6-adrian-private-link");
    if (!link || link.dataset.bound === "1") return;

    link.dataset.bound = "1";
    link.addEventListener("click", beginArg6Blackout);
  }

  function stopArg6DefenseTimers() {
    if (state.arg6AimSpawnTimer) {
      clearTimeout(state.arg6AimSpawnTimer);
      state.arg6AimSpawnTimer = null;
    }

    if (state.arg6AimClockTimer) {
      clearInterval(state.arg6AimClockTimer);
      state.arg6AimClockTimer = null;
    }

    state.arg6AimTargets.forEach(target => {
      if (target.timeout) clearTimeout(target.timeout);
      target.node?.remove();
    });

    state.arg6AimTargets.clear();
  }

  function arg6AimFlash(text, danger = false) {
    const node = $("#arg6-aim-center-message");
    if (!node) return;

    node.textContent = text;
    node.classList.toggle("is-danger", danger);
    node.classList.remove("is-hidden");
    void node.offsetWidth;
    node.classList.add("arg6-aim-center-message--show");

    setTimeout(() => {
      node.classList.remove("arg6-aim-center-message--show");
      setTimeout(() => node.classList.add("is-hidden"), 180);
    }, 500);
  }

  function setArg6AimHint(text, sub = null) {
    const main = $("#arg6-aim-hint-text");
    const subNode = $(".arg6-aim-hint__sub");

    if (main) main.textContent = text;
    if (sub !== null && subNode) subNode.textContent = sub;

    makeTone(510, 0.045, 0.01, "sine");
  }

  function getArg6AimLevel() {
    if (state.arg6AimScore >= 19 || state.arg6AimSeconds <= 9) return 4;
    if (state.arg6AimScore >= 13 || state.arg6AimSeconds <= 19) return 3;
    if (state.arg6AimScore >= 7 || state.arg6AimSeconds <= 32) return 2;
    return 1;
  }

  function getArg6AimConfig() {
    const level = getArg6AimLevel();

    // Active-target caps are intentional. The game must never flood the screen.
    const configs = {
      1: {
        spawn: 1180,
        life: 2350,
        fakeChance: 0.00,
        maxActive: 1
      },
      2: {
        spawn: 980,
        life: 2150,
        fakeChance: 0.16,
        maxActive: 2
      },
      3: {
        spawn: 820,
        life: 1900,
        fakeChance: 0.24,
        maxActive: 2
      },
      4: {
        spawn: 690,
        life: 1650,
        fakeChance: 0.30,
        maxActive: 3
      }
    };

    return { level, ...configs[level] };
  }

  function updateArg6AimUI() {
    const score = $("#arg6-aim-score");
    const errors = $("#arg6-aim-errors");
    const time = $("#arg6-aim-time");
    const link = $("#arg6-aim-link-value");
    const linkFill = $("#arg6-aim-link-fill");
    const level = $("#arg6-aim-level");
    const stage = $("#arg6-aim-stage-text");

    if (score) score.textContent = `${state.arg6AimScore} / 24`;
    if (errors) errors.textContent = `${state.arg6AimErrors} / 5`;
    if (time) time.textContent = `00:${String(Math.max(0, state.arg6AimSeconds)).padStart(2, "0")}`;
    if (link) link.textContent = `${Math.max(0, Math.round(state.arg6AimLink))}%`;
    if (linkFill) linkFill.style.width = `${Math.max(0, state.arg6AimLink)}%`;

    const currentLevel = getArg6AimLevel();
    state.arg6AimLevel = currentLevel;

    if (level) level.textContent = String(currentLevel);

    if (stage) {
      const labels = {
        1: "SLOW / MAX 1 TARGET",
        2: "DECOYS ACTIVE / MAX 2",
        3: "FASTER / MAX 2",
        4: "FINAL TRACE / MAX 3"
      };
      stage.textContent = labels[currentLevel];
    }
  }

  function randomArg6AimPosition(size) {
    const arena = $("#arg6-aim-arena");
    if (!arena) return { x: 50, y: 50 };

    const rect = arena.getBoundingClientRect();
    const padX = Math.max(size / rect.width * 100, 7);
    const padY = Math.max(size / rect.height * 100, 10);

    return {
      x: padX + Math.random() * (100 - padX * 2),
      y: padY + Math.random() * (100 - padY * 2)
    };
  }

  function removeArg6AimTarget(id) {
    const target = state.arg6AimTargets.get(id);
    if (!target) return;

    if (target.timeout) clearTimeout(target.timeout);
    target.node?.remove();
    state.arg6AimTargets.delete(id);
  }

  function missArg6RealHole(id) {
    const target = state.arg6AimTargets.get(id);
    if (!target || !target.real) return;

    removeArg6AimTarget(id);

    state.arg6AimLink = Math.max(0, state.arg6AimLink - 8);
    arg6AimFlash("HOLE COLLAPSED // LINK -8", true);
    errorTone();
    updateArg6AimUI();

    if (state.arg6AimLink <= 0) {
      failArg6Defense();
    }
  }

  function clickArg6AimTarget(id) {
    if (!state.arg6AdrianDefenseRunning) return;

    const target = state.arg6AimTargets.get(id);
    if (!target) return;

    removeArg6AimTarget(id);

    if (target.real) {
      state.arg6AimScore += 1;
      state.arg6AimLink = Math.min(100, state.arg6AimLink + 3);

      arg6AimFlash("REAL HOLE // ROUTED");
      makeTone(620, 0.055, 0.016, "square");
      setTimeout(() => makeTone(790, 0.05, 0.012, "square"), 55);

      if (state.arg6AimScore === 6) {
        setArg6AimHint(
          "ТЕМП РАСТЁТ. НАСТОЯЩИЕ ДЫРЫ ВСЁ ЕЩЁ ИМЕЮТ ДВА КОЛЬЦА.",
          "Теперь рядом иногда будет появляться одна ловушка WATCHDOG."
        );
      } else if (state.arg6AimScore === 12) {
        setArg6AimHint(
          "НЕ СПЕШИ КЛИКАТЬ ПО ВСЕМУ. ИЩИ ДВОЙНОЕ КОЛЬЦО.",
          "На экране не будет больше двух целей до финального этапа."
        );
      } else if (state.arg6AimScore === 18) {
        setArg6AimHint(
          "ЕЩЁ НЕМНОГО. Я ПОЧТИ ЗАКОНЧИЛА. ДЕРЖИ КАНАЛ.",
          "Последний участок самый быстрый."
        );
      }

      if (state.arg6AimScore >= 24) {
        completeArg6Defense();
        return;
      }
    } else {
      state.arg6AimErrors += 1;
      state.arg6AimLink = Math.max(0, state.arg6AimLink - 12);

      arg6AimFlash("WATCHDOG DECOY // ERROR", true);
      errorTone();

      if (state.arg6AimErrors === 1) {
        setArg6AimHint(
          "ЭТО БЫЛА ЛОВУШКА. НАСТОЯЩАЯ ДЫРА = ДВА КОЛЬЦА.",
          "Одинарное кольцо не трогай."
        );
      }

      if (state.arg6AimErrors >= 5 || state.arg6AimLink <= 0) {
        updateArg6AimUI();
        failArg6Defense();
        return;
      }
    }

    updateArg6AimUI();
  }

  function spawnArg6AimTarget(forceReal = null) {
    if (!state.arg6AdrianDefenseRunning) return;

    const arena = $("#arg6-aim-arena");
    if (!arena) return;

    const config = getArg6AimConfig();

    // Secondary safety cap in case multiple delayed spawns fire together.
    if (state.arg6AimTargets.size >= config.maxActive) return;
    const real = forceReal === null ? Math.random() >= config.fakeChance : forceReal;
    const id = ++state.arg6AimTargetId;

    const size = real
      ? 70 + Math.floor(Math.random() * 24)
      : 64 + Math.floor(Math.random() * 28);

    const pos = randomArg6AimPosition(size);
    const node = document.createElement("button");

    node.type = "button";
    node.className = real
      ? "arg6-hole arg6-hole--real"
      : "arg6-hole arg6-hole--fake";

    node.style.left = `${pos.x}%`;
    node.style.top = `${pos.y}%`;
    node.style.width = `${size}px`;
    node.style.height = `${size}px`;
    node.dataset.aimId = String(id);

    node.innerHTML = real
      ? `<span class="arg6-hole__outer"></span>
         <span class="arg6-hole__inner"></span>
         <b>HOLE</b>`
      : `<span class="arg6-hole__outer"></span>
         <b>NULL</b>`;

    node.addEventListener("click", () => clickArg6AimTarget(id));
    arena.appendChild(node);

    const life = real
      ? config.life * (0.88 + Math.random() * 0.22)
      : config.life * 1.35;

    const timeout = setTimeout(() => {
      if (real) missArg6RealHole(id);
      else removeArg6AimTarget(id);
    }, life);

    state.arg6AimTargets.set(id, { id, node, real, timeout });
  }

  function scheduleArg6AimSpawn() {
    if (!state.arg6AdrianDefenseRunning) return;

    const config = getArg6AimConfig();
    const activeCount = state.arg6AimTargets.size;

    // Never add another object if the screen has reached the current level cap.
    if (activeCount >= config.maxActive) {
      state.arg6AimSpawnTimer = setTimeout(scheduleArg6AimSpawn, 180);
      return;
    }

    // The primary object is always a real hole, so progress never depends on RNG.
    spawnArg6AimTarget(true);

    // From level 2 onward a single decoy MAY appear, but only if a slot remains.
    if (
      config.fakeChance > 0 &&
      state.arg6AimTargets.size < config.maxActive &&
      Math.random() < config.fakeChance
    ) {
      setTimeout(() => {
        if (!state.arg6AdrianDefenseRunning) return;

        const currentConfig = getArg6AimConfig();

        if (state.arg6AimTargets.size < currentConfig.maxActive) {
          spawnArg6AimTarget(false);
        }
      }, 150);
    }

    const jitter = config.spawn * (0.92 + Math.random() * 0.18);
    state.arg6AimSpawnTimer = setTimeout(scheduleArg6AimSpawn, jitter);
  }

  function beginArg6Blackout() {
    const sequence = $("#arg6-adrian-sequence");
    const blackout = $("#arg6-blackout");
    const defense = $("#arg6-adrian-defense");
    const text = $("#arg6-blackout-text");

    if (!sequence || !blackout || !defense || !text) return;

    sequence.classList.remove("is-hidden");
    blackout.classList.remove("is-hidden");
    defense.classList.add("is-hidden");
    text.textContent = "";

    document.body.classList.add("arg6-blackout-active");

    const lines = [
      "A17://LOCAL/ALAMO/TRACE-NULL",
      "",
      "ROUTE OPENED",
      "",
      "UNREGISTERED LOCAL REDIRECT",
      "",
      "AKWAOS SECURITY WATCHDOG",
      "",
      "SUSPICIOUS ACTIVITY DETECTED"
    ];

    let index = 0;

    const next = () => {
      if (index >= lines.length) {
        setTimeout(startArg6Defense, 720);
        return;
      }

      text.textContent += `${lines[index]}\n`;
      makeTone(170 + index * 17, 0.04, 0.009, "square");
      index += 1;
      setTimeout(next, index < 4 ? 210 : 300);
    };

    next();
  }

  function startArg6Defense() {
    $("#arg6-blackout")?.classList.add("is-hidden");
    $("#arg6-adrian-defense")?.classList.remove("is-hidden");
    $("#arg6-defense-result")?.classList.add("is-hidden");

    stopArg6DefenseTimers();

    state.arg6AdrianDefenseRunning = true;
    state.arg6AimScore = 0;
    state.arg6AimErrors = 0;
    state.arg6AimLink = 100;
    state.arg6AimSeconds = 45;
    state.arg6AimTargetId = 0;
    state.arg6AimLevel = 1;

    setArg6AimHint(
      "ЖМИ ТОЛЬКО НА НАСТОЯЩИЕ ДЫРЫ — У НИХ ДВА КОЛЬЦА.",
      "Одинарное кольцо — ловушка WATCHDOG. Настоящая дыра исчезнет, если не успеть."
    );

    updateArg6AimUI();

    // Give player 1.5 sec to read the large hint.
    setTimeout(() => {
      if (!state.arg6AdrianDefenseRunning) return;

      spawnArg6AimTarget(true);
      state.arg6AimSpawnTimer = setTimeout(scheduleArg6AimSpawn, 1000);
    }, 1500);

    state.arg6AimClockTimer = setInterval(() => {
      if (!state.arg6AdrianDefenseRunning) return;

      state.arg6AimSeconds -= 1;

      if (state.arg6AimSeconds === 30) {
        setArg6AimHint(
          "ЛОВУШЕК СТАНОВИТСЯ БОЛЬШЕ. СМОТРИ НА КОЛЬЦА, А НЕ НА ТЕКСТ.",
          "Двойное = настоящее. Одинарное = WATCHDOG."
        );
      }

      if (state.arg6AimSeconds === 15) {
        setArg6AimHint(
          "ПОСЛЕДНИЕ СЕКУНДЫ. НЕ КЛИКАЙ НАУГАД.",
          "Нам нужно 24 настоящих дыры."
        );
      }

      if (state.arg6AimSeconds <= 0) {
        if (state.arg6AimScore >= 24) {
          completeArg6Defense();
        } else {
          failArg6Defense("TIME EXPIRED");
        }
        return;
      }

      updateArg6AimUI();
    }, 1000);
  }

  function failArg6Defense(reason = "LINK LOST") {
    stopArg6DefenseTimers();

    state.arg6AdrianDefenseRunning = false;

    document.body.classList.add("arg6-defense-failed");
    arg6AimFlash(`${reason} // RETRY`, true);
    arg3ErrorBurst();

    setArg6AimHint(
      "НЕ ПОЛУЧИЛОСЬ. ЕЩЁ РАЗ.",
      "Двойное кольцо — настоящая дыра. Одинарное — ловушка."
    );

    setTimeout(() => {
      document.body.classList.remove("arg6-defense-failed");
      startArg6Defense();
    }, 2200);
  }

  function completeArg6Defense() {
    if (!state.arg6AdrianDefenseRunning) return;

    stopArg6DefenseTimers();

    state.arg6AdrianDefenseRunning = false;
    state.arg6AdrianDefenseComplete = true;
    localStorage.setItem("akwaos.arg6AdrianDefenseComplete", "1");

    updateArg7MailAvailability();

    setTimeout(() => {
      toast("MAIL: OUTBOUND COMPOSER AVAILABLE.");
    }, 1200);

    state.arg6AimTargets.forEach(target => {
      if (target.timeout) clearTimeout(target.timeout);
      target.node?.remove();
    });
    state.arg6AimTargets.clear();

    setArg6AimHint(
      "ЕСТЬ. КАНАЛ УДЕРЖАН.",
      "Система потеряла маршрут."
    );

    setTimeout(() => {
      $("#arg6-defense-result")?.classList.remove("is-hidden");
    }, 550);

    appendSystemEvent("[--:--] suspicious redirect unresolved / A.LAMO link retained");
  }

  function closeArg6DefenseSequence() {
    stopArg6DefenseTimers();

    state.arg6AdrianDefenseRunning = false;
    $("#arg6-adrian-sequence")?.classList.add("is-hidden");

    document.body.classList.remove(
      "arg6-blackout-active",
      "arg6-defense-failed"
    );
  }

  function setupArg6() {
    $("#arg6-isaac-entry")?.addEventListener("click", openArg6);
    $("#arg6-close")?.addEventListener("click", closeArg6);

    $$(".arg6-lock").forEach(button => {
      button.addEventListener("click", () => {
        lockArg6Fragment(Number(button.dataset.fragmentLock));
      });
    });

    $$(".arg6-tab").forEach(button => {
      button.addEventListener("click", () => switchArg6Tab(button.dataset.arg6Tab));
    });

    $("#arg6-history-easter-button")?.addEventListener("click", () => {
      switchArg6Tab("history");

      const historyTab = $(`.arg6-tab[data-arg6-tab="history"]`);
      historyTab?.classList.add("arg6-tab--easter-active");

      setTimeout(() => {
        historyTab?.classList.remove("arg6-tab--easter-active");
      }, 1400);

      toast("LOCAL BROWSER CACHE // ISAAC_AZIM");
      makeTone(520, 0.07, 0.014, "square");
      setTimeout(() => makeTone(710, 0.08, 0.012, "square"), 80);
    });

    $$(".arg6-file").forEach(button => {
      button.addEventListener("click", () => showArg6File(button.dataset.arg6File));
    });
    $("#arg6-defense-exit")?.addEventListener("click", closeArg6DefenseSequence);


    ensureArg6AdrianPrivateMail();
  }

  const arg5CorrectRoute = [
    "A17",
    "R1",
    "CAM-12",
    "R3",
    "AUDIT",
    "R4",
    "DOOR",
    "SEC-C"
  ];

  function arg5AppendEvent(text, danger = false) {
    const log = $("#arg5-event-log");
    if (!log) return;

    const p = document.createElement("p");
    if (danger) p.className = "is-danger";
    p.textContent = text;
    log.appendChild(p);

    while (log.children.length > 8) {
      log.removeChild(log.firstChild);
    }

    log.scrollTop = log.scrollHeight;
  }

  function arg5Adrian(text) {
    const log = $("#arg5-adrian-log");
    if (!log) return;

    const p = document.createElement("p");
    p.textContent = `> ${text}`;
    log.appendChild(p);

    while (log.children.length > 7) {
      log.removeChild(log.firstChild);
    }

    log.scrollTop = log.scrollHeight;
    makeTone(510, 0.05, 0.012, "sine");
  }

  function stopArg5Timers() {
    if (state.arg5TraceTimer) {
      clearInterval(state.arg5TraceTimer);
      state.arg5TraceTimer = null;
    }

    if (state.arg5CacheTimer) {
      clearInterval(state.arg5CacheTimer);
      state.arg5CacheTimer = null;
    }
  }

  function updateArg5Availability() {
    const ready = state.arg4ResultMailRead || state.arg5Complete;

    document.body.classList.toggle("arg5-ready", ready && !state.arg5Complete);
    document.body.classList.toggle("arg5-complete", state.arg5Complete);

    const btn = $("#security-map-button");
    if (btn && ready) {
      btn.textContent = state.arg5Complete
        ? "ОТКРЫТЬ ВОССТАНОВЛЕННУЮ КАРТУ SEC-C"
        : "OPEN ROUTING MATRIX // SEC-C";
    }
  }

  function updateArg5UI() {
    const progress = Math.round(((state.arg5Route.length - 1) / (arg5CorrectRoute.length - 1)) * 100);
    const routePercent = $("#arg5-route-percent");
    const routeFill = $("#arg5-route-fill");
    const tracePercent = $("#arg5-trace-percent");
    const traceFill = $("#arg5-trace-fill");
    const watchdogLabel = $("#arg5-watchdog-label");

    if (routePercent) routePercent.textContent = `${Math.max(0, progress)}%`;
    if (routeFill) routeFill.style.width = `${Math.max(0, progress)}%`;

    const trace = Math.max(0, Math.min(100, state.arg5Trace));
    if (tracePercent) tracePercent.textContent = `${Math.round(trace).toString().padStart(2, "0")}%`;
    if (traceFill) traceFill.style.width = `${trace}%`;
    if (watchdogLabel) watchdogLabel.textContent = `TRACE ${Math.round(trace).toString().padStart(2, "0")}%`;

    const tokenState = {
      camera: state.arg5Route.includes("CAM-12"),
      audit: state.arg5Route.includes("AUDIT"),
      door: state.arg5Route.includes("DOOR")
    };

    [
      ["#arg5-token-camera", tokenState.camera],
      ["#arg5-token-audit", tokenState.audit],
      ["#arg5-token-door", tokenState.door]
    ].forEach(([selector, owned]) => {
      const node = $(selector);
      if (!node) return;
      node.classList.toggle("is-owned", owned);
      const b = $("b", node);
      if (b) b.textContent = owned ? "ACQUIRED" : "LOCKED";
    });

    $$(".arg5-node").forEach(node => {
      const id = node.dataset.arg5Node;
      const routeIndex = state.arg5Route.indexOf(id);
      node.classList.toggle("is-active", routeIndex >= 0);
      node.classList.toggle("is-current", id === state.arg5Route[state.arg5Route.length - 1]);
    });

    const disconnect = $("#arg5-disconnect");
    if (disconnect) {
      disconnect.textContent = state.arg5Connected ? "DISCONNECT ROUTE" : "RECONNECT ROUTE";
      disconnect.classList.toggle("is-disconnected", !state.arg5Connected);
    }

    $("#arg5-cache")?.classList.toggle("is-hidden", state.arg5Connected);
    const cacheValue = $("#arg5-cache-value");
    if (cacheValue) cacheValue.textContent = String(state.arg5CacheLeft);

    document.body.classList.toggle("arg5-route-disconnected", !state.arg5Connected);
  }

  function resetArg5Run(showMessage = true) {
    stopArg5Timers();

    state.arg5Started = true;
    state.arg5Route = ["A17"];
    state.arg5Trace = 8;
    state.arg5Connected = true;
    state.arg5CacheLeft = 10;
    state.arg5HintStage = 0;

    $("#arg5-result")?.classList.add("is-hidden");
    $("#arg5-routing")?.classList.remove("arg5-routing--complete");
    $("#arg5-board-pulse")?.classList.add("is-hidden");

    const eventLog = $("#arg5-event-log");
    if (eventLog) {
      eventLog.innerHTML = "<p>ROUTE SESSION INITIALIZED.</p>";
    }

    const adrianLog = $("#arg5-adrian-log");
    if (adrianLog) {
      adrianLog.innerHTML = `
        <p>&gt; SEC-C не пустит тебя напрямую.</p>
        <p>&gt; Проведи маршрут через контрольные узлы.</p>
        <p>&gt; CAM-12 должна быть первой контрольной точкой.</p>
      `;
    }

    updateArg5UI();
    beginArg5Trace();

    if (showMessage) {
      arg5AppendEvent("WATCHDOG TRACE ACTIVE.", true);
    }
  }

  function beginArg5Trace() {
    if (state.arg5Complete) return;

    if (state.arg5TraceTimer) {
      clearInterval(state.arg5TraceTimer);
    }

    state.arg5TraceTimer = setInterval(() => {
      if (!state.arg5Started || !state.arg5Connected) return;

      state.arg5Trace += state.arg5Trace >= 70 ? 1.05 : 0.62;

      if (state.arg5Trace >= 78 && state.arg5HintStage < 3) {
        state.arg5HintStage = 3;
        arg5Adrian("WATCHDOG слишком близко. Разорви маршрут и дай ему пройти.");
      }

      if (state.arg5Trace >= 100) {
        failArg5Routing();
        return;
      }

      updateArg5UI();
    }, 550);
  }

  function startArg5CacheCountdown() {
    if (state.arg5CacheTimer) clearInterval(state.arg5CacheTimer);

    state.arg5CacheLeft = 10;
    updateArg5UI();

    state.arg5CacheTimer = setInterval(() => {
      if (state.arg5Connected) {
        clearInterval(state.arg5CacheTimer);
        state.arg5CacheTimer = null;
        return;
      }

      state.arg5CacheLeft -= 1;

      if (state.arg5CacheLeft <= 0) {
        clearInterval(state.arg5CacheTimer);
        state.arg5CacheTimer = null;

        state.arg5Route = ["A17"];
        state.arg5Connected = true;
        state.arg5CacheLeft = 10;

        arg5AppendEvent("ROUTE CACHE EXPIRED // PATH RESET", true);
        arg5Adrian("Слишком долго. Система забыла маршрут. Собирай снова.");
        errorTone();
      }

      updateArg5UI();
    }, 1000);
  }

  function toggleArg5Disconnect() {
    if (!state.arg5Started || state.arg5Complete) return;

    state.arg5Connected = !state.arg5Connected;

    if (!state.arg5Connected) {
      arg5AppendEvent("ROUTE DISCONNECTED // WATCHDOG BLIND WINDOW");
      arg5Adrian("Хорошо. Пока маршрут разорван, WATCHDOG тебя не видит.");
      startArg5CacheCountdown();
    } else {
      if (state.arg5CacheTimer) {
        clearInterval(state.arg5CacheTimer);
        state.arg5CacheTimer = null;
      }

      state.arg5CacheLeft = 10;
      state.arg5Trace = Math.max(0, state.arg5Trace - 6);
      arg5AppendEvent("ROUTE RECONNECTED // TRACE -6%");
    }

    updateArg5UI();
    clickTone();
  }

  function handleArg5Node(nodeId) {
    if (!state.arg5Started || state.arg5Complete) return;

    if (!state.arg5Connected) {
      arg5AppendEvent("INPUT REJECTED // ROUTE DISCONNECTED", true);
      errorTone();
      return;
    }

    const currentIndex = state.arg5Route.length - 1;
    const expectedNext = arg5CorrectRoute[currentIndex + 1];

    if (!expectedNext) return;

    if (nodeId === expectedNext) {
      state.arg5Route.push(nodeId);
      state.arg5Trace = Math.max(0, state.arg5Trace - 8);

      arg5AppendEvent(`${nodeId} LINKED // TRACE -8%`);
      makeTone(620, 0.07, 0.018, "square");
      setTimeout(() => makeTone(760, 0.07, 0.015, "square"), 70);

      const pulse = $("#arg5-board-pulse");
      if (pulse) {
        pulse.textContent = `${nodeId} // SIGNAL ROUTED`;
        pulse.classList.remove("is-hidden");
        setTimeout(() => pulse.classList.add("is-hidden"), 500);
      }

      if (nodeId === "CAM-12") {
        arg5Adrian("CAMERA TOKEN получен. Теперь ищи AUDIT.");
        arg5AppendEvent("CAMERA TOKEN ACQUIRED.");
      } else if (nodeId === "AUDIT") {
        arg5Adrian("AUDIT маскирует clearance. Остался дверной токен.");
        arg5AppendEvent("AUDIT TOKEN ACQUIRED.");
      } else if (nodeId === "DOOR") {
        arg5Adrian("DOOR TOKEN есть. Теперь только SEC-C.");
        arg5AppendEvent("DOOR TOKEN ACQUIRED.");
      } else if (nodeId === "SEC-C") {
        completeArg5Routing();
        return;
      } else if (nodeId === "R3" && state.arg5HintStage < 1) {
        state.arg5HintStage = 1;
        arg5Adrian("Не веди AUDIT напрямую к SEC-C. После него нужен SEC relay.");
      } else if (nodeId === "R4" && state.arg5HintStage < 2) {
        state.arg5HintStage = 2;
        arg5Adrian("Почти готово. DOOR должна подтвердить проход.");
      }

      updateArg5UI();
      return;
    }

    const current = state.arg5Route[state.arg5Route.length - 1];

    if (nodeId === current) {
      return;
    }

    state.arg5Trace = Math.min(100, state.arg5Trace + 11);
    arg5AppendEvent(`${nodeId} INVALID FROM ${current} // TRACE +11%`, true);
    errorTone();

    if (nodeId === "WATCHDOG") {
      state.arg5Trace = Math.min(100, state.arg5Trace + 10);
      arg5Adrian("Не трогай WATCHDOG. Ты только показал ему свой маршрут.");
    } else if (nodeId === "R2" || nodeId === "ARCH-2") {
      arg5Adrian("Это архивная ветка. SEC-C находится в другой стороне.");
    } else if (nodeId === "MAINT") {
      arg5Adrian("MAINT ведёт в сервисный контур. Нам нужен security relay.");
    }

    if (state.arg5Trace >= 100) {
      failArg5Routing();
      return;
    }

    updateArg5UI();
  }

  function failArg5Routing() {
    stopArg5Timers();

    state.arg5Started = false;
    state.arg5Trace = 100;
    updateArg5UI();

    document.body.classList.add("arg5-failed");
    arg5AppendEvent("ROUTING ANOMALY DETECTED.", true);
    arg5AppendEvent("SEC-C MATRIX LOCKED.", true);
    arg5Adrian("Я же сказал не оставлять маршрут открытым. Попробуй ещё раз.");
    arg3ErrorBurst();

    setTimeout(() => {
      document.body.classList.remove("arg5-failed");
      resetArg5Run(false);
    }, 2300);
  }

  function completeArg5Routing() {
    stopArg5Timers();

    state.arg5Started = false;
    state.arg5Complete = true;
    localStorage.setItem("akwaos.arg5Complete", "1");

    state.arg5Trace = Math.max(0, state.arg5Trace - 12);
    updateArg5UI();
    updateArg5Availability();

    $("#arg5-routing")?.classList.add("arg5-routing--complete");

    arg5AppendEvent("SEC-C ROUTE COMPLETE.");
    arg5AppendEvent("SECURITY IDENTITY CHECK...");
    arg5Adrian("Маршрут открыт. Смотри, куда он действительно вёл.");

    makeTone(420, 0.12, 0.02, "sine");
    setTimeout(() => makeTone(620, 0.13, 0.018, "sine"), 130);
    setTimeout(() => makeTone(840, 0.17, 0.016, "sine"), 270);

    setTimeout(() => {
      $("#arg5-result")?.classList.remove("is-hidden");
    }, 900);

    appendSystemEvent("[--:--] SEC-C night route restored / route owner NULL");
  }

  function startArg5Routing() {
    if (!(state.arg4ResultMailRead || state.arg5Complete)) {
      errorTone();
      return;
    }

    const overlay = $("#arg5-routing");
    if (!overlay) return;

    overlay.classList.remove("is-hidden");
    document.body.classList.add("arg5-running");

    if (state.arg5Complete) {
      overlay.classList.add("arg5-routing--complete");
      $("#arg5-result")?.classList.remove("is-hidden");
      updateArg5UI();
      return;
    }

    resetArg5Run(false);
  }

  function closeArg5Routing() {
    stopArg5Timers();
    state.arg5Started = false;

    $("#arg5-routing")?.classList.add("is-hidden");
    document.body.classList.remove("arg5-running", "arg5-failed");
  }

  function setupArg5Routing() {
    $$(".arg5-node").forEach(node => {
      node.addEventListener("click", () => handleArg5Node(node.dataset.arg5Node));
    });

    $("#arg5-disconnect")?.addEventListener("click", toggleArg5Disconnect);
    $("#arg5-close")?.addEventListener("click", closeArg5Routing);
    $("#arg5-result-close")?.addEventListener("click", closeArg5Routing);

    updateArg5Availability();
    updateArg5UI();
  }

  function setupSecurity() {
    $("#security-map-button")?.addEventListener("click", () => {
      registerInteraction("security:map");

      if (state.arg4ResultMailRead || state.arg5Complete) {
        startArg5Routing();
        return;
      }

      errorTone();
      toast("SEC-MAP: clearance 4 required. Request written to audit cache.");
      appendSystemEvent("[--:--] denied SEC-MAP request by AQ-S17-441");
    });
  }

  function updateMailCount() {
    const count = $$(".mail-row").length;
    const label = $("#mail-count");
    if (label) label.textContent = `${count} MESSAGES`;
  }

  function showMailNotification(title, text) {
    const box = $("#mail-notification");
    const titleNode = $("#mail-notification-title");
    const textNode = $("#mail-notification-text");
    if (!box) return;

    if (box.parentElement !== document.body) {
      document.body.appendChild(box);
    }

    if (titleNode) titleNode.textContent = title;
    if (textNode) textNode.textContent = text;

    box.classList.remove("is-hidden");
    box.classList.remove("mail-notification--hide");
    void box.offsetWidth;
    box.classList.add("mail-notification--show");

    makeTone(440, 0.08, 0.018, "sine");
    setTimeout(() => makeTone(660, 0.10, 0.016, "sine"), 100);

    if (state.mailNotificationTimer) {
      clearTimeout(state.mailNotificationTimer);
    }

    state.mailNotificationTimer = setTimeout(() => {
      box.classList.add("mail-notification--hide");
      setTimeout(() => box.classList.add("is-hidden"), 360);
    }, 12000);
  }

  function setupMailNotification() {
    const box = $("#mail-notification");

    // Keep notifications outside desktop/window stacking contexts.
    // This guarantees that incoming mail is visible over every AKWAOS window.
    if (box && box.parentElement !== document.body) {
      document.body.appendChild(box);
    }

    box?.addEventListener("click", () => {
      if (state.mailNotificationTimer) {
        clearTimeout(state.mailNotificationTimer);
        state.mailNotificationTimer = null;
      }

      box?.classList.add("mail-notification--hide");
      setTimeout(() => box?.classList.add("is-hidden"), 280);

      openWindow("mail");
    });
  }

  function updateAdrianMailAttention() {
    const unreadIntro = state.arg3DefenseComplete && !state.adrianMailIntroRead;
    const unreadLink = state.adrianMailBridgeReady && !state.adrianMailLinkRead;

    document.body.classList.toggle("adrian-mail-unread", unreadIntro || unreadLink);
    document.body.classList.toggle(
      "adrian-mail-awaiting-file",
      state.arg3DefenseComplete && !state.adrianMailBridgeReady
    );
    document.body.classList.toggle("adrian-mail-linked", state.adrianMailBridgeReady);
  }

  function bindAdrianMailRow(row, fileKey, stateKey, storageKey) {
    row.addEventListener("click", () => {
      openFile(fileKey);

      const flag = row.querySelector(".mail-row__flag");
      if (flag) flag.textContent = "○";

      state[stateKey] = true;
      localStorage.setItem(storageKey, "1");
      updateAdrianMailAttention();

      if (fileKey === "mail_adrian_linked") {
        document.body.classList.add("arg4-recycle-ready");
      }
    });
  }

  function ensureAdrianMailRows() {
    if (!state.arg3DefenseComplete) return;
    const list = $("#mail-list");
    if (!list) return;

    if (!$("#mail-adrian-intro")) {
      const row = document.createElement("button");
      row.id = "mail-adrian-intro";
      row.className = "mail-row mail-row--adrian";
      row.type = "button";
      row.dataset.file = "mail_adrian_blocked";
      row.innerHTML = `
        <span class="mail-row__flag">${state.adrianMailIntroRead ? "○" : "●"}</span>
        <span><b>A.LAMO</b><small>[BLOCKED] Нужен локальный канал</small></span>
        <time>--:--</time>
      `;
      bindAdrianMailRow(row, "mail_adrian_blocked", "adrianMailIntroRead", "akwaos.adrianMailIntroRead");
      list.appendChild(row);
    }

    if (state.adrianMailBridgeReady && !$("#mail-adrian-linked")) {
      const row = document.createElement("button");
      row.id = "mail-adrian-linked";
      row.className = "mail-row mail-row--adrian mail-row--adrian-linked";
      row.type = "button";
      row.dataset.file = "mail_adrian_linked";
      row.innerHTML = `
        <span class="mail-row__flag">${state.adrianMailLinkRead ? "○" : "●"}</span>
        <span><b>A.LAMO</b><small>Привет. Меня зовут Адриан Ламо...</small></span>
        <time>--:--</time>
      `;
      bindAdrianMailRow(row, "mail_adrian_linked", "adrianMailLinkRead", "akwaos.adrianMailLinkRead");
      list.appendChild(row);
    }

    updateMailCount();
    updateAdrianMailAttention();
  }

  function ensureAlamoRequestRow() {
    if (!state.adrianMailBridgeReady) return;
    const browser = $("#window-files .file-browser");
    if (!browser || $("#alamo-request-row")) return;

    const row = document.createElement("button");
    row.id = "alamo-request-row";
    row.className = "file-row file-row--generated file-row--mail-relay";
    row.type = "button";
    row.dataset.file = "alamo_request";
    row.innerHTML = `
      <span class="file-row__icon">▤</span>
      <span>ALAMO.REQ</span>
      <small>1 KB</small>
    `;
    row.addEventListener("click", () => openFile("alamo_request"));
    browser.appendChild(row);
  }

  function revealAdrianMailAfterArg3() {
    if (!state.arg3DefenseComplete) return;

    setTimeout(() => {
      ensureAdrianMailRows();
      showMailNotification("НОВОЕ СООБЩЕНИЕ", "FROM: A.LAMO // [BLOCKED]");
    }, 1700);
  }

  function updateArg4Visuals() {
    const shadow = $("#recycle-shadow");
    const restored = $("#recycle-restored");
    const status = $("#recycle-status");

    if (state.arg4RecycleOpened) {
      shadow?.classList.remove("is-hidden");
      if (status) status.textContent = state.arg4Recovered ? "PARTIAL RESTORE" : "EMPTY // SHADOW FOUND";
      document.body.classList.add("arg4-active");
    }

    if (state.arg4Recovered) {
      restored?.classList.remove("is-hidden");
      document.body.classList.add("arg4-recovered");
    }

    if (state.arg4ResultMailRead) {
      document.body.classList.add("arg4-sec-c-ready");
    }
  }

  function ensureArg4RecoveredRow() {
    if (!state.arg4Recovered) return;
    const browser = $("#window-files .file-browser");
    if (!browser || $("#arg4-recovered-row")) return;

    const row = document.createElement("button");
    row.id = "arg4-recovered-row";
    row.className = "file-row file-row--generated file-row--arg4";
    row.type = "button";
    row.dataset.file = "arg4_recovered";
    row.innerHTML = `
      <span class="file-row__icon">▤</span>
      <span>R14_A17.REC</span>
      <small>PARTIAL</small>
    `;
    row.addEventListener("click", () => {
      openFile("arg4_recovered");
      ensureArg4MailRows();
      if (!state.arg4ResultMailRead) {
        setTimeout(() => showMailNotification("НОВОЕ СООБЩЕНИЕ", "FROM: A.LAMO // R14"), 650);
      }
    });
    browser.appendChild(row);
  }

  function bindArg4MailRow(row, fileKey, stateKey, storageKey) {
    row.addEventListener("click", () => {
      openFile(fileKey);
      const flag = row.querySelector(".mail-row__flag");
      if (flag) flag.textContent = "○";

      state[stateKey] = true;
      localStorage.setItem(storageKey, "1");

      if (fileKey === "mail_adrian_arg4_result") {
        document.body.classList.add("arg4-sec-c-ready");
        updateArg5Availability();

        setTimeout(() => {
          toast("SEC-C ROUTING MATRIX AVAILABLE.");
          makeTone(380, 0.08, 0.015, "square");
        }, 450);
      }

      updateArg4Visuals();
      updateMailCount();
    });
  }

  function ensureArg4MailRows() {
    if (!state.adrianMailLinkRead) return;
    const list = $("#mail-list");
    if (!list) return;

    if (state.arg4RecycleOpened && !$("#mail-adrian-recycle-hint")) {
      const row = document.createElement("button");
      row.id = "mail-adrian-recycle-hint";
      row.className = "mail-row mail-row--adrian";
      row.type = "button";
      row.dataset.file = "mail_adrian_recycle_hint";
      row.innerHTML = `
        <span class="mail-row__flag">${state.arg4HintMailRead ? "○" : "●"}</span>
        <span><b>A.LAMO</b><small>RECYCLE / SHADOW INDEX</small></span>
        <time>--:--</time>
      `;
      bindArg4MailRow(row, "mail_adrian_recycle_hint", "arg4HintMailRead", "akwaos.arg4HintMailRead");
      list.appendChild(row);
    }

    if (state.arg4Recovered && !$("#mail-adrian-arg4-result")) {
      const row = document.createElement("button");
      row.id = "mail-adrian-arg4-result";
      row.className = "mail-row mail-row--adrian mail-row--adrian-linked";
      row.type = "button";
      row.dataset.file = "mail_adrian_arg4_result";
      row.innerHTML = `
        <span class="mail-row__flag">${state.arg4ResultMailRead ? "○" : "●"}</span>
        <span><b>A.LAMO</b><small>R14 / «Это был не я»</small></span>
        <time>--:--</time>
      `;
      bindArg4MailRow(row, "mail_adrian_arg4_result", "arg4ResultMailRead", "akwaos.arg4ResultMailRead");
      list.appendChild(row);
    }

    updateMailCount();
  }

  function triggerArg4Recycle() {
    if (!state.adrianMailLinkRead || state.arg4RecycleOpened) return;

    state.arg4RecycleOpened = true;
    localStorage.setItem("akwaos.arg4RecycleOpened", "1");

    updateArg4Visuals();
    ensureArg4MailRows();

    setTimeout(() => {
      showMailNotification("НОВОЕ СООБЩЕНИЕ", "FROM: A.LAMO // RECYCLE");
    }, 900);
  }

  function updateArg7MailAvailability() {
    const ready = state.arg6AdrianDefenseComplete;
    $("#arg7-compose-button")?.classList.toggle("is-hidden", !ready);

    if (ready) {
      ensureArg7DynamicRows();
    }
  }

  function openArg7Composer() {
    if (!state.arg6AdrianDefenseComplete) return;

    const composer = $("#arg7-composer");
    const text = $("#arg7-compose-text");
    const status = $("#arg7-compose-status");

    composer?.classList.remove("is-hidden");
    if (status) status.textContent = "READY";

    setTimeout(() => text?.focus(), 50);
    clickTone();
  }

  function closeArg7Composer() {
    $("#arg7-composer")?.classList.add("is-hidden");
    clickTone();
  }

  function ensureArg7ReplyRow() {
    const list = $("#mail-list");
    if (!list) return;

    let row = $("#mail-arg7-stock-reply");

    if (!row) {
      row = document.createElement("button");
      row.id = "mail-arg7-stock-reply";
      row.className = "mail-row mail-row--adrian arg7-mail-row--reply";
      row.type = "button";
      row.dataset.file = "mail_arg7_stock_reply";
      row.innerHTML = `
        <span class="mail-row__flag">●</span>
        <span><b>A.LAMO</b><small>Меня зовут Адриан Ламо.</small></span>
        <time>--:--</time>
      `;

      row.addEventListener("click", () => {
        openFile("mail_arg7_stock_reply");
        const flag = row.querySelector(".mail-row__flag");
        if (flag) flag.textContent = "○";
      });

      list.appendChild(row);
    } else {
      const flag = row.querySelector(".mail-row__flag");
      if (flag) flag.textContent = "●";
      row.classList.add("arg7-mail-row--repeat");
      setTimeout(() => row.classList.remove("arg7-mail-row--repeat"), 1100);
    }

    updateMailCount();
  }

  function ensureArg7SummaryRow() {
    if (!state.arg7SummaryRevealed) return;

    const list = $("#mail-list");
    if (!list || $("#mail-arg7-summary")) return;

    const row = document.createElement("button");
    row.id = "mail-arg7-summary";
    row.className = "mail-row arg7-mail-row--system";
    row.type = "button";
    row.dataset.file = "mail_arg7_search_summary";
    row.innerHTML = `
      <span class="mail-row__flag">●</span>
      <span><b>SYSTEM</b><small>SESSION QUERY SUMMARY / ASTERI DANTE</small></span>
      <time>--:--</time>
    `;

    row.addEventListener("click", () => {
      openFile("mail_arg7_search_summary");
      startArg7RevealAudio();

      const flag = row.querySelector(".mail-row__flag");
      if (flag) flag.textContent = "○";

      if (!state.arg7FinalSent && !state.arg7CinematicStarted) {
        scheduleArg7Cinematic(() => {
          startArg7FinaleCinematic();
        }, 1900);
      }
    });

    list.appendChild(row);
    updateMailCount();
  }

  function startArg7RecipientGlitch() {
    stopArg7RecipientGlitch();

    const recipient = $("#arg7-final-recipient");
    if (!recipient) return;

    const variants = [
      "▓▉▒░//██▓?",
      "▒▓█░//?▓██",
      "██▒▓//░?▉▒",
      "▓░██//▒▒▉?",
      "▉▒▓█//░░▓█"
    ];

    let index = 0;
    state.arg7RecipientGlitchTimer = setInterval(() => {
      if (!document.body.contains(recipient)) {
        stopArg7RecipientGlitch();
        return;
      }

      recipient.textContent = variants[index % variants.length];
      index += 1;
    }, 230);
  }

  function stopArg7RecipientGlitch() {
    if (state.arg7RecipientGlitchTimer) {
      clearInterval(state.arg7RecipientGlitchTimer);
      state.arg7RecipientGlitchTimer = null;
    }
  }

  function stopArg7RevealAudioFade() {
    if (state.arg7RevealAudioFadeTimer) {
      clearInterval(state.arg7RevealAudioFadeTimer);
      state.arg7RevealAudioFadeTimer = null;
    }
  }

  function startArg7RevealAudio() {
    stopArg7RevealAudio();

    const audio = new Audio("./assets/audio/arg3-hack-theme.mp3");
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.06;

    state.arg7RevealAudio = audio;

    audio.play()
      .then(() => {
        stopArg7RevealAudioFade();

        const started = performance.now();
        const from = 0.06;
        const to = 0.34;
        const duration = 1800;

        state.arg7RevealAudioFadeTimer = setInterval(() => {
          if (!state.arg7RevealAudio) {
            stopArg7RevealAudioFade();
            return;
          }

          const t = Math.min(1, (performance.now() - started) / duration);
          const eased = t * t * (3 - 2 * t);

          audio.volume = from + (to - from) * eased;

          if (t >= 1) {
            stopArg7RevealAudioFade();
          }
        }, 60);
      })
      .catch(() => {
        // The click on SYSTEM normally satisfies browser audio policy.
      });
  }

  function stopArg7RevealAudio() {
    stopArg7RevealAudioFade();

    const audio = state.arg7RevealAudio;
    if (!audio) return;

    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (_) {}

    state.arg7RevealAudio = null;
  }

  function scheduleArg7Cinematic(fn, ms) {
    const id = setTimeout(fn, ms);
    state.arg7CinematicTimerIds.push(id);
    return id;
  }

  function clearArg7CinematicTimers() {
    state.arg7CinematicTimerIds.forEach(id => clearTimeout(id));
    state.arg7CinematicTimerIds = [];

    if (state.arg7ShutdownTimer) {
      clearInterval(state.arg7ShutdownTimer);
      state.arg7ShutdownTimer = null;
    }
  }

  function showArg7CinematicLine(text) {
    const node = $("#arg7-cinematic-message-text");
    if (!node) return;

    node.classList.remove("is-showing");
    node.textContent = text;
    void node.offsetWidth;
    node.classList.add("is-showing");

    makeTone(420, 0.045, 0.01, "sine");
  }

  function moveArg7FakeCursorTo(target, duration = 900) {
    return new Promise(resolve => {
      const cursor = $("#arg7-fake-cursor");
      if (!cursor || !target) {
        resolve();
        return;
      }

      const rect = target.getBoundingClientRect();
      const x = rect.left + rect.width * 0.52;
      const y = rect.top + rect.height * 0.52;

      cursor.style.setProperty("--arg7-cursor-duration", `${duration}ms`);
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;

      scheduleArg7Cinematic(resolve, duration + 80);
    });
  }

  function clickArg7FakeCursor() {
    const cursor = $("#arg7-fake-cursor");
    if (!cursor) return;

    cursor.classList.remove("is-clicking");
    void cursor.offsetWidth;
    cursor.classList.add("is-clicking");
    clickTone();

    scheduleArg7Cinematic(() => {
      cursor.classList.remove("is-clicking");
    }, 280);
  }

  function typeArg7Text(node, text, speed = 34) {
    return new Promise(resolve => {
      if (!node) {
        resolve();
        return;
      }

      node.value = "";
      let index = 0;

      const step = () => {
        if (!state.arg7CinematicStarted) {
          resolve();
          return;
        }

        node.value += text[index] || "";
        index += 1;

        if (index % 3 === 0) {
          makeTone(175 + (index % 7) * 12, 0.018, 0.004, "square");
        }

        if (index >= text.length) {
          resolve();
          return;
        }

        const progress = index / Math.max(1, text.length);
        const progressiveDelay = speed + progress * 58 + Math.random() * 18;
        scheduleArg7Cinematic(step, progressiveDelay);
      };

      step();
    });
  }

  function typeArg7HtmlText(node, text, globalStart, globalTotal) {
    return new Promise(resolve => {
      if (!node) {
        resolve(globalStart);
        return;
      }

      let localIndex = 0;
      let globalIndex = globalStart;

      const step = () => {
        if (!state.arg7CinematicStarted) {
          resolve(globalIndex);
          return;
        }

        const char = text[localIndex] || "";
        node.append(document.createTextNode(char));

        localIndex += 1;
        globalIndex += 1;

        if (globalIndex % 3 === 0) {
          makeTone(178 + (globalIndex % 8) * 11, 0.016, 0.0035, "square");
        }

        if (localIndex >= text.length) {
          resolve(globalIndex);
          return;
        }

        // The further the letter is in the message, the slower it appears.
        const progress = globalIndex / Math.max(1, globalTotal);
        const delay = 24 + progress * 82 + Math.random() * 18;
        scheduleArg7Cinematic(step, delay);
      };

      step();
    });
  }

  function typeArg7FlynName(node) {
    return new Promise(resolve => {
      if (!node) {
        resolve();
        return;
      }

      const name = "Флин Эллада Данте";
      const glitchPool = ["▓", "▒", "░", "?", "█", "▉"];
      let index = 0;

      node.textContent = "";
      node.classList.add("is-typing");

      const step = () => {
        if (!state.arg7CinematicStarted) {
          resolve();
          return;
        }

        if (index >= name.length) {
          node.classList.remove("is-typing");
          node.classList.add("is-complete");
          resolve();
          return;
        }

        const targetChar = name[index];

        if (targetChar === " ") {
          node.append(document.createTextNode(" "));
          index += 1;
          scheduleArg7Cinematic(step, 170);
          return;
        }

        const charNode = document.createElement("span");
        charNode.className = "arg7-flyn-char is-glitching";
        charNode.textContent = glitchPool[Math.floor(Math.random() * glitchPool.length)];
        node.appendChild(charNode);

        makeTone(250 + (index % 5) * 27, 0.025, 0.004, "square");

        scheduleArg7Cinematic(() => {
          charNode.textContent = targetChar;
          charNode.classList.remove("is-glitching");
          charNode.classList.add("is-set");

          index += 1;
          const nextDelay = 160 + index * 5 + Math.random() * 95;
          scheduleArg7Cinematic(step, nextDelay);
        }, 90 + Math.random() * 80);
      };

      step();
    });
  }

  async function typeArg7FinalMessage(node) {
    if (!node) return;

    node.innerHTML = "";

    const body1 = "Карта внутренних секторов Аквы — внутри пакета.";
    const body2 = "Окно пересменки охраны отмечено отдельно.";
    const signaturePrefix = "Пусть восстание пройдёт по плану. - ";
    const total = body1.length + body2.length + signaturePrefix.length;

    let globalIndex = 0;

    const p1 = document.createElement("p");
    const p2 = document.createElement("p");
    const signature = document.createElement("p");
    signature.className = "arg7-cinematic-signature";

    node.appendChild(p1);
    node.appendChild(p2);
    node.appendChild(signature);

    globalIndex = await typeArg7HtmlText(p1, body1, globalIndex, total);
    await new Promise(resolve => scheduleArg7Cinematic(resolve, 420));

    globalIndex = await typeArg7HtmlText(p2, body2, globalIndex, total);
    await new Promise(resolve => scheduleArg7Cinematic(resolve, 720));

    globalIndex = await typeArg7HtmlText(signature, signaturePrefix, globalIndex, total);

    const flyn = document.createElement("span");
    flyn.className = "arg7-flyn-name";
    signature.appendChild(flyn);

    await typeArg7FlynName(flyn);
  }

  function typeArg7Recipient(node, text, speed = 90) {
    return new Promise(resolve => {
      if (!node) {
        resolve();
        return;
      }

      node.textContent = "";
      let index = 0;

      const step = () => {
        if (!state.arg7CinematicStarted) {
          resolve();
          return;
        }

        node.textContent += text[index] || "";
        index += 1;
        makeTone(250 + (index % 4) * 34, 0.022, 0.005, "square");

        if (index >= text.length) {
          resolve();
          return;
        }

        scheduleArg7Cinematic(step, speed + Math.random() * 35);
      };

      step();
    });
  }

  function closeViewerForArg7Cinematic() {
    const viewer = $("#file-viewer");
    if (!viewer) return;

    viewer.classList.add("is-hidden");
    state.opened.delete("viewer");
    syncTaskbar();
  }

  function openArg7FinalComposerCinematic() {
    const composer = $("#arg7-composer");
    const recipient = $("#arg7-compose-recipient");
    const text = $("#arg7-compose-text");
    const cinematicBody = $("#arg7-cinematic-compose-body");
    const status = $("#arg7-compose-status");
    const send = $("#arg7-compose-send");

    if (!composer || !recipient || !text || !cinematicBody || !status || !send) return false;

    composer.classList.remove("is-hidden");
    composer.classList.add("arg7-composer--cinematic");

    recipient.textContent = "";
    recipient.classList.add("arg7-compose-recipient--corrupt");

    text.value = "";
    text.readOnly = true;
    text.classList.add("is-hidden");

    cinematicBody.innerHTML = "";
    cinematicBody.classList.remove("is-hidden");

    status.textContent = "OUTBOUND CACHE // MANUAL RECOVERY";
    send.textContent = "SEND";
    send.disabled = false;

    return true;
  }

  async function runArg7MailAutomation() {
    const cursor = $("#arg7-fake-cursor");
    const overlay = $("#arg7-cinematic-overlay");

    overlay?.classList.add("is-hidden");
    cursor?.classList.remove("is-hidden");

    closeViewerForArg7Cinematic();

    const mailIcon = document.querySelector('.desktop-icon[data-open="mail"]');
    await moveArg7FakeCursorTo(mailIcon, 1100);
    clickArg7FakeCursor();
    await new Promise(resolve => scheduleArg7Cinematic(resolve, 260));

    openWindow("mail");

    await new Promise(resolve => scheduleArg7Cinematic(resolve, 650));

    const composeButton = $("#arg7-compose-button");
    composeButton?.classList.remove("is-hidden");

    await moveArg7FakeCursorTo(composeButton, 850);
    clickArg7FakeCursor();
    await new Promise(resolve => scheduleArg7Cinematic(resolve, 260));

    if (!openArg7FinalComposerCinematic()) return;

    await new Promise(resolve => scheduleArg7Cinematic(resolve, 650));

    const recipient = $("#arg7-compose-recipient");
    const body = $("#arg7-cinematic-compose-body");

    await moveArg7FakeCursorTo(recipient, 700);
    await typeArg7Recipient(recipient, "▓▉▒░██▓?▒▉▓█░", 92);

    await new Promise(resolve => scheduleArg7Cinematic(resolve, 420));

    await moveArg7FakeCursorTo(body, 650);
    await typeArg7FinalMessage(body);

    await new Promise(resolve => scheduleArg7Cinematic(resolve, 1000));

    const send = $("#arg7-compose-send");
    await moveArg7FakeCursorTo(send, 820);
    clickArg7FakeCursor();

    await new Promise(resolve => scheduleArg7Cinematic(resolve, 260));
    sendArg7FinalCinematicMail();
  }

  function startArg7FinaleAudio() {
    stopArg7RevealAudio();
    stopArg7FinaleAudio();

    const audio = new Audio("./assets/audio/arg7-finale.mp3");
    audio.loop = true;
    audio.volume = 0.58;
    audio.preload = "auto";

    state.arg7FinaleAudio = audio;

    try {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch (_) {}
  }

  function stopArg7FinaleAudio() {
    const audio = state.arg7FinaleAudio;
    if (!audio) return;

    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (_) {}

    state.arg7FinaleAudio = null;
  }

  function sendArg7FinalCinematicMail() {
    if (state.arg7FinalSent) return;

    const button = $("#arg7-compose-send");
    const status = $("#arg7-compose-status");

    if (button) {
      button.disabled = true;
      button.textContent = "SENDING...";
    }

    if (status) status.textContent = "OUTBOUND ROUTE NEGOTIATION...";

    makeTone(310, 0.08, 0.015, "square");

    scheduleArg7Cinematic(() => {
      if (status) status.textContent = "PACKET TRANSFER 63%";
      makeTone(430, 0.08, 0.013, "square");
    }, 520);

    scheduleArg7Cinematic(() => {
      state.arg7FinalSent = true;
      localStorage.setItem("akwaos.arg7FinalSent", "1");

      if (status) status.textContent = "MESSAGE SENT // SESSION END 00:30";
      if (button) button.textContent = "MESSAGE SENT";

      appendSystemEvent("[--:--] outbound package transmitted / destination unresolved");

      makeTone(620, 0.11, 0.016, "sine");
      scheduleArg7Cinematic(() => makeTone(840, 0.15, 0.014, "sine"), 130);

      $("#arg7-fake-cursor")?.classList.add("is-hidden");

      startArg7FinaleAudio();
      beginArg7ShutdownCountdown();
    }, 1300);
  }

  function beginArg7ShutdownCountdown() {
    let seconds = 10;
    const status = $("#arg7-compose-status");

    if (status) {
      status.textContent = `MESSAGE SENT // SESSION END 00:${String(seconds).padStart(2, "0")}`;
    }

    state.arg7ShutdownTimer = setInterval(() => {
      seconds -= 1;

      if (status) {
        status.textContent = `MESSAGE SENT // SESSION END 00:${String(Math.max(0, seconds)).padStart(2, "0")}`;
      }

      if (seconds <= 0) {
        clearInterval(state.arg7ShutdownTimer);
        state.arg7ShutdownTimer = null;
        performArg7CrtShutdown();
      }
    }, 1000);
  }

  function performArg7CrtShutdown() {
    stopArg7FinaleAudio();

    const shutdown = $("#arg7-shutdown-overlay");
    const thankyou = $("#arg7-thankyou");

    document.body.classList.add("arg7-crt-shutting-down");
    shutdown?.classList.remove("is-hidden");

    // Retro monitor power-off click + collapsing raster.
    makeTone(72, 0.11, 0.035, "square");
    scheduleArg7Cinematic(() => makeTone(48, 0.18, 0.02, "sine"), 90);

    scheduleArg7Cinematic(() => {
      document.body.classList.add("arg7-crt-black");
    }, 720);

    scheduleArg7Cinematic(() => {
      thankyou?.classList.add("is-visible");
    }, 3300);
  }

  function startArg7FinaleCinematic() {
    if (state.arg7CinematicStarted || state.arg7FinalSent) return;

    state.arg7CinematicStarted = true;
    document.body.classList.add("arg7-cinematic-active");

    const overlay = $("#arg7-cinematic-overlay");
    const cursor = $("#arg7-fake-cursor");

    overlay?.classList.remove("is-hidden");
    cursor?.classList.add("is-hidden");

    const lines = [
      "Я очень давно ищу способ туда попасть.",
      "Без компьютера это было сделать невозможно.",
      "Я много времени убила на то, чтобы всё это взломать.",
      "Ещё и пришлось делать интерфейс с нуля.",
      "Если всё это происходит, значит я не смогла.",
      "Возможно, я не отметилась тут после восстания.",
      "В любом случае, я подозреваю, что мертва.",
      "Этого бота я написала на случай, если что-то пойдёт не так.",
      "Спасибо за помощь.",
      "Теперь они должны знать, куда идти."
    ];

    let index = 0;

    const nextLine = () => {
      if (!state.arg7CinematicStarted) return;

      if (index >= lines.length) {
        scheduleArg7Cinematic(() => {
          runArg7MailAutomation();
        }, 1200);
        return;
      }

      showArg7CinematicLine(lines[index]);
      index += 1;

      const delay = index >= 8 ? 2300 : 2600;
      scheduleArg7Cinematic(nextLine, delay);
    };

    showArg7CinematicLine(lines[index]);
    index += 1;
    scheduleArg7Cinematic(nextLine, 2600);
  }

  function renderArg7FinalDraft() {
    const viewer = $("#file-viewer");
    const content = $("#viewer-content");
    if (!viewer || !content) return;

    clearCorruptViewer();
    $("#viewer-title").innerHTML = `<span class="window-led"></span> OUTBOX // NIGHT PACKAGE`;

    const sent = state.arg7FinalSent;

    content.innerHTML = `
      <div class="arg7-final-mail">
        <div class="arg7-final-mail__meta">
          <span>FROM:</span><b>A.LAMO / LOCAL CACHE</b>
          <span>TO:</span><b id="arg7-final-recipient" class="arg7-final-recipient">▓▉▒░//██▓?</b>
          <span>SUBJECT:</span><b>AKWA / NIGHT ACCESS PACKAGE</b>
        </div>

        <div class="arg7-final-mail__body">
          <p>Карта внутренних секторов Аквы — внутри пакета.</p>
          <p>Окно пересменки охраны отмечено отдельно.</p>
          <p>Этого должно хватить.</p>
        </div>

        <div class="arg7-final-mail__signature">
          Пусть восстание пройдёт по плану. - Флин Эллада Данте
        </div>

        <div id="arg7-final-send-status" class="arg7-final-send-status">
          ${sent ? "STATUS: SENT" : "STATUS: UNSENT / OUTBOX RECOVERY"}
        </div>

        <button id="arg7-final-send" class="arg7-final-send" type="button" ${sent ? "disabled" : ""}>
          ${sent ? "MESSAGE SENT" : "SEND MESSAGE"}
        </button>
      </div>
    `;

    viewer.classList.remove("is-hidden");
    focusWindow(viewer);
    state.opened.add("viewer");
    syncTaskbar();
    clickTone();

    startArg7RecipientGlitch();

    if (!sent) {
      $("#arg7-final-send")?.addEventListener("click", sendArg7FinalMessage);
    }
  }

  function ensureArg7FinalDraftRow() {
    if (!state.arg7FinalDraftRevealed) return;

    const list = $("#mail-list");
    if (!list || $("#mail-arg7-final-draft")) return;

    const row = document.createElement("button");
    row.id = "mail-arg7-final-draft";
    row.className = "mail-row arg7-mail-row--final";
    row.type = "button";
    row.innerHTML = `
      <span class="mail-row__flag">${state.arg7FinalSent ? "○" : "●"}</span>
      <span><b>OUTBOX RECOVERY</b><small>${state.arg7FinalSent ? "[SENT]" : "[UNSENT]"} AKWA / NIGHT ACCESS PACKAGE</small></span>
      <time>--:--</time>
    `;

    row.addEventListener("click", () => {
      renderArg7FinalDraft();
      const flag = row.querySelector(".mail-row__flag");
      if (flag) flag.textContent = "○";
    });

    list.appendChild(row);
    updateMailCount();
  }

  function ensureArg7DynamicRows() {
    if (!state.arg6AdrianDefenseComplete) return;

    if (state.arg7SendCount > 0) {
      ensureArg7ReplyRow();
    }

    ensureArg7SummaryRow();
  }

  function sendArg7MessageToAdrian() {
    if (!state.arg6AdrianDefenseComplete) return;
    if (state.arg7CinematicStarted) return;

    const text = $("#arg7-compose-text");
    const status = $("#arg7-compose-status");
    const send = $("#arg7-compose-send");
    const value = text?.value.trim() || "";

    if (!value) {
      if (status) status.textContent = "MESSAGE EMPTY";
      errorTone();
      return;
    }

    if (send) send.disabled = true;
    if (status) status.textContent = "SENDING...";

    state.arg7SendCount += 1;
    localStorage.setItem("akwaos.arg7SendCount", String(state.arg7SendCount));

    setTimeout(() => {
      if (status) {
        status.textContent = state.arg7SendCount >= 2
          ? "DELIVERED // IDENTICAL RESPONSE PAYLOAD"
          : "DELIVERED // LOCAL RELAY";
      }

      makeTone(460, 0.07, 0.014, "sine");
      setTimeout(() => makeTone(650, 0.08, 0.012, "sine"), 90);

      ensureArg7ReplyRow();

      setTimeout(() => {
        showMailNotification("НОВОЕ СООБЩЕНИЕ", "A.LAMO: Меня зовут Адриан Ламо.");
      }, 450);

      if (!state.arg7SummaryRevealed) {
        state.arg7SummaryRevealed = true;
        localStorage.setItem("akwaos.arg7SummaryRevealed", "1");

        setTimeout(() => {
          ensureArg7SummaryRow();
          showMailNotification("SYSTEM", "SESSION QUERY SUMMARY RECOVERED");
        }, 1500);
      }

      if (text) text.value = "";
      if (send) send.disabled = false;

      setTimeout(closeArg7Composer, 1100);
    }, 700);
  }

  function sendArg7FinalMessage() {
    if (state.arg7FinalSent) return;

    const button = $("#arg7-final-send");
    const status = $("#arg7-final-send-status");

    if (button) {
      button.disabled = true;
      button.textContent = "SENDING...";
    }

    if (status) status.textContent = "OUTBOUND ROUTE NEGOTIATION...";

    makeTone(310, 0.08, 0.015, "square");

    setTimeout(() => {
      if (status) status.textContent = "PACKET TRANSFER 63%";
      makeTone(430, 0.08, 0.013, "square");
    }, 500);

    setTimeout(() => {
      state.arg7FinalSent = true;
      localStorage.setItem("akwaos.arg7FinalSent", "1");

      stopArg7RecipientGlitch();

      const recipient = $("#arg7-final-recipient");
      if (recipient) recipient.textContent = "▓▓▓▓▓▓▓▓▓";

      if (status) status.textContent = "STATUS: SENT";
      if (button) button.textContent = "MESSAGE SENT";

      const row = $("#mail-arg7-final-draft");
      if (row) {
        const preview = row.querySelector("small");
        if (preview) preview.textContent = "[SENT] AKWA / NIGHT ACCESS PACKAGE";
      }

      appendSystemEvent("[--:--] recovered outbound package transmitted / destination unresolved");

      makeTone(620, 0.11, 0.016, "sine");
      setTimeout(() => makeTone(840, 0.15, 0.014, "sine"), 130);

      setTimeout(() => {
        toast("OUTBOUND MESSAGE SENT.");
      }, 300);
    }, 1250);
  }

  function setupArg7Mail() {
    $("#arg7-compose-button")?.addEventListener("click", openArg7Composer);
    $("#arg7-compose-close")?.addEventListener("click", closeArg7Composer);
    $("#arg7-compose-send")?.addEventListener("click", sendArg7MessageToAdrian);

    $("#arg7-composer")?.addEventListener("pointerdown", event => {
      if (event.target === $("#arg7-composer")) {
        closeArg7Composer();
      }
    });

    updateArg7MailAvailability();
  }

  function setupMail() {
    $$(".mail-row").forEach(row => {
      row.addEventListener("click", () => {
        openFile(row.dataset.file);
        row.querySelector(".mail-row__flag").textContent = "○";
      });
    });
    updateMailCount();
    updateAdrianMailAttention();
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
    setupMailNotification();
    setupNetwork();
    setupMayWondersNo();
    setupArg3DefenseForm();
    setupArg3CopyProtection();
    setupArg5Routing();
    setupArg6();
    setupArg7Mail();
    restoreCorruptionState();
    updateArgStageVisuals();
    ensureBioOverrideProcess();
    ensureIxionRequestRow();
    ensureAlamoRequestRow();
    ensureAdrianMailRows();
    updateArg4Visuals();
    ensureArg4RecoveredRow();
    ensureArg4MailRows();

    if (state.adrianMailLinkRead && !state.arg4RecycleOpened) {
      document.body.classList.add("arg4-recycle-ready");
    }

  }

  init();
})();
