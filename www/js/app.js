/* =========================================================
   MY OFFICE — APPLICATION ENGINE
   Offline-first foundation
   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       STORAGE
    ===================================================== */

    const STORAGE_KEY = "myOfficeData";


    const defaultData = {
        letters: [],
        tasks: [],
        reminders: [],
        matters: [],
        notes: [],
        documents: [],
        contacts: [],
        dailyLog: []
    };


    let officeData = loadData();


    function loadData() {

        try {

            const saved =
                localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return structuredClone(defaultData);
            }

            const parsed =
                JSON.parse(saved);

            return {
                ...defaultData,
                ...parsed
            };

        } catch (error) {

            console.error(
                "Unable to load My Office data:",
                error
            );

            return structuredClone(defaultData);
        }
    }


    function saveData() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(officeData)
            );

        } catch (error) {

            console.error(
                "Unable to save My Office data:",
                error
            );
        }
    }



    /* =====================================================
       HELPERS
    ===================================================== */

    function $(id) {
        return document.getElementById(id);
    }


    function todayISO() {

        const date = new Date();

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    function formatDate(dateString) {

        if (!dateString) {
            return "No date";
        }

        const date =
            new Date(
                `${dateString}T00:00:00`
            );

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString(
            undefined,
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );
    }


    function formatCurrentDate() {

        const date = new Date();

        return date.toLocaleDateString(
            undefined,
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
    }


    function getGreeting() {

        const hour =
            new Date().getHours();

        if (hour < 12) {
            return "Good morning";
        }

        if (hour < 17) {
            return "Good afternoon";
        }

        return "Good evening";
    }


    function generateId(prefix) {

        return (
            prefix +
            "_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 8)
        );
    }



    /* =====================================================
       NAVIGATION
    ===================================================== */

    function showScreen(screenId) {

        document
            .querySelectorAll(".screen")
            .forEach(function (screen) {

                screen.classList.remove(
                    "active"
                );

            });


        const selected =
            $(screenId);

        if (selected) {

            selected.classList.add(
                "active"
            );

        }


        document
            .querySelectorAll(".nav-item")
            .forEach(function (item) {

                item.classList.remove(
                    "active"
                );

                if (
                    item.dataset.screen ===
                    screenId
                ) {

                    item.classList.add(
                        "active"
                    );

                }

            });


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }



    /* =====================================================
       DASHBOARD
    ===================================================== */

    function updateDashboard() {

        const pendingLetters =
            officeData.letters.filter(
                function (letter) {

                    return (
                        letter.status !==
                        "responded"
                    );

                }
            );


        const activeTasks =
            officeData.tasks.filter(
                function (task) {

                    return (
                        task.status !==
                        "completed"
                    );

                }
            );


        const activeMatters =
            officeData.matters.filter(
                function (matter) {

                    return (
                        matter.status !==
                        "completed"
                    );

                }
            );


        const upcomingReminders =
            officeData.reminders.filter(
                function (reminder) {

                    return (
                        !reminder.completed
                    );

                }
            );


        setText(
            "letterCount",
            pendingLetters.length
        );

        setText(
            "taskCount",
            activeTasks.length
        );

        setText(
            "matterCount",
            activeMatters.length
        );

        setText(
            "reminderCount",
            upcomingReminders.length
        );


        const total =
            pendingLetters.length +
            activeTasks.length +
            activeMatters.length +
            upcomingReminders.length;


        setText(
            "totalItems",
            total
        );


        const completedTasks =
            officeData.tasks.filter(
                function (task) {

                    return (
                        task.status ===
                        "completed"
                    );

                }
            ).length;


        const totalTasks =
            officeData.tasks.length;


        const progress =
            totalTasks > 0
                ? Math.round(
                    (
                        completedTasks /
                        totalTasks
                    ) * 100
                )
                : 0;


        const progressBar =
            $("progressBar");

        if (progressBar) {

            progressBar.style.width =
                `${progress}%`;

        }


        renderAttention();
    }


    function setText(id, value) {

        const element = $(id);

        if (element) {
            element.textContent = value;
        }
    }



    /* =====================================================
       ATTENTION LIST
    ===================================================== */

    function renderAttention() {

        const container =
            $("attentionList");

        if (!container) {
            return;
        }


        const today =
            todayISO();


        const urgentLetters =
            officeData.letters
                .filter(function (letter) {

                    if (
                        letter.status ===
                        "responded"
                    ) {
                        return false;
                    }

                    return (
                        letter.responseDue &&
                        letter.responseDue <=
                        today
                    );

                })
                .slice(0, 5);


        const urgentTasks =
            officeData.tasks
                .filter(function (task) {

                    if (
                        task.status ===
                        "completed"
                    ) {
                        return false;
                    }

                    return (
                        task.dueDate &&
                        task.dueDate <=
                        today
                    );

                })
                .slice(0, 5);


        const items = [];


        urgentLetters.forEach(
            function (letter) {

                items.push({

                    type: "letter",

                    title:
                        letter.subject ||
                        "Letter",

                    text:
                        "Response requires attention",

                    date:
                        formatDate(
                            letter.responseDue
                        ),

                    icon: "✉"

                });

            }
        );


        urgentTasks.forEach(
            function (task) {

                items.push({

                    type: "task",

                    title:
                        task.title ||
                        "Task",

                    text:
                        "Task requires attention",

                    date:
                        formatDate(
                            task.dueDate
                        ),

                    icon: "✓"

                });

            }
        );


        if (!items.length) {

            container.innerHTML = `

                <div class="empty-state">

                    <div class="empty-state-icon">
                        ✦
                    </div>

                    <h3>
                        Nothing urgent
                    </h3>

                    <p>
                        Your important office
                        matters will appear here.
                    </p>

                </div>

            `;

            return;
        }


        container.innerHTML =
            items
                .map(function (item) {

                    return `

                        <div
                            class="attention-item"
                            style="
                                display:flex;
                                align-items:center;
                                gap:12px;
                                padding:14px;
                                margin-bottom:8px;
                                border:1px solid #e8ecf3;
                                border-radius:16px;
                                background:#fff;
                            ">

                            <div
                                style="
                                    width:38px;
                                    height:38px;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    border-radius:12px;
                                    background:#eef2ff;
                                    color:#4f46e5;
                                    flex-shrink:0;
                                ">

                                ${item.icon}

                            </div>

                            <div
                                style="
                                    flex:1;
                                    min-width:0;
                                ">

                                <strong
                                    style="
                                        display:block;
                                        font-size:12px;
                                    ">

                                    ${escapeHtml(
                                        item.title
                                    )}

                                </strong>

                                <span
                                    style="
                                        display:block;
                                        margin-top:3px;
                                        color:#667085;
                                        font-size:10px;
                                    ">

                                    ${item.text}

                                </span>

                            </div>

                            <small
                                style="
                                    color:#dc2626;
                                    font-size:10px;
                                    font-weight:700;
                                ">

                                ${item.date}

                            </small>

                        </div>

                    `;

                })
                .join("");
    }



    /* =====================================================
       LETTER STATISTICS
    ===================================================== */

    function updateLetterStatistics() {

        const today =
            todayISO();


        const pending =
            officeData.letters.filter(
                function (letter) {

                    return (
                        letter.status !==
                        "responded"
                    );

                }
            );


        const dueToday =
            pending.filter(
                function (letter) {

                    return (
                        letter.responseDue ===
                        today
                    );

                }
            );


        const overdue =
            pending.filter(
                function (letter) {

                    return (
                        letter.responseDue &&
                        letter.responseDue <
                        today
                    );

                }
            );


        setText(
            "pendingLetterTotal",
            pending.length
        );

        setText(
            "dueLetterTotal",
            dueToday.length
        );

        setText(
            "overdueLetterTotal",
            overdue.length
        );
    }



    /* =====================================================
       LETTER LIST
    ===================================================== */

    function renderLetters() {

        const container =
            $("lettersList");

        if (!container) {
            return;
        }


        if (!officeData.letters.length) {

            container.innerHTML = `

                <div class="empty-state large">

                    <div
                        class="empty-state-icon letter-empty">
                        ✉
                    </div>

                    <h3>
                        No letters yet
                    </h3>

                    <p>
                        Received correspondence,
                        response deadlines and
                        scanned copies will appear here.
                    </p>

                    <button
                        class="primary-button"
                        data-action="letter">

                        + Add first letter

                    </button>

                </div>

            `;

            return;
        }


        container.innerHTML =
            officeData.letters
                .slice()
                .reverse()
                .map(function (letter) {

                    const status =
                        getLetterStatus(
                            letter
                        );


                    return `

                        <div
                            class="letter-card"
                            style="
                                margin-bottom:11px;
                                padding:16px;
                                border:1px solid #e8ecf3;
                                border-radius:18px;
                                background:#fff;
                                box-shadow:0 3px 12px rgba(16,24,40,.04);
                            ">

                            <div
                                style="
                                    display:flex;
                                    justify-content:space-between;
                                    gap:10px;
                                ">

                                <div
                                    style="
                                        min-width:0;
                                    ">

                                    <span
                                        style="
                                            display:block;
                                            color:#667085;
                                            font-size:9px;
                                            font-weight:700;
                                            letter-spacing:.6px;
                                        ">

                                        ${
                                            escapeHtml(
                                                letter.reference ||
                                                "NO REFERENCE"
                                            )
                                        }

                                    </span>

                                    <strong
                                        style="
                                            display:block;
                                            margin-top:5px;
                                            font-size:14px;
                                        ">

                                        ${
                                            escapeHtml(
                                                letter.subject ||
                                                "Untitled letter"
                                            )
                                        }

                                    </strong>

                                </div>

                                <span
                                    style="
                                        height:max-content;
                                        padding:5px 8px;
                                        border-radius:8px;
                                        background:${status.background};
                                        color:${status.color};
                                        font-size:9px;
                                        font-weight:800;
                                        white-space:nowrap;
                                    ">

                                    ${status.label}

                                </span>

                            </div>


                            <div
                                style="
                                    display:grid;
                                    grid-template-columns:1fr 1fr;
                                    gap:9px;
                                    margin-top:14px;
                                ">

                                <div>

                                    <small
                                        style="
                                            display:block;
                                            color:#98a2b3;
                                            font-size:9px;
                                        ">

                                        Received

                                    </small>

                                    <span
                                        style="
                                            display:block;
                                            margin-top:3px;
                                            font-size:11px;
                                            font-weight:700;
                                        ">

                                        ${
                                            formatDate(
                                                letter.receivedDate
                                            )
                                        }

                                    </span>

                                </div>


                                <div>

                                    <small
                                        style="
                                            display:block;
                                            color:#98a2b3;
                                            font-size:9px;
                                        ">

                                        Response due

                                    </small>

                                    <span
                                        style="
                                            display:block;
                                            margin-top:3px;
                                            font-size:11px;
                                            font-weight:700;
                                        ">

                                        ${
                                            formatDate(
                                                letter.responseDue
                                            )
                                        }

                                    </span>

                                </div>

                            </div>


                            <div
                                style="
                                    display:flex;
                                    gap:7px;
                                    margin-top:14px;
                                ">

                                ${
                                    letter.receivedCopy
                                        ? `<span
                                            style="
                                                padding:5px 8px;
                                                border-radius:8px;
                                                background:#ecfeff;
                                                color:#0891b2;
                                                font-size:9px;
                                                font-weight:700;
                                            ">
                                            📎 Received copy
                                           </span>`
                                        : ""
                                }


                                ${
                                    letter.responseCopy
                                        ? `<span
                                            style="
                                                padding:5px 8px;
                                                border-radius:8px;
                                                background:#ecfdf5;
                                                color:#059669;
                                                font-size:9px;
                                                font-weight:700;
                                            ">
                                            📎 Response copy
                                           </span>`
                                        : ""
                                }

                            </div>

                        </div>

                    `;

                })
                .join("");
    }


    function getLetterStatus(letter) {

        if (
            letter.status ===
            "responded"
        ) {

            return {

                label: "RESPONDED",

                color: "#059669",

                background: "#ecfdf5"

            };

        }


        const today =
            todayISO();


        if (
            letter.responseDue &&
            letter.responseDue <
            today
        ) {

            return {

                label: "OVERDUE",

                color: "#dc2626",

                background: "#fef2f2"

            };

        }


        if (
            letter.responseDue ===
            today
        ) {

            return {

                label: "DUE TODAY",

                color: "#ea580c",

                background: "#fff7ed"

            };

        }


        return {

            label: "PENDING",

            color: "#4f46e5",

            background: "#eef2ff"

        };
    }



    /* =====================================================
       TASKS
    ===================================================== */

    function renderTasks() {

        const container =
            $("tasksList");

        if (!container) {
            return;
        }


        if (!officeData.tasks.length) {

            container.innerHTML = `

                <div class="empty-state large">

                    <div class="empty-state-icon">
                        ✓
                    </div>

                    <h3>
                        No tasks yet
                    </h3>

                    <p>
                        Add your office tasks and
                        keep track of everything
                        that needs to be done.
                    </p>

                    <button
                        class="primary-button"
                        data-action="task">

                        + Add first task

                    </button>

                </div>

            `;

            return;
        }


        container.innerHTML =
            officeData.tasks
                .slice()
                .reverse()
                .map(function (task) {

                    const completed =
                        task.status ===
                        "completed";


                    return `

                        <div
                            style="
                                display:flex;
                                align-items:center;
                                gap:12px;
                                margin-bottom:10px;
                                padding:15px;
                                border:1px solid #e8ecf3;
                                border-radius:17px;
                                background:#fff;
                            ">

                            <button
                                data-complete-task="${task.id}"
                                style="
                                    width:34px;
                                    height:34px;
                                    border-radius:11px;
                                    background:${
                                        completed
                                            ? "#ecfdf5"
                                            : "#eef2ff"
                                    };
                                    color:${
                                        completed
                                            ? "#059669"
                                            : "#4f46e5"
                                    };
                                    font-weight:800;
                                ">

                                ${
                                    completed
                                        ? "✓"
                                        : "○"
                                }

                            </button>


                            <div
                                style="
                                    flex:1;
                                    min-width:0;
                                ">

                                <strong
                                    style="
                                        display:block;
                                        font-size:12px;
                                        ${
                                            completed
                                                ? "text-decoration:line-through;color:#98a2b3;"
                                                : ""
                                        }
                                    ">

                                    ${
                                        escapeHtml(
                                            task.title
                                        )
                                    }

                                </strong>

                                <small
                                    style="
                                        display:block;
                                        margin-top:4px;
                                        color:#667085;
                                        font-size:9px;
                                    ">

                                    ${
                                        task.dueDate
                                            ? "Due " +
                                              formatDate(
                                                  task.dueDate
                                              )
                                            : "No due date"
                                    }

                                </small>

                            </div>

                        </div>

                    `;

                })
                .join("");
    }



    /* =====================================================
       REMINDERS
    ===================================================== */

    function renderReminders() {

        const container =
            $("reminderList");

        if (!container) {
            return;
        }


        const active =
            officeData.reminders.filter(
                function (reminder) {

                    return (
                        !reminder.completed
                    );

                }
            );


        if (!active.length) {

            container.innerHTML = `

                <div class="empty-state">

                    <div class="empty-state-icon">
                        ◷
                    </div>

                    <h3>
                        No reminders
                    </h3>

                    <p>
                        Upcoming reminders
                        will appear here.
                    </p>

                </div>

            `;

            return;
        }


        container.innerHTML =
            active
                .slice()
                .sort(function (a, b) {

                    return (
                        (a.date || "")
                            .localeCompare(
                                b.date || ""
                            )
                    );

                })
                .map(function (reminder) {

                    return `

                        <div
                            style="
                                display:flex;
                                align-items:center;
                                gap:12px;
                                margin-bottom:9px;
                                padding:15px;
                                border:1px solid #e8ecf3;
                                border-radius:17px;
                                background:#fff;
                            ">

                            <div
                                style="
                                    width:38px;
                                    height:38px;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    border-radius:12px;
                                    color:#ea580c;
                                    background:#fff7ed;
                                ">

                                ◷

                            </div>

                            <div
                                style="
                                    flex:1;
                                ">

                                <strong
                                    style="
                                        display:block;
                                        font-size:12px;
                                    ">

                                    ${
                                        escapeHtml(
                                            reminder.title
                                        )
                                    }

                                </strong>

                                <small
                                    style="
                                        display:block;
                                        margin-top:4px;
                                        color:#667085;
                                        font-size:9px;
                                    ">

                                    ${
                                        formatDate(
                                            reminder.date
                                        )
                                    }

                                </small>

                            </div>

                        </div>

                    `;

                })
                .join("");
    }



    /* =====================================================
       QUICK ADD
    ===================================================== */

    function addLetter() {

        const reference =
            prompt(
                "Letter reference number:"
            );

        if (reference === null) {
            return;
        }


        const subject =
            prompt(
                "Letter subject:"
            );

        if (subject === null) {
            return;
        }


        const sender =
            prompt(
                "From whom / department:"
            ) || "";


        const receivedDate =
            prompt(
                "Date received (YYYY-MM-DD):",
                todayISO()
            ) || todayISO();


        const responseRequired =
            confirm(
                "Is a response required?"
            );


        let responseDue = "";


        if (responseRequired) {

            responseDue =
                prompt(
                    "Response due date (YYYY-MM-DD):"
                ) || "";

        }


        let reminderLetterDate = "";


        if (responseRequired) {

            reminderLetterDate =
                prompt(
                    "Reminder letter date (YYYY-MM-DD), if required:"
                ) || "";

        }


        const letter = {

            id:
                generateId("letter"),

            reference:
                reference.trim(),

            subject:
                subject.trim(),

            sender:
                sender.trim(),

            receivedDate:

                receivedDate,

            responseRequired:
                responseRequired,

            responseDue:
                responseDue,

            reminderLetterDate:
                reminderLetterDate,

            status:
                "pending",

            receivedCopy:
                null,

            responseCopy:
                null,

            notes:
                "",

            createdAt:
                new Date().toISOString()

        };


        officeData.letters.push(
            letter
        );


        saveData();

        refreshAll();

        showScreen(
            "lettersScreen"
        );


        alert(
            "Letter added successfully."
        );
    }



    function addTask() {

        const title =
            prompt(
                "Task title:"
            );

        if (
            title === null ||
            !title.trim()
        ) {
            return;
        }


        const dueDate =
            prompt(
                "Due date (YYYY-MM-DD), optional:"
            ) || "";


        officeData.tasks.push({

            id:
                generateId("task"),

            title:
                title.trim(),

            dueDate:
                dueDate,

            status:
                "pending",

            createdAt:
                new Date().toISOString()

        });


        saveData();

        refreshAll();

        showScreen(
            "workScreen"
        );


        alert(
            "Task added successfully."
        );
    }



    function addReminder() {

        const title =
            prompt(
                "Reminder:"
            );

        if (
            title === null ||
            !title.trim()
        ) {
            return;
        }


        const date =
            prompt(
                "Reminder date (YYYY-MM-DD):",
                todayISO()
            ) || todayISO();


        officeData.reminders.push({

            id:
                generateId("reminder"),

            title:
                title.trim(),

            date:
                date,

            completed:
                false,

            createdAt:
                new Date().toISOString()

        });


        saveData();

        refreshAll();

        showScreen(
            "officeScreen"
        );


        alert(
            "Reminder added successfully."
        );
    }



    function addNote() {

        const note =
            prompt(
                "Write your office note:"
            );

        if (
            note === null ||
            !note.trim()
        ) {
            return;
        }


        officeData.notes.push({

            id:
                generateId("note"),

            text:
                note.trim(),

            createdAt:
                new Date().toISOString()

        });


        saveData();


        alert(
            "Note saved successfully."
        );
    }



    /* =====================================================
       TASK COMPLETION
    ===================================================== */

    function toggleTask(taskId) {

        const task =
            officeData.tasks.find(
                function (item) {

                    return (
                        item.id ===
                        taskId
                    );

                }
            );


        if (!task) {
            return;
        }


        task.status =
            task.status === "completed"
                ? "pending"
                : "completed";


        saveData();

        refreshAll();
    }



    /* =====================================================
       EVENT HANDLING
    ===================================================== */

    document.addEventListener(
        "click",
        function (event) {


            const nav =
                event.target.closest(
                    ".nav-item"
                );


            if (nav) {

                const screen =
                    nav.dataset.screen;

                if (screen) {

                    showScreen(
                        screen
                    );

                }

                return;
            }



            const dashboard =
                event.target.closest(
                    ".dashboard-card"
                );


            if (dashboard) {

                const screen =
                    dashboard.dataset.screen;

                if (screen) {

                    showScreen(
                        screen
                    );

                }

                return;
            }



            const action =
                event.target.closest(
                    "[data-action]"
                );


            if (action) {

                const type =
                    action.dataset.action;


                if (type === "letter") {
                    addLetter();
                }

                if (type === "task") {
                    addTask();
                }

                if (type === "reminder") {
                    addReminder();
                }

                if (type === "note") {
                    addNote();
                }

                return;
            }



            const taskButton =
                event.target.closest(
                    "[data-complete-task]"
                );


            if (taskButton) {

                toggleTask(
                    taskButton.dataset
                        .completeTask
                );

            }

        }
    );



    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function refreshAll() {

        updateDashboard();

        updateLetterStatistics();

        renderLetters();

        renderTasks();

        renderReminders();

    }


    function initialize() {

        setText(
            "currentDate",
            formatCurrentDate()
        );


        setText(
            "greeting",
            getGreeting()
        );


        refreshAll();


        console.log(
            "My Office is running in offline mode."
        );

    }



    /* =====================================================
       HTML SAFETY
    ===================================================== */

    function escapeHtml(value) {

        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }



    /* =====================================================
       START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();

    }

})();
