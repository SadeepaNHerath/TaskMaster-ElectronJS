const webStorage = {
  async get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Error reading from local storage:', e);
      return defaultValue;
    }
  },

  async set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Error writing to local storage:', e);
    }
  }
};

const webNotification = {
  show(title, body) {
    if (!("Notification" in window)) {
      alert(`${title}: ${body}`);
      return;
    }

    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, { body });
        }
      });
    }
  }
};

const webFileHandler = {
  async exportTodos() {
    try {
      const todos = await webStorage.get('todos', []);
      const data = JSON.stringify(todos, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      
      if (window.saveAs) {
        window.saveAs(blob, 'taskmaster-backup.json');
        return { success: true, message: 'Tasks exported successfully' };
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'taskmaster-backup.json';
        a.click();
        URL.revokeObjectURL(url);
        return { success: true, message: 'Tasks exported successfully' };
      }
    } catch (error) {
      console.error('Error exporting todos:', error);
      return { success: false, message: `Export failed: ${error.message}` };
    }
  },

  async importTodos() {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = async (e) => {
        try {
          const file = e.target.files[0];
          if (!file) {
            resolve({ success: false, message: 'No file selected' });
            return;
          }
          
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const todos = JSON.parse(event.target.result);
              
              if (!Array.isArray(todos)) {
                resolve({ success: false, message: 'Invalid task data format' });
                return;
              }
              
              await webStorage.set('todos', todos);
              resolve({ success: true, message: 'Tasks imported successfully' });
            } catch (error) {
              console.error('Error parsing JSON:', error);
              resolve({ success: false, message: `Import failed: ${error.message}` });
            }
          };
          
          reader.readAsText(file);
        } catch (error) {
          console.error('Error importing todos:', error);
          resolve({ success: false, message: `Import failed: ${error.message}` });
        }
      };
      
      input.click();
    });
  }
};

window.electron = {
  store: webStorage,
  notification: webNotification,
  data: webFileHandler,
  app: {
    getVersion: () => '1.1.0-web',
    quit: () => {
      if (confirm('Do you want to close the application?')) {
        window.close();
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if ("Notification" in window && Notification.permission !== "granted") {
    document.body.addEventListener('click', () => {
      Notification.requestPermission();
    }, { once: true });
  }
});
