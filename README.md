# Counter-Strike Team Generator

A simple web application for generating balanced Counter-Strike teams with cloud sync capabilities.

## Features

- ➕ Add players by name
- ❌ Remove individual players
- 🎲 Random team generation
- 🔴 Terrorist team
- 🔵 Counter-Terrorist team
- ☁️ Cloud sync with Supabase (optional)
- 📊 Team history tracking
- 📱 Responsive design

## How to Use

1. Open `index.html` in your web browser
2. Add player names using the input field
3. Click "Generate Teams" to randomly distribute players into T and CT teams
4. Click "Clear All" to start over

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Supabase (optional - for cloud sync and data persistence)

## Running the Application

Simply open the `index.html` file in any modern web browser. No server or build process required!

Alternatively, you can use a local server:
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000`

## Supabase Setup (Optional)

To enable cloud sync and team history:

1. Follow the detailed instructions in [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
2. Create a Supabase project at [supabase.com](https://supabase.com)
3. Run the SQL commands to create tables
4. Update `supabase-config.js` with your project credentials

The app works perfectly fine without Supabase - it will use local browser storage instead.
