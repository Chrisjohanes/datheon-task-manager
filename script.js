"use strict";

/* ========================================
   1. SELECT HTML ELEMENTS
======================================== */

const taskForm = document.querySelector("#task-form");
const taskTitleInput = document.querySelector("#task-title");
const taskCategoryInput = document.querySelector("#task-category");
const taskDueDateInput = document.querySelector("#task-due-date");

const formTitle = document.querySelector("#form-title");
const submitTaskButton = document.querySelector("#submit-task");
const cancelEditButton = document.querySelector("#cancel-edit");

const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const emptyTitle = document.querySelector("#empty-title");
const emptyMessage = document.querySelector("#empty-message");

const taskSearch = document.querySelector("#task-search");
const filterButtons = document.querySelectorAll(".filter-btn");

const totalCount = document.querySelector("#total-count");
const activeCount = document.querySelector("#active-count");
const completedCount = document.querySelector("#completed-count");
const progressPercent = document.querySelector("#progress-percent");
const progressTrack = document.querySelector("#progress-track");
const progressFill = document.querySelector("#progress-fill");

const visibleCount = document.querySelector("#visible-count");
const toast = document.querySelector("#toast");
const currentYear = document.querySelector("#current-year");

/* ========================================
   2. APPLICATION STATE
======================================== */

const STORAGE_KEY = "taskflow-tasks-v1";

let tasks = loadFromLocalStorage();
let currentFilter = "all";
let editingTaskId = null;
let toastTimeout = null;

/* ========================================
   3. LOCAL STORAGE
======================================== */

function loadFromLocalStorage() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);

    if (!savedTasks) {
      return [];
    }

    const parsedTasks = JSON.parse(savedTasks);

    if (!Array.isArray(parsedTasks)) {
      return [];
    }

    // Ignore malformed entries rather than breaking the app.
    return parsedTasks.filter((task) => {
      return (
        task &&
        typeof task.id === "string" &&
        typeof task.title === "string" &&
        typeof task.completed === "boolean" &&
        ["Work", "Personal", "Study"].includes(task.category)
      );
    });
  } catch (error) {
    console.error("Unable to load saved tasks:", error);
    return [];
  }
}

function saveToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error("Unable to save tasks:", error);
    showToast("Could not save data. Check your browser storage.");
    return false;
  }
}

/* ========================================
   4. HELPERS
======================================== */

function createTaskId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatDueDate(dateString) {
  if (!dateString) {
    return "No due date";
  }

  // Parse the date as a local calendar date to avoid timezone shifts.
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function isOverdue(task) {
  if (!task.dueDate || task.completed) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = task.dueDate.split("-").map(Number);
  const dueDate = new Date(year, month - 1, day);

  return dueDate < today;
}

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

/* ========================================
   5. CREATE TASK
======================================== */

function createTask(title, category, dueDate) {
  const newTask = {
    id: createTaskId(),
    title,
    category,
    dueDate,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.unshift(newTask);

  if (!saveToLocalStorage()) {
    tasks.shift();
    return;
  }

  renderApp();
  showToast("Task added successfully!");
}

/* ========================================
   6. READ TASKS
======================================== */

function getVisibleTasks() {
  const searchTerm = taskSearch.value.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesFilter =
      currentFilter === "all" ||
      (currentFilter === "active" && !task.completed) ||
      (currentFilter === "completed" && task.completed);

    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm) ||
      task.category.toLowerCase().includes(searchTerm);

    return matchesFilter && matchesSearch;
  });
}

