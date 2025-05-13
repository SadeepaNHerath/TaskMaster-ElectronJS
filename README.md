# TaskMaster

A professional task management application built with ElectronJS.

## Features

- **Intuitive Task Management**: Easily add, edit, and delete tasks 
- **Priority Levels**: Set Low, Medium, or High priority for your tasks
- **Categories**: Organize tasks by categories (Work, Personal, Shopping, Health, etc.)
- **Filtering & Sorting**: Filter by status, priority, or category and sort by date, priority, alphabetical order, or due date
- **Tags**: Add custom tags to tasks for better organization
- **Due Dates**: Set due dates for tasks and get reminders
- **Dark Mode**: Toggle between light and dark themes
- **Data Management**: Export and import your tasks
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Screenshots

![Task Master2](https://github.com/user-attachments/assets/52558aa7-574f-4ad4-8c0c-180927a190b0)

![Task Master1](https://github.com/user-attachments/assets/4d265311-36d9-40e8-beae-1c370dc3c14c)

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or newer)
- npm (comes with Node.js)

### Installation Steps

1. Clone this repository:
   ```
   git clone https://github.com/SadeepaNHerath/TaskMaster-ElectronJS.git
   ```

2. Navigate to the project directory:
   ```
   cd TaskMaster-ElectronJS
   ```

3. Install dependencies:
   ```
   npm install
   ```

## Usage

### Running the Application

To start the application in development mode:

```
npm run dev
```

For Windows-specific development:

```
npm run dev-win
```

To start the application normally:

```
npm start
```

### Building for Distribution

To create distributable packages for different platforms:

For Windows:
```
npm run package-win
```

For macOS:
```
npm run package-mac
```

For Linux:
```
npm run package-linux
```

The packaged applications will be available in the `dist` folder.

## Development

### Architecture

TaskMaster follows the Electron architecture with main and renderer processes:

- **Main Process** (`index.js`): Handles native operations like file system access, notifications, and window management
- **Preload Script** (`preload.js`): Provides secure IPC bridge between main and renderer processes
- **Renderer Process** (`renderer.js`): Implements the UI logic and user interactions

### Technologies Used

- **Electron**: Cross-platform desktop app framework
- **HTML/CSS/JavaScript**: Frontend UI and logic
- **electron-store**: Persistent data storage
- **electron-updater**: Auto-update functionality
- **electron-log**: Logging utility

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Acknowledgments

- Created by Sadeepa Herath
- Built using [Electron](https://www.electronjs.org/)

## Contact

Sadeepa Herath - [GitHub](https://github.com/SadeepaNHerath)
