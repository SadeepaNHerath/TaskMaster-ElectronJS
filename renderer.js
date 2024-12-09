const PRIORITY_LEVELS = {
  LOW: { value: 'low', label: 'Low', color: '#4CAF50' },
  MEDIUM: { value: 'medium', label: 'Medium', color: '#FFC107' },
  HIGH: { value: 'high', label: 'High', color: '#F44336' }
};

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function createElement(tag, className, text = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error writing to localStorage:', e);
    }
  }
};

class TodoList {
  constructor() {
    this.todos = storage.get('todos', []);
    this.filter = 'all';
    this.searchTerm = '';
    this.sortBy = 'date';
  }

  addTodo(text, priority = 'medium') {
    const todo = {
      id: Date.now(),
      text,
      completed: false,
      priority,
      createdAt: new Date().toISOString(),
      dueDate: null,
      tags: []
    };
    this.todos.unshift(todo);
    this.save();
    return todo;
  }

  updateTodo(id, updates) {
    const todo = this.todos.find(todo => todo.id === id);
    if (todo) {
      Object.assign(todo, updates);
      this.save();
    }
  }

  toggleTodo(id) {
    const todo = this.todos.find(todo => todo.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      todo.completedAt = todo.completed ? new Date().toISOString() : null;
      this.save();
    }
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(todo => todo.id !== id);
    this.save();
  }

  clearCompleted() {
    this.todos = this.todos.filter(todo => !todo.completed);
    this.save();
  }

  addTag(todoId, tag) {
    const todo = this.todos.find(todo => todo.id === todoId);
    if (todo && !todo.tags.includes(tag)) {
      todo.tags.push(tag);
      this.save();
    }
  }

  removeTag(todoId, tag) {
    const todo = this.todos.find(todo => todo.id === todoId);
    if (todo) {
      todo.tags = todo.tags.filter(t => t !== tag);
      this.save();
    }
  }

  setDueDate(todoId, date) {
    const todo = this.todos.find(todo => todo.id === todoId);
    if (todo) {
      todo.dueDate = date;
      this.save();
    }
  }

  getFilteredAndSortedTodos() {
    let filteredTodos = [...this.todos];

    switch (this.filter) {
      case 'active':
        filteredTodos = filteredTodos.filter(todo => !todo.completed);
        break;
      case 'completed':
        filteredTodos = filteredTodos.filter(todo => todo.completed);
        break;
      case 'high-priority':
        filteredTodos = filteredTodos.filter(todo => todo.priority === 'high');
        break;
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filteredTodos = filteredTodos.filter(todo => 
        todo.text.toLowerCase().includes(term) ||
        todo.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    switch (this.sortBy) {
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        filteredTodos.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        break;
      case 'alphabetical':
        filteredTodos.sort((a, b) => a.text.localeCompare(b.text));
        break;
      case 'dueDate':
        filteredTodos.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });
        break;
      default: // date
        filteredTodos.sort((a, b) => b.id - a.id);
    }

    return filteredTodos;
  }

  setFilter(filter) {
    this.filter = filter;
  }

  setSearchTerm(term) {
    this.searchTerm = term;
  }

  setSortBy(sortBy) {
    this.sortBy = sortBy;
  }

  getActiveCount() {
    return this.todos.filter(todo => !todo.completed).length;
  }

  getTotalCount() {
    return this.todos.length;
  }

  getCompletedCount() {
    return this.todos.filter(todo => todo.completed).length;
  }

  save() {
    storage.set('todos', this.todos);
  }
}

class TodoUI {
  constructor(todoList) {
    this.todoList = todoList;
    this.initializeElements();
    this.setupEventListeners();
    this.setupSearchDebounce();
  }

  initializeElements() {
    this.todoForm = document.getElementById('todo-form');
    this.todoInput = document.getElementById('todo-input');
    this.prioritySelect = document.getElementById('priority-select');
    this.todoListElement = document.getElementById('todo-list');
    this.itemsLeft = document.getElementById('items-left');
    this.clearCompletedBtn = document.getElementById('clear-completed');
    this.searchInput = document.getElementById('search-input');
    this.sortSelect = document.getElementById('sort-select');
    this.progressBar = document.getElementById('progress-bar');
  }

