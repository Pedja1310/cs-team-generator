# 🎮 Smederevski Kanter - CS Team Generator

A feature-rich web application for generating balanced Counter-Strike teams with comprehensive player statistics, K/D tracking, and cloud synchronization.

## ✨ Features

### Team Management
- 🎲 **Balanced Team Generation** - Snake draft algorithm for fair team distribution based on K/D ratios
- 📋 **Modal Player Selection** - Easy-to-use checkbox interface for match player selection
- 🔍 **Player Search** - Quick search functionality to find players instantly
- 🔴 **Terrorist Team** - Red team with player stats
- 🔵 **Counter-Terrorist Team** - Blue team with player stats

### Player Statistics & Rankings
- 📊 **K/D Tracking** - Comprehensive kill/death ratio tracking for all players
- 🏆 **Player Rankings** - Live rankings sidebar sorted by K/D performance
- 👤 **Player Registration** - Register new players with initial statistics
- 📈 **Stats Management** - Add match statistics (kills/deaths) to existing players
- 🎯 **Top 3 Highlighting** - Visual distinction for top-performing players
- 📄 **Pagination** - Rankings displayed in pages (5 players per page)
- ⚡ **Match Indicators** - Visual markers showing which players are in current match

### Data & Sync
- ☁️ **Cloud Sync with Supabase** - Optional real-time data synchronization
- 💾 **Auto-calculated K/D** - Database-level automatic K/D coefficient calculation
- 🔐 **Row Level Security** - Secure data access with Supabase policies
- 📱 **Responsive Design** - Optimized for desktop and mobile devices
- 🎨 **Dark Tactical Theme** - Professional CS-themed dark interface

## 🎯 How to Use

### Quick Start
1. Open `index.html` in your web browser
2. Browse the **Player Rankings** sidebar (20 pre-loaded CS pro players)
3. Click on players in the rankings to add/remove them from the match
4. Or use **"📋 Manage Players"** button to select players via modal
5. Click **"Generate Teams"** to create balanced teams using snake draft algorithm
6. View generated teams with individual player stats

### Player Management
- **Register New Player**: Click "👤 Register" to add new players with optional initial stats
- **Add Stats**: Click "📊 Add Stats" to update existing player statistics after matches
- **Toggle Match Participation**: Click any player in rankings to add/remove from current match
- **Search Players**: Use search bar in modal to quickly find specific players

### Rankings Navigation
- Navigate through player rankings using **‹** and **›** pagination buttons
- View 5 players per page
- Top 3 players highlighted with gold ranking badges
- Active match players shown with red indicator (●)

## 💻 Technologies

- **HTML5** - Semantic structure with modal components
- **CSS3** - Modern dark theme with gradients, animations, and responsive grid layout
- **Vanilla JavaScript** - No frameworks, pure ES6+ features
- **Supabase** - PostgreSQL database with auto-generated columns and Row Level Security
- **GitHub Actions** - Automated deployment to GitHub Pages

## 🏗️ Architecture

### Frontend
- **Modal System**: Registration forms, stats input, and player selection
- **Snake Draft Algorithm**: Balances teams by alternating player picks sorted by K/D
- **Pagination System**: Efficient rendering of large player lists
- **Real-time Updates**: Instant UI updates on player actions

### Backend (Supabase)
- **Auto-calculated Fields**: K/D ratio computed at database level using GENERATED columns
- **Triggers**: Automatic timestamp updates
- **Indexes**: Optimized queries for K/D sorting and nickname searches
- **Type**: BIGSERIAL ids, TEXT arrays for nicknames, DECIMAL for precise K/D values

## 🚀 Running the Application

### Local Development
Simply open the `index.html` file in any modern web browser. No server or build process required!

### Using Live Server (Recommended)
For auto-reload during development:
```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx live-server

# Using VS Code
# Install "Live Server" extension and click "Go Live"
```

### Production
The app is automatically deployed to GitHub Pages via GitHub Actions on every push to `main` branch.

Visit: `https://yourusername.github.io/cs-team-generator/`

## 🗄️ Supabase Setup (Optional)

To enable cloud sync, player statistics persistence, and real-time updates:

1. **Follow detailed instructions** in [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
2. **Create a Supabase project** at [supabase.com](https://supabase.com)
3. **Run SQL commands** to create tables with auto-generated K/D columns
4. **Update credentials** in `supabase-config.js` with your Project URL and API key

### Database Schema
- **players**: Auto-incrementing ids, unique names, nickname arrays, auto-calculated K/D
- **team_history**: Historical record of generated teams
- **match_history**: Match results with player statistics in JSONB format

The app works perfectly fine **without Supabase** - it uses 20 pre-loaded mock players locally. Supabase enables:
- ✅ Persistent player data across devices
- ✅ Real player registration and stat updates
- ✅ Cloud backup of match history
- ✅ Multi-user access to shared player pool

## 🎨 Customization

### Theme Colors
Edit `style.css` to change the color scheme. Primary colors:
- **Primary Red**: `#ff4444` - Main accent color
- **Dark Red**: `#cc0000` - Buttons and gradients  
- **Background**: `#0a0a0a` to `#1a1a1a` - Dark gradient
- **Borders**: `#2a2a2a` - Subtle separation

### Mock Players
Edit the `MOCK_PLAYERS` array in `script.js` to customize the default 20 players with your own names and statistics.

## 📝 Recent Updates

- ✅ Added player registration modal with nicknames support
- ✅ Added statistics management modal for updating K/D data
- ✅ Implemented pagination for player rankings (5 per page)
- ✅ Added click-to-toggle functionality in rankings sidebar
- ✅ Updated database schema with BIGSERIAL ids and auto-generated K/D
- ✅ Improved mobile responsive layout

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs via GitHub Issues
- Suggest new features
- Submit pull requests

## 📄 License

MIT License - feel free to use this project for your own CS team management needs!

---

**Built with ❤️ for the CS community**