
"use strict";

// Course list
const courses = [
    "Data Structure Algorithm - I",
    "Database Management System",
    "Electronic Device Circuit",
    "Digital Logic Design",
    "CGLAVA"
];

// Demo resources
const sampleResources = [
    {
        id: 1,
        title: "DSA Practice Questions",
        course: courses[0],
        type: "Previous Question",
        semester: "1st Semester",
        year: 2025,
        examType: "Midterm",
        status: "Approved",
        owner: "Demo Student",
        link: ""
    },
    {
        id: 2,
        title: "DBMS Class Notes",
        course: courses[1],
        type: "Study Notes",
        semester: "2nd Semester",
        year: 2025,
        examType: "Final",
        status: "Approved",
        owner: "Demo Student",
        link: ""
    },
    {
        id: 3,
        title: "Electronic Devices Revision",
        course: courses[2],
        type: "Suggestions",
        semester: "3rd Semester",
        year: 2025,
        examType: "Final",
        status: "Approved",
        owner: "Demo Student",
        link: ""
    },
    {
        id: 4,
        title: "Digital Logic Questions",
        course: courses[3],
        type: "Previous Question",
        semester: "4th Semester",
        year: 2025,
        examType: "Midterm",
        status: "Approved",
        owner: "Demo Student",
        link: ""
    },
    {
        id: 5,
        title: "CGLAVA Study Materials",
        course: courses[4],
        type: "Study Notes",
        semester: "5th Semester",
        year: 2025,
        examType: "Final",
        status: "Approved",
        owner: "Demo Student",
        link: ""
    }
];

// Read saved data
function loadData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        return fallback;
    }
}

function saveData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        showToast("Unable to save data in this browser.");
        return false;
    }
}

let resources = loadData("studyResources", sampleResources);
let bookmarks = loadData("studyBookmarks", []);
let accounts = loadData("studyAccounts", {});
let student = null;

// Get an element by ID
function getElement(id) {
    return document.getElementById(id);
}

// Show notification
function showToast(message) {
    const toast = getElement("toast");
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(function() {
        toast.classList.remove("show");
    }, 2500);
}

// Check email format
function isValidEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return pattern.test(email);
}

// Hash a password for this local demo
async function hashPassword(password) {
    if (!window.crypto || !window.crypto.subtle) {
        throw new Error("Secure password hashing is unavailable.");
    }

    const data = new TextEncoder().encode(password);
    const result = await window.crypto.subtle.digest("SHA-256", data);

    return Array.from(new Uint8Array(result))
        .map(function(byte) {
            return byte.toString(16).padStart(2, "0");
        })
        .join("");
}

// Login or create a demo account
getElement("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const id = getElement("studentId").value.trim();
    const email = getElement("email").value.trim().toLowerCase();
    const batch = getElement("batch").value.trim();
    const semester = getElement("semester").value;
    const password = getElement("password").value;
    const message = getElement("loginMessage");

    message.textContent = "";
    message.className = "message";

    if (!id || !email || !batch || !semester || !password) {
        message.textContent = "Please fill in all fields.";
        message.className = "message error";
        return;
    }

    if (!isValidEmail(email)) {
        message.textContent = "Invalid email address. Please enter a valid email.";
        message.className = "message error";
        getElement("email").focus();
        return;
    }

    if (password.length < 6) {
        message.textContent = "Password must contain at least 6 characters.";
        message.className = "message error";
        getElement("password").focus();
        return;
    }

    const button = getElement("loginButton");
    button.disabled = true;
    button.textContent = "Please wait...";

    try {
        const passwordHash = await hashPassword(password);
        const accountKey = id.toLowerCase();

        if (accounts[accountKey]) {
            const account = accounts[accountKey];

            if (account.email !== email) {
                message.textContent =
                    "Invalid email or Student ID. Please check your details.";
                message.className = "message error";
                return;
            }

            if (account.passwordHash !== passwordHash) {
                message.textContent = "Invalid password. Please try again.";
                message.className = "message error";
                getElement("password").value = "";
                getElement("password").focus();
                return;
            }

            // Keep the original account details
            student = {
                id: account.id,
                email: account.email,
                batch: account.batch,
                semester: account.semester
            };

            showToast("Login successful!");
        } else {
            // First successful submission creates a local demo account
            accounts[accountKey] = {
                id: id,
                email: email,
                batch: batch,
                semester: semester,
                passwordHash: passwordHash
            };

            if (!saveData("studyAccounts", accounts)) {
                delete accounts[accountKey];
                message.textContent =
                    "Could not save the account. Please try again.";
                message.className = "message error";
                return;
            }

            student = {
                id: id,
                email: email,
                batch: batch,
                semester: semester
            };

            showToast("Demo account created successfully!");
        }

        getElement("loginPage").hidden = true;
        getElement("dashboard").hidden = false;

        getElement("profileId").textContent = student.id;
        getElement("profileDetails").textContent =
            student.email + " | " + student.batch + " | " + student.semester;

        getElement("avatar").textContent =
            student.id.charAt(0).toUpperCase();

        getElement("password").value = "";

        renderAll();
        showPage("overview");
    } catch (error) {
        message.textContent =
            "Login could not be completed. Open this project using Live Server.";
        message.className = "message error";
    } finally {
        button.disabled = false;
        button.textContent = "Create Account / Login";
    }
});