function createTaskElement(task) {
  const article = document.createElement("article");
  article.className = `task-item${task.completed ? " is-completed" : ""}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-checkbox";
  checkbox.checked = task.completed;
  checkbox.setAttribute(
    "aria-label",
    `Mark ${task.title} as ${task.completed ? "active" : "completed"}`,
  );
  checkbox.addEventListener("change", () => {
    toggleTaskCompletion(task.id);
  });

  const main = document.createElement("div");
  main.className = "task-main";

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;

  const meta = document.createElement("div");
  meta.className = "task-meta";

  const category = document.createElement("span");
  category.className = `category-badge category-${task.category.toLowerCase()}`;
  category.textContent = task.category;

  meta.appendChild(category);

  if (task.completed) {
    const status = document.createElement("span");
    status.className = "status-badge";
    status.textContent = "Completed";
    meta.appendChild(status);
  }

  const dueDate = document.createElement("span");
  dueDate.className = `due-date${isOverdue(task) ? " overdue" : ""}`;
  dueDate.textContent = task.dueDate
    ? `${isOverdue(task) ? "Overdue · " : "Due · "}${formatDueDate(task.dueDate)}`
    : "No due date";

  meta.appendChild(dueDate);
  main.append(title, meta);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "icon-btn";
  editButton.textContent = "✎";
  editButton.setAttribute("aria-label", `Edit ${task.title}`);
  editButton.title = "Edit task";
  editButton.addEventListener("click", () => {
    startEditingTask(task.id);
  });

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "icon-btn delete";
  deleteButton.textContent = "×";
  deleteButton.setAttribute("aria-label", `Delete ${task.title}`);
  deleteButton.title = "Delete task";
  deleteButton.addEventListener("click", () => {
    deleteTask(task.id);
  });

  actions.append(editButton, deleteButton);
  article.append(checkbox, main, actions);

  return article;
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();
  const fragment = document.createDocumentFragment();

  visibleTasks.forEach((task) => {
    fragment.appendChild(createTaskElement(task));
  });

  taskList.replaceChildren(fragment);

  emptyState.hidden = visibleTasks.length > 0;

  if (visibleTasks.length === 0) {
    if (tasks.length === 0) {
      emptyTitle.textContent = "A fresh start!";
      emptyMessage.textContent =
        "Add your first task above and start making progress.";
    } else if (taskSearch.value.trim()) {
      emptyTitle.textContent = "No matching tasks";
      emptyMessage.textContent =
        "Try another search term or change the selected filter.";
    } else {
      emptyTitle.textContent = "Nothing here yet";
      emptyMessage.textContent =
        "There are no tasks in this filter. Try another status.";
    }
  }

  visibleCount.textContent = `${visibleTasks.length} ${visibleTasks.length === 1 ? "task" : "tasks"}`;
}

/* ========================================
   7. UPDATE TASK
======================================== */

function startEditingTask(taskId) {
  const task = tasks.find((item) => item.id === taskId);

  if (!task) return;

  editingTaskId = taskId;

  taskTitleInput.value = task.title;
  taskCategoryInput.value = task.category;
  taskDueDateInput.value = task.dueDate || "";

  formTitle.textContent = "Edit task";
  submitTaskButton.innerHTML = '<span aria-hidden="true">✓</span> Save changes';
  cancelEditButton.hidden = false;

  taskForm.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  taskTitleInput.focus();
}

function updateTask(taskId, title, category, dueDate) {
  const taskIndex = tasks.findIndex((item) => item.id === taskId);

  if (taskIndex === -1) return;

  const previousTask = tasks[taskIndex];

  tasks[taskIndex] = {
    ...previousTask,
    title,
    category,
    dueDate,
  };

  if (!saveToLocalStorage()) {
    tasks[taskIndex] = previousTask;
    return;
  }

  resetTaskForm();
  renderApp();
  showToast("Task updated successfully!");
}

function resetTaskForm() {
  editingTaskId = null;
  taskForm.reset();

  formTitle.textContent = "Create a new task";
  submitTaskButton.innerHTML = '<span aria-hidden="true">+</span> Add task';
  cancelEditButton.hidden = true;

  taskCategoryInput.value = "Study";
}

/* ========================================
   8. DELETE TASK
======================================== */

function deleteTask(taskId) {
  const taskIndex = tasks.findIndex((task) => task.id === taskId);

  if (taskIndex === -1) return;

  const deletedTask = tasks[taskIndex];

  tasks.splice(taskIndex, 1);

  if (!saveToLocalStorage()) {
    tasks.splice(taskIndex, 0, deletedTask);
    return;
  }

  if (editingTaskId === taskId) {
    resetTaskForm();
  }

  renderApp();
  showToast("Task deleted.");
}

/* ========================================
   9. TOGGLE COMPLETION
======================================== */

function toggleTaskCompletion(taskId) {
  const task = tasks.find((item) => item.id === taskId);

  if (!task) return;

  task.completed = !task.completed;

  if (!saveToLocalStorage()) {
    task.completed = !task.completed;
    return;
  }

  renderApp();
  showToast(
    task.completed ? "Task completed! Great work." : "Task marked as active.",
  );
}

/* ========================================
   10. STATISTICS
======================================== */

function renderStatistics() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const active = total - completed;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  totalCount.textContent = String(total);
  activeCount.textContent = String(active);
  completedCount.textContent = String(completed);
  progressPercent.textContent = `${percentage}%`;

  progressFill.style.width = `${percentage}%`;
  progressTrack.setAttribute("aria-valuenow", String(percentage));
}

/* ========================================
   11. RENDER APP
======================================== */

function renderApp() {
  renderTasks();
  renderStatistics();
}

/* ========================================
   12. EVENT LISTENERS
======================================== */

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = taskTitleInput.value.trim();
  const category = taskCategoryInput.value;
  const dueDate = taskDueDateInput.value;

  if (!title) {
    taskTitleInput.focus();
    showToast("Please enter a task name.");
    return;
  }

  if (!["Work", "Personal", "Study"].includes(category)) {
    showToast("Please select a valid category.");
    return;
  }

  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    showToast("Please select a valid due date.");
    return;
  }

  if (editingTaskId) {
    updateTask(editingTaskId, title, category, dueDate);
  } else {
    createTask(title, category, dueDate);
    taskForm.reset();
    taskCategoryInput.value = "Study";
  }
});

cancelEditButton.addEventListener("click", () => {
  resetTaskForm();
  showToast("Editing cancelled.");
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;

      filterButton.classList.toggle("active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });

    renderTasks();
  });
});

taskSearch.addEventListener("input", renderTasks);

/* ========================================
   13. INITIALIZE
======================================== */

currentYear.textContent = String(new Date().getFullYear());
renderApp();
