# 🤿 Dive Logbook

A personal web application for tracking and managing your underwater diving adventures. Log your dives, view statistics, and keep all your diving memories in one beautiful interface.

## ✨ Features

- **📝 Dive Logging** - Record detailed information about each dive including:
  - Date, time, and location
  - Dive site and type (Recreational, Training, Deep, Wreck, Night, Drift)
  - Maximum depth and duration
  - Water temperature and visibility
  - Dive buddy information
  - Personal notes and photos

- **📊 Statistics Dashboard** - Track your diving progress with:
  - Total dives logged
  - Maximum depth achieved
  - Total time underwater
  - Average depth across all dives
  - Interactive chart showing dives per month with customizable time horizons (6 months, 1 year, or all time)

- **🔍 Search & Sort** - Easily find specific dives by:
  - Searching by location or dive site
  - Sorting by date or depth

- **⚙️ Customizable Settings** - Choose your preferred units:
  - Temperature: Celsius or Fahrenheit
  - Distance: Meters or Feet

- **📸 Photo Upload** - Attach multiple photos to each dive log entry

- **✏️ Edit & Delete** - Full control to update or remove dive entries

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/fran-ces4/dive-logbook.git
cd dive-logbook
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

To create a production-ready build:
```bash
npm run build
```

The optimized files will be in the `dist` folder.

## 💾 Data Storage

This application uses **browser localStorage** to store your dive logs. This means:
- ✅ All your data stays private on your device
- ✅ No account or login required
- ✅ Works completely offline after initial load
- ⚠️ Data is device-specific (not synced across devices)
- ⚠️ Clearing browser data will delete your dive logs

**Tip:** To backup your data, you can export it from your browser's developer console by running:
```javascript
localStorage.getItem('dives')
```

## 🛠️ Built With

- **Vite** - Fast build tool and development server
- **Vanilla JavaScript** - Pure JavaScript, no frameworks
- **CSS3** - Modern styling with CSS variables and flexbox/grid
- **localStorage API** - Client-side data persistence

## 📱 Browser Compatibility

Works on all modern browsers that support:
- ES6+ JavaScript
- CSS Grid and Flexbox
- localStorage API

## 🎨 Design Features

- Clean, ocean-themed color scheme
- Responsive design that works on desktop and mobile
- Intuitive tabbed navigation
- Interactive charts and statistics
- Photo gallery with modal view

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome! Feel free to open an issue if you find bugs or have ideas for improvements.

## 📄 License

This project is open source and available for personal use.

## 👤 Author

**fran-ces4**
- GitHub: [@fran-ces4](https://github.com/fran-ces4)

## 🙏 Acknowledgments

Built as a learning project to practice web development fundamentals and create a useful tool for the diving community.

---

**Happy Diving!** 🌊