  setupEventListeners() {
    this.todoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = this.todoInput.value.trim();
      const priority = this.prioritySelect.value;
      if (text) {
        this.todoList.addTodo(text, priority);
        this.todoInput.value = '';
        this.renderTodos();
      }
    });

    this.todoListElement.addEventListener('click', (e) => {
      const todoItem = e.target.closest('.todo-item');
      if (!todoItem) return;

      const id = Number(todoItem.dataset.id);

      if (e.target.classList.contains('todo-checkbox')) {
        this.todoList.toggleTodo(id);
        this.renderTodos();
      } else if (e.target.classList.contains('todo-delete')) {
        todoItem.classList.add('slide-out');
        setTimeout(() => {
          this.todoList.deleteTodo(id);
          this.renderTodos();
        }, 300);
      } else if (e.target.classList.contains('todo-tag')) {
        const tag = e.target.textContent;
        this.todoList.removeTag(id, tag);
        this.renderTodos();
      }
    });

    this.clearCompletedBtn.addEventListener('click', () => {
      this.todoList.clearCompleted();
      this.renderTodos();
    });

    this.sortSelect.addEventListener('change', (e) => {
      this.todoList.setSortBy(e.target.value);
      this.renderTodos();
    });

    this.todoListElement.addEventListener('keypress', (e) => {
      if (e.target.classList.contains('tag-input') && e.key === 'Enter') {
        e.preventDefault();
        const todoId = Number(e.target.closest('.todo-item').dataset.id);
        const tag = e.target.value.trim();
        if (tag) {
          this.todoList.addTag(todoId, tag);
          e.target.value = '';
          this.renderTodos();
        }
      }
    });

    this.todoListElement.addEventListener('change', (e) => {
      if (e.target.classList.contains('due-date-input')) {
        const todoId = Number(e.target.closest('.todo-item').dataset.id);
        this.todoList.setDueDate(todoId, e.target.value);
        this.renderTodos();
      }
    });

    document.querySelectorAll('.todo-filters button').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.todo-filters button').forEach(btn => 
          btn.classList.remove('active')
        );
        button.classList.add('active');
        this.todoList.setFilter(button.dataset.filter);
        this.renderTodos();
      });
    });
  }

  setupSearchDebounce() {
    let searchTimeout;
    this.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.todoList.setSearchTerm(e.target.value);
        this.renderTodos();
      }, 300);
    });
  }

  renderTodos() {
    const todos = this.todoList.getFilteredAndSortedTodos();
    this.todoListElement.innerHTML = '';
    
    todos.forEach(todo => {
      const todoElement = this.createTodoElement(todo);
      this.todoListElement.appendChild(todoElement);
    });
    
    this.updateStats();
    this.updateProgressBar();
  }

  createTodoElement(todo) {
    const li = createElement('li', `todo-item ${todo.completed ? 'completed' : ''}`);
    li.dataset.id = todo.id;
    li.dataset.priority = todo.priority;

    const checkbox = createElement('input', 'todo-checkbox');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;

    const textDiv = createElement('div', 'todo-content');
    const text = createElement('span', 'todo-text', todo.text);
    
    const priorityBadge = createElement('span', `priority-badge ${todo.priority}`);
    priorityBadge.style.backgroundColor = PRIORITY_LEVELS[todo.priority.toUpperCase()].color;
    priorityBadge.textContent = PRIORITY_LEVELS[todo.priority.toUpperCase()].label;

    const dateSpan = createElement('span', 'todo-date', formatDate(new Date(todo.createdAt)));

    const tagsContainer = createElement('div', 'tags-container');
    todo.tags.forEach(tag => {
      const tagSpan = createElement('span', 'todo-tag', tag);
      tagsContainer.appendChild(tagSpan);
    });

    const tagInput = createElement('input', 'tag-input');
    tagInput.type = 'text';
    tagInput.placeholder = 'Add tag...';

    const dueDateInput = createElement('input', 'due-date-input');
    dueDateInput.type = 'date';
    dueDateInput.value = todo.dueDate || '';

    const deleteBtn = createElement('button', 'todo-delete', 'Delete');

    textDiv.append(text, priorityBadge, dateSpan);
    li.append(checkbox, textDiv, tagsContainer, tagInput, dueDateInput, deleteBtn);

    return li;
  }

  updateStats() {
    const activeCount = this.todoList.getActiveCount();
    const totalCount = this.todoList.getTotalCount();
    const completedCount = this.todoList.getCompletedCount();

    this.itemsLeft.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
    
    const completionPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
    document.getElementById('completion-percentage').textContent = `${completionPercentage}% Complete`;
  }

  updateProgressBar() {
    const totalCount = this.todoList.getTotalCount();
    const completedCount = this.todoList.getCompletedCount();
    const percentage = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;
    
    this.progressBar.style.width = `${percentage}%`;
    this.progressBar.style.backgroundColor = percentage === 100 ? '#4CAF50' : '#4a90e2';
  }
}

const todoList = new TodoList();
const todoUI = new TodoUI(todoList);

todoUI.renderTodos();