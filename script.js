// Elements
const taskList = document.getElementById('task-list');
const newTaskName = document.getElementById('new-task-name');
const addTaskButton = document.getElementById('add-task');
const filterButtons = document.querySelectorAll('.filter-btn');
const addFilterButton = document.getElementById('add-filter');
const mainFocus = document.getElementById('main-focus');
const addFilterForm = document.getElementById('add-filter-form');
const newFilterNameInput = document.getElementById('new-filter-name');
const saveFilterButton = document.getElementById('save-filter');
const cancelFilterButton = document.getElementById('cancel-filter');
const STORAGE_KEY = 'todoTasks';  // Storage Key
document.addEventListener('DOMContentLoaded', loadTasks);  // Load tasks and filters on startup
addTaskButton.addEventListener('click', addTask);
saveFilterButton.addEventListener('click', saveFilter);
cancelFilterButton.addEventListener('click', cancelFilter);
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];  // Task Array and Filters
let filters = ['personal', 'freelance', 'work']; // Default filters
filterButtons.forEach((btn) => {  // Event Listener for Filter Buttons
  btn.addEventListener('click', () => {
    const filter = btn.getAttribute('data-filter');
    updateMainFocus(filter);
    renderTasks(filter);
  });
});
addFilterButton.addEventListener('click', () => {  // Add Filter Button
  addFilterForm.style.display = 'block'; // Show filter form
});
function updateMainFocus(filter) { // Update Main Focus Title
  if (filter === 'all') {
    mainFocus.textContent = "Today's Tasks";
  } else {
    mainFocus.textContent = `${filter.charAt(0).toUpperCase() + filter.slice(1)} Tasks`;
  }
}
function addTask() {
  const taskName = newTaskName.value.trim();
  const taskDateInput = document.getElementById('task-date').value;
  const taskCategory = document.getElementById('task-category').value;

  if (!taskName || !taskDateInput || !taskCategory) {
    alert('Please fill in all the fields.');
    return;
  }
  const taskDate = new Date(taskDateInput);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Remove time for comparison
  if (taskDate < today) {
    alert('You cannot select a past date for the task.');
    return;
  }
  const task = {
    id: Date.now(),
    name: taskName,
    date: taskDateInput,
    category: taskCategory,
    completed: false,
  };
  tasks.push(task);
  saveTasks();
  renderTasks();
  newTaskName.value = '';
  document.getElementById('task-date').value = '';
  document.getElementById('task-category').value = '';
}
function saveFilter() {
  const newFilter = newFilterNameInput.value.trim();
  if (!newFilter) return alert('Please enter a filter name.'); 
  const newFilterLower = newFilter.toLowerCase(); // Ensure consistent format
  if (filters.includes(newFilterLower)) {
    alert('Filter already exists!');
    return;
  }
  // Add the new filter to the filters array
  filters.push(newFilterLower);
  // Add the new filter button to the sidebar
  const newFilterButton = document.createElement('li');
  newFilterButton.innerHTML = `
    <button class="filter-btn" data-filter="${newFilterLower}">${newFilter}</button>
    <button class="delete-filter" data-filter="${newFilterLower}">X</button>
  `;
  document.querySelector('nav ul').insertBefore(newFilterButton, document.getElementById('add-filter').parentNode);
  // Add click event for the new filter button
  const newFilterBtn = newFilterButton.querySelector('button.filter-btn');
  newFilterBtn.addEventListener('click', () => {
    updateMainFocus(newFilterLower);
    renderTasks(newFilterLower);
  });
  // Add delete functionality for the new filter button
  const deleteButton = newFilterButton.querySelector('.delete-filter');
  deleteButton.addEventListener('click', () => deleteFilter(newFilterLower, newFilterButton));
  // Update the task category dropdown
  updateCategoryDropdown();
  // Clear input and hide the filter form
  newFilterNameInput.value = '';
  addFilterForm.style.display = 'none';
}
// Function to update the task category dropdown
function updateCategoryDropdown() {
  const taskCategory = document.getElementById('task-category'); 
  // Clear existing options except the default
  taskCategory.innerHTML = `
    <option value="" disabled selected>Select Category</option>
  `;
  // Populate dropdown with updated filters
  filters.forEach((filter) => {
    const option = document.createElement('option');
    option.value = filter;
    option.textContent = filter.charAt(0).toUpperCase() + filter.slice(1);
    taskCategory.appendChild(option);
  });
}
// Initial call to populate the dropdown on page load
document.addEventListener('DOMContentLoaded', () => {
  updateCategoryDropdown();
});
function cancelFilter() {  // Cancel Filter
  addFilterForm.style.display = 'none'; // Hide filter form
}
function deleteFilter(filter, filterButtonElement) {
  const confirmation = confirm(`Are you sure you want to delete the filter "${filter}"?`);
  if (!confirmation) return;
  // Remove tasks associated with the filter
  tasks = tasks.filter((task) => task.category !== filter);
  saveTasks();
  // Remove the filter from the filters array
  filters = filters.filter((f) => f !== filter);
  // Remove the filter button from the DOM
  filterButtonElement.remove();
  // Update the category dropdown dynamically
  updateCategoryDropdown();
  // Re-render tasks to reflect changes
  renderTasks();
}

function renderTasks(filter = 'all') {
  taskList.innerHTML = '';
  const today = new Date().toISOString().split('T')[0];
  let filteredTasks;
  if (filter === 'all') {
    filteredTasks = tasks.filter((task) => task.date === today);
  } else if (filter === 'scheduled') {
    filteredTasks = tasks.filter((task) => task.date > today);
  } else {
    filteredTasks = tasks.filter((task) => task.category === filter);
  }
  filteredTasks.forEach((task) => {
    const taskItem = document.createElement('li');
    taskItem.classList.add('task-item');
    taskItem.innerHTML = `
      <input type="checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
      <label>${task.name}</label>
      <span class="task-details">${task.category} | ${task.date}</span>
    `;
    taskItem.querySelector('input').addEventListener('change', (e) => {
      const taskId = e.target.getAttribute('data-id');
      toggleTaskCompletion(taskId);
    });
    taskList.appendChild(taskItem);
  });
}
// Add event listeners for "Today Tasks" and "Scheduled Tasks"
document.querySelector('.filter-btn[data-filter="all"]').addEventListener('click', () => {
  updateMainFocus('all');
  renderTasks('all');
});
document.getElementById('scheduled-tasks').addEventListener('click', () => {
  updateMainFocus('scheduled');
  renderTasks('scheduled');
});
// Function to dynamically update the category dropdown
function updateCategoryDropdown() {
  const taskCategorySelect = document.getElementById('task-category');
  taskCategorySelect.innerHTML = `
    <option value="" disabled selected>Select Category</option>
    ${filters.map(filter => `<option value="${filter}">${filter.charAt(0).toUpperCase() + filter.slice(1)}</option>`).join('')}
  `;
}
function toggleTaskCompletion(id) { // Toggle Completion
  const task = tasks.find((t) => t.id == id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}
function saveTasks() {  // Save Tasks to LocalStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
function loadTasks() {  // Load Tasks
  renderTasks();
}
function updateDateTime() {
  const dateTimeElement = document.getElementById('live-date-time');
  const now = new Date();
  // Convert to IST (Indian Standard Time)
  const options = { timeZone: 'Asia/Kolkata', hour12: true };
  const dateFormatter = new Intl.DateTimeFormat('en-IN', {
    ...options,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const timeFormatter = new Intl.DateTimeFormat('en-IN', {
    ...options,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const date = dateFormatter.format(now);
  const time = timeFormatter.format(now);
  dateTimeElement.textContent = `| ${date} ${time}`;
}
// Update every second
setInterval(updateDateTime, 1000);
updateDateTime(); // Call immediately to set the time initially