/* =========================================================
   MY OFFICE
   Offline Office Management
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
                return JSON.parse(
                    JSON.stringify(defaultData)
                );
            }

            const parsed =
                JSON.parse(saved);

            return {
                ...defaultData,
                ...parsed
            };

        } catch (error) {

            console.error(
                "My Office data loading error:",
                error
            );

            return JSON.parse(
                JSON.stringify(defaultData)
            );
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
                "My Office data saving error:",
                error
            );

            alert(
                "There was a problem saving this information."
            );
        }
    }



    /* =====================================================
       BASIC HELPERS
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


    function escapeHtml(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }



    /* =====================================================
       NAVIGATION
    ===================================================== */

    function showScreen(screenId) {

        document
            .querySelectorAll(".screen")
            .forEach(function (screen) {

                screen.classList.remove("active");

            });


        const selected =
            $(screenId);

        if (selected) {

            selected.classList.add("active");

        }


        document
            .querySelectorAll(".nav-item")
            .forEach(function (item) {

                item.classList.remove("active");

                if (
                    item.dataset.screen ===
                    screenId
                ) {

                    item.classList.add("active");

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


        const activeReminders =
            officeData.reminders.filter(
                function (reminder) {

                    return !reminder.completed;

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
            activeReminders.length
        );


        const total =
            pendingLetters.length +
            activeTasks.length +
            activeMatters.length +
            activeReminders.length;


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
            totalTasks
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
       ATTENTION
    ===================================================== */

    function renderAttention() {

        const container =
            $("attentionList");


        if (!container) {
            return;
        }


        const today =
            todayISO();


        const items = [];


        officeData.letters
            .filter(function (letter) {

                return (
                    letter.status !==
                    "responded" &&
                    letter.responseDue &&
                    letter.responseDue <= today
                );

            })
            .slice(0, 5)
            .forEach(function (letter) {

                items.push({

                    title:
                        letter.subject ||
                        "Letter",

                    text:
                        "Response requires attention",

                    date:
                        formatDate(
                            letter.responseDue
                        ),

                    icon:
                        "✉"

                });

            });


        officeData.tasks
            .filter(function (task) {

                return (
                    task.status !==
                    "completed" &&
                    task.dueDate &&
                    task.dueDate <= today
                );

            })
            .slice(0, 5)
            .forEach(function (task) {

                items.push({

                    title:
                        task.title ||
                        "Task",

                    text:
                        "Task requires attention",

                    date:
                        formatDate(
                            task.dueDate
                        ),

                    icon:
                        "✓"

                });

            });


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
            items.map(function (item) {

                return `

                    <div
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
                            ">

                            ${item.icon}

                        </div>

                        <div
                            style="
                                flex:1;
                            ">

                            <strong>
                                ${escapeHtml(
                                    item.title
                                )}
                            </strong>

                            <small
                                style="
                                    display:block;
                                    margin-top:3px;
                                    color:#667085;
                                ">

                                ${item.text}

                            </small>

                        </div>

                        <small
                            style="
                                color:#dc2626;
                                font-weight:700;
                            ">

                            ${item.date}

                        </small>

                    </div>

                `;

            }).join("");
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
       LETTER STATUS
    ===================================================== */

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
                                margin-bottom:12px;
                                padding:16px;
                                border:1px solid #e8ecf3;
                                border-radius:18px;
                                background:#fff;
                                box-shadow:
                                    0 3px 12px
                                    rgba(16,24,40,.04);
                            ">

                            <div
                                style="
                                    display:flex;
                                    justify-content:
                                        space-between;
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

                                    <small
                                        style="
                                            display:block;
                                            margin-top:4px;
                                            color:#667085;
                                        ">

                                        ${
                                            escapeHtml(
                                                letter.sender ||
                                                ""
                                            )
                                        }

                                    </small>

                                </div>


                                <span
                                    style="
                                        height:max-content;
                                        padding:5px 8px;
                                        border-radius:8px;
                                        background:
                                            ${status.background};
                                        color:
                                            ${status.color};
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
                                    grid-template-columns:
                                        1fr 1fr;
                                    gap:10px;
                                    margin-top:14px;
                                ">

                                <div>

                                    <small
                                        style="
                                            display:block;
                                            color:#98a2b3;
                                        ">

                                        Received

                                    </small>

                                    <strong
                                        style="
                                            display:block;
                                            margin-top:3px;
                                            font-size:11px;
                                        ">

                                        ${
                                            formatDate(
                                                letter.receivedDate
                                            )
                                        }

                                    </strong>

                                </div>


                                <div>

                                    <small
                                        style="
                                            display:block;
                                            color:#98a2b3;
                                        ">

                                        Response due

                                    </small>

                                    <strong
                                        style="
                                            display:block;
                                            margin-top:3px;
                                            font-size:11px;
                                        ">

                                        ${
                                            formatDate(
                                                letter.responseDue
                                            )
                                        }

                                    </strong>

                                </div>

                            </div>


                            <!-- ATTACHMENT AREA -->

                            <div
                                style="
                                    margin-top:16px;
                                    padding-top:14px;
                                    border-top:
                                        1px solid #eef0f4;
                                ">

                                <div
                                    style="
                                        font-size:10px;
                                        font-weight:800;
                                        margin-bottom:9px;
                                        color:#344054;
                                    ">

                                    LETTER DOCUMENTS

                                </div>


                                <div
                                    style="
                                        display:grid;
                                        grid-template-columns:
                                            1fr 1fr;
                                        gap:7px;
                                    ">

                                    <button
                                        class="attachment-button"
                                        data-camera-letter="${
                                            letter.id
                                        }">

                                        📷
                                        Received

                                    </button>


                                    <button
                                        class="attachment-button"
                                        data-file-letter="${
                                            letter.id
                                        }">

                                        📄
                                        Received PDF

                                    </button>


                                    <button
                                        class="attachment-button"
                                        data-camera-response="${
                                            letter.id
                                        }">

                                        📷
                                        Response

                                    </button>


                                    <button
                                        class="attachment-button"
                                        data-file-response="${
                                            letter.id
                                        }">

                                        📄
                                        Response PDF

                                    </button>

                                </div>


                                <div
                                    style="
                                        display:flex;
                                        flex-wrap:wrap;
                                        gap:6px;
                                        margin-top:9px;
                                    ">

                                    ${
                                        letter.receivedCopy
                                            ? `
                                            <span
                                                style="
                                                    padding:5px 8px;
                                                    border-radius:8px;
                                                    background:#ecfeff;
                                                    color:#0891b2;
                                                    font-size:9px;
                                                    font-weight:700;
                                                ">

                                                ✓ Received copy saved

                                            </span>
                                            `
                                            : ""
                                    }


                                    ${
                                        letter.responseCopy
                                            ? `
                                            <span
                                                style="
                                                    padding:5px 8px;
                                                    border-radius:8px;
                                                    background:#ecfdf5;
                                                    color:#059669;
                                                    font-size:9px;
                                                    font-weight:700;
                                                ">

                                                ✓ Response copy saved

                                            </span>
                                            `
                                            : ""
                                    }

                                </div>

                            </div>


                            <!-- RESPONSE REMINDER -->

                            ${
                                letter.reminderLetterDate
                                    ? `
                                    <div
                                        style="
                                            margin-top:12px;
                                            padding:10px;
                                            border-radius:12px;
                                            background:#fff7ed;
                                            color:#9a3412;
                                            font-size:10px;
                                        ">

                                        🔔 Reminder letter:
                                        <strong>
                                            ${
                                                formatDate(
                                                    letter.reminderLetterDate
                                                )
                                            }
                                        </strong>

                                    </div>
                                    `
                                    : ""
                            }

                        </div>

                    `;

                })
                .join("");
    }



    /* =====================================================
       ADD LETTER
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


        let responseDue =
            "";


        let reminderLetterDate =
            "";


        if (responseRequired) {

            responseDue =
                prompt(
                    "Response due date (YYYY-MM-DD):"
                ) || "";


            reminderLetterDate =
                prompt(
                    "On which date should I remind you to give the reminder letter? (YYYY-MM-DD)"
                ) || "";

        }


        officeData.letters.push({

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

        });


        saveData();

        refreshAll();

        showScreen(
            "lettersScreen"
        );


        alert(
            "Letter added successfully."
        );
    }



    /* =====================================================
       ATTACHMENT HELPERS
    ===================================================== */

    function findLetter(letterId) {

        return officeData.letters.find(
            function (letter) {

                return (
                    letter.id ===
                    letterId
                );

            }
        );
    }



    /* =====================================================
       CAMERA
    ===================================================== */

    function takePhoto(
        letterId,
        type
    ) {

        const letter =
            findLetter(letterId);


        if (!letter) {
            return;
        }


        if (
            typeof navigator ===
            "undefined" ||
            !navigator.camera
        ) {

            alert(
                "Camera is available after the Android APK is rebuilt with the camera feature."
            );

            return;
        }


        navigator.camera.getPicture(

            function (imageData) {

                const attachment = {

                    type:
                        "image",

                    uri:
                        imageData,

                    name:
                        type ===
                        "received"
                            ? "Received letter"
                            : "Response copy",

                    addedAt:
                        new Date().toISOString()

                };


                if (
                    type ===
                    "received"
                ) {

                    letter.receivedCopy =
                        attachment;

                } else {

                    letter.responseCopy =
                        attachment;

                }


                saveData();

                refreshAll();


                alert(
                    type === "received"
                        ? "Received letter scan saved."
                        : "Response copy saved."
                );

            },


            function (error) {

                console.log(
                    "Camera cancelled/error:",
                    error
                );

            },


            {

                quality: 80,

                destinationType:
                    Camera.DestinationType.DATA_URL,

                sourceType:
                    Camera.PictureSourceType.CAMERA,

                encodingType:
                    Camera.EncodingType.JPEG,

                mediaType:
                    Camera.MediaType.PICTURE,

                correctOrientation:
                    true,

                saveToPhotoAlbum:
                    false

            }

        );
    }



    /* =====================================================
       FILE SELECTOR
    ===================================================== */

    function chooseFile(
        letterId,
        type
    ) {

        const letter =
            findLetter(letterId);


        if (!letter) {
            return;
        }


        if (
            typeof window.fileChooser ===
            "undefined"
        ) {

            alert(
                "The document picker is available after the Android APK is rebuilt with the file feature."
            );

            return;
        }


        window.fileChooser.open(

            function (uri) {

                const attachment = {

                    type:
                        "file",

                    uri:
                        uri,

                    name:
                        type ===
                        "received"
                            ? "Received letter"
                            : "Response copy",

                    addedAt:
                        new Date().toISOString()

                };


                if (
                    type ===
                    "received"
                ) {

                    letter.receivedCopy =
                        attachment;

                } else {

                    letter.responseCopy =
                        attachment;

                }


                saveData();

                refreshAll();


                alert(
                    type === "received"
                        ? "Received document attached."
                        : "Response document attached."
                );

            },

            function (error) {

                console.log(
                    "File selection cancelled/error:",
                    error
                );

            }

        );
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
                        keep track of everything.
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
                                data-complete-task="${
                                    task.id
                                }"
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
            task.status ===
            "completed"
                ? "pending"
                : "completed";


        saveData();

        refreshAll();
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

                    return !reminder.completed;

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


                            <div>

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
       CLICK EVENTS
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

                return;
            }


            /* =============================================
               RECEIVED LETTER CAMERA
            ============================================== */

            const cameraLetter =
                event.target.closest(
                    "[data-camera-letter]"
                );


            if (cameraLetter) {

                takePhoto(
                    cameraLetter.dataset
                        .cameraLetter,

                    "received"
                );

                return;
            }


            /* =============================================
               RECEIVED LETTER FILE
            ============================================== */

            const fileLetter =
                event.target.closest(
                    "[data-file-letter]"
                );


            if (fileLetter) {

                chooseFile(
                    fileLetter.dataset
                        .fileLetter,

                    "received"
                );

                return;
            }


            /* =============================================
               RESPONSE CAMERA
            ============================================== */

            const cameraResponse =
                event.target.closest(
                    "[data-camera-response]"
                );


            if (cameraResponse) {

                takePhoto(
                    cameraResponse.dataset
                        .cameraResponse,

                    "response"
                );

                return;
            }


            /* =============================================
               RESPONSE FILE
            ============================================== */

            const fileResponse =
                event.target.closest(
                    "[data-file-response]"
                );


            if (fileResponse) {

                chooseFile(
                    fileResponse.dataset
                        .fileResponse,

                    "response"
                );

                return;
            }

        }
    );



    /* =====================================================
       REFRESH
    ===================================================== */

    function refreshAll() {

        updateDashboard();

        updateLetterStatistics();

        renderLetters();

        renderTasks();

        renderReminders();

    }



    /* =====================================================
       INITIALIZE
    ===================================================== */

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
            "My Office initialized successfully."
        );

    }


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