// Logout
getElement("logoutBtn").addEventListener("click", function() {
    student = null;

    getElement("loginForm").reset();
    getElement("dashboard").hidden = true;
    getElement("loginPage").hidden = false;

    getElement("loginMessage").textContent = "";
    showToast("Logged out successfully.");
});

// Page navigation
const pageNames = [
    "overview",
    "courses",
    "resources",
    "share",
    "bookmarks"
];

function showPage(pageName) {
    if (!pageNames.includes(pageName)) {
        return;
    }

    pageNames.forEach(function(name) {
        getElement(name + "Page").hidden = name !== pageName;
    });

    document.querySelectorAll(".nav-btn").forEach(function(button) {
        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );
    });

    if (pageName === "resources") {
        renderResources();
    }

    if (pageName === "bookmarks") {
        renderBookmarks();
    }

    if (pageName === "courses") {
        renderCourses("allCourses");
    }

    if (pageName === "overview") {
        renderHome();
    }

    window.scrollTo(0, 0);
}

document.querySelectorAll(".nav-btn").forEach(function(button) {
    button.addEventListener("click", function() {
        showPage(button.dataset.page);
    });
});

document.querySelectorAll("[data-go]").forEach(function(button) {
    button.addEventListener("click", function() {
        showPage(button.dataset.go);
    });
});

getElement("brandLink").addEventListener("click", function(event) {
    event.preventDefault();
    showPage("overview");
});

// Add course names to dropdowns
function setupCourses() {
    ["courseFilter", "resourceCourse"].forEach(function(id) {
        const dropdown = getElement(id);

        courses.forEach(function(course) {
            const option = document.createElement("option");
            option.value = course;
            option.textContent = course;
            dropdown.appendChild(option);
        });
    });
}

// Show course cards
function renderCourses(containerId) {
    const container = getElement(containerId);
    container.replaceChildren();

    courses.forEach(function(course, index) {
        const card = document.createElement("article");
        card.className = "course-card";

        const icon = document.createElement("div");
        icon.className = "course-icon";
        icon.textContent = ["▤", "▦", "ϟ", "◈", "∑"][index];

        const title = document.createElement("h3");
        title.textContent = course;

        const description = document.createElement("p");
        description.textContent = "Course " + (index + 1);

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Explore resources →";

        button.addEventListener("click", function() {
            getElement("courseFilter").value = course;
            getElement("searchInput").value = "";
            getElement("typeFilter").value = "all";
            getElement("semesterFilter").value = "all";

            showPage("resources");
        });

        card.append(icon, title, description, button);
        container.appendChild(card);
    });
}

// Show resource cards
function renderResourceCards(items, containerId) {
    const container = getElement(containerId);
    container.replaceChildren();

    items.forEach(function(resource) {
        const card = document.createElement("article");
        card.className = "resource-card";

        const top = document.createElement("div");
        top.className = "resource-top";

        const icon = document.createElement("div");
        icon.className = "resource-icon";
        icon.textContent =
            resource.type === "Study Notes" ? "📝" : "📄";

        const status = document.createElement("span");
        status.className = "status " +
            (resource.status === "Approved" ? "approved" : "pending");
        status.textContent = resource.status;

        top.append(icon, status);

        const title = document.createElement("h3");
        title.textContent = resource.title;

        const course = document.createElement("p");
        course.className = "resource-course";
        course.textContent = resource.course;

        const meta = document.createElement("div");
        meta.className = "resource-meta";

        [resource.type, resource.semester, String(resource.year)]
            .forEach(function(value) {
                const tag = document.createElement("span");
                tag.className = "tag";
                tag.textContent = value;
                meta.appendChild(tag);
            });

        const owner = document.createElement("p");
        owner.className = "resource-owner";
        owner.textContent = "Shared by " + resource.owner;

        const actions = document.createElement("div");
        actions.className = "resource-actions";

        const viewButton = document.createElement("button");
        viewButton.type = "button";
        viewButton.className = "small-btn primary";
        viewButton.textContent = "View Resource";
        viewButton.disabled = resource.status !== "Approved";

        viewButton.addEventListener("click", function() {
            if (!resource.link) {
                showToast("No resource link is available.");
                return;
            }

            try {
                const url = new URL(resource.link);

                if (url.protocol !== "https:" &&
                    url.protocol !== "http:") {
                    showToast("Invalid resource link.");
                    return;
                }

                window.open(url.href, "_blank", "noopener,noreferrer");
            } catch (error) {
                showToast("Please check the resource link.");
            }
        });

        const bookmarkButton = document.createElement("button");
        bookmarkButton.type = "button";
        bookmarkButton.className = "small-btn bookmark-btn";

        const saved = bookmarks.includes(resource.id);
        bookmarkButton.textContent = saved ? "★" : "☆";
        bookmarkButton.setAttribute(
            "aria-label",
            saved ? "Remove bookmark" : "Save bookmark"
        );

        bookmarkButton.addEventListener("click", function() {
            toggleBookmark(resource.id);
        });

        actions.append(viewButton, bookmarkButton);
        card.append(top, title, course, meta, owner, actions);
        container.appendChild(card);
    });
}

