# TaskFlow — Dynamic Task Manager & Productivity Tracker

TaskFlow is a lightweight, responsive task management application designed to help users organize daily activities, track deadlines, and monitor their productivity.

The application runs directly in the browser without requiring a backend server. Tasks are stored in the browser using `localStorage`, so they remain available after refreshing the page.

## Features

- **Create tasks:** Add new tasks with a title, category, and due date.
- **Read tasks:** View and organize your existing tasks.
- **Update tasks:** Edit task details when plans change.
- **Delete tasks:** Remove tasks that are no longer needed.
- **Task categories:** Organize activities into Work, Personal, and Study.
- **Task completion:** Mark tasks as completed or active.
- **Task filters:** Filter tasks by All, Active, and Completed.
- **Search:** Quickly find tasks by keyword.
- **Persistent storage:** Save task data in browser `localStorage`.
- **Productivity overview:** View task statistics and completion progress.
- **Responsive design:** Use the application on desktop and mobile screens.

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- DOM Manipulation
- Browser `localStorage` API

## Getting Started

### Prerequisites

A modern web browser such as Google Chrome, Microsoft Edge, Firefox, or Safari.

### Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/Chrisjohanes/datheon-task-manager.git
   ```

2. Open the project folder:

   ```bash
   cd datheon-task-manager
   ```

3. Open `index.html` in your web browser.

No additional dependencies or backend server are required.

## Live Demo

[Open TaskFlow](https://chrisjohanes.github.io/datheon-task-manager/)

_Note: The live demo will be available after GitHub Pages deployment is enabled and completed._

## Project Structure

```text
datheon-task-manager/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Data Storage

TaskFlow uses browser `localStorage` to persist tasks between page reloads. Task data is stored locally in the browser and is not automatically synchronized across devices or browsers.

Clearing the browser's site data may remove locally stored tasks.

## Project Purpose

This project demonstrates fundamental front-end development skills, including CRUD operations, JavaScript DOM manipulation, browser storage, responsive UI design, and interactive task filtering.

## License

This project was created for learning and portfolio purposes.