// Dashboard information
function renderHome() {
    getElement("totalCourses").textContent = courses.length;

    const approved = resources.filter(function(resource) {
        return resource.status === "Approved";
    });

    getElement("totalResources").textContent = approved.length;

    getElement("totalBookmarks").textContent = bookmarks.length;

    renderCourses("homeCourses");

    renderResourceCards(
        approved.slice().reverse().slice(0, 4),
        "recentResources"
    );
}

// Search and filter resources
function renderResources() {
    const search = getElement("searchInput").value
        .trim().toLowerCase();

    const course = getElement("courseFilter").value;
    const type = getElement("typeFilter").value;
    const semester = getElement("semesterFilter").value;

    const filtered = resources.filter(function(resource) {
        const searchableText =
            (resource.title + " " + resource.course + " " + resource.type)
            .toLowerCase();

        return searchableText.includes(search) &&
            (course === "all" || resource.course === course) &&
            (type === "all" || resource.type === type) &&
            (semester === "all" || resource.semester === semester);
    });

    renderResourceCards(filtered, "allResources");
    getElement("resourceEmpty").hidden = filtered.length !== 0;
}

["searchInput", "courseFilter", "typeFilter", "semesterFilter"]
    .forEach(function(id) {
        getElement(id).addEventListener("input", renderResources);
        getElement(id).addEventListener("change", renderResources);
    });

// Bookmarks
function toggleBookmark(resourceId) {
    if (bookmarks.includes(resourceId)) {
        bookmarks = bookmarks.filter(function(id) {
            return id !== resourceId;
        });

        showToast("Bookmark removed.");
    } else {
        bookmarks.push(resourceId);
        showToast("Resource saved.");
    }

    saveData("studyBookmarks", bookmarks);
    renderAll();
}

function renderBookmarks() {
    const savedResources = resources.filter(function(resource) {
        return bookmarks.includes(resource.id) &&
            resource.status === "Approved";
    });

    renderResourceCards(savedResources, "bookmarkResources");

    getElement("bookmarkEmpty").hidden =
        savedResources.length !== 0;
}

// Submit study materials
getElement("shareForm").addEventListener("submit", function(event) {
    event.preventDefault();

    if (!student) {
        showToast("Please log in first.");
        return;
    }

    const file = getElement("resourceFile").files[0];
    const link = getElement("resourceLink").value.trim();

    if (!file && !link) {
        getElement("shareMessage").textContent =
            "Please choose a file or enter a resource link.";
        getElement("shareMessage").className = "message error";
        return;
    }

    if (file && file.size > 10 * 1024 * 1024) {
        getElement("shareMessage").textContent =
            "File size must be below 10 MB.";
        getElement("shareMessage").className = "message error";
        return;
    }

    if (file) {
        const allowedExtensions = [
            "pdf", "doc", "docx", "png", "jpg", "jpeg"
        ];

        const extension = file.name.split(".").pop().toLowerCase();

        if (!allowedExtensions.includes(extension)) {
            getElement("shareMessage").textContent =
                "Choose a PDF, Word document or image.";
            getElement("shareMessage").className = "message error";
            return;
        }
    }

    if (link) {
        try {
            const url = new URL(link);

            if (url.protocol !== "https:" &&
                url.protocol !== "http:") {
                throw new Error("Invalid protocol");
            }
        } catch (error) {
            getElement("shareMessage").textContent =
                "Enter a valid web link.";
            getElement("shareMessage").className = "message error";
            return;
        }
    }

    const newResource = {
        id: Date.now(),
        title: getElement("resourceTitle").value.trim(),
        course: getElement("resourceCourse").value,
        type: getElement("resourceType").value,
        semester: getElement("resourceSemester").value,
        year: Number(getElement("resourceYear").value),
        examType: getElement("examType").value,
        status: "Pending",
        owner: student.id,
        link: link,
        fileName: file ? file.name : ""
    };

    resources.push(newResource);

    if (!saveData("studyResources", resources)) {
        resources.pop();
        return;
    }

    getElement("shareForm").reset();

    getElement("shareMessage").textContent =
        "Resource saved in demo mode. Status: Pending approval.";
    getElement("shareMessage").className = "message success";

    renderAll();
    showToast("Resource submitted in demo mode.");
});

// Dark mode
getElement("themeBtn").addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");

    const theme = document.body.classList.contains("dark-mode")
        ? "dark"
        : "light";

    try {
        localStorage.setItem("studyTheme", theme);
    } catch (error) {
        // Dark mode still works for the current page.
    }
});

// Update dashboard and resource sections
function renderAll() {
    renderHome();
    renderResources();
    renderBookmarks();
}

// Start the frontend
setupCourses();

try {
    if (localStorage.getItem("studyTheme") === "dark") {
        document.body.classList.add("dark-mode");
    }
} catch (error) {
    // Use the default theme if browser storage is unavailable.
}
