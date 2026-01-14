let players = ['NiKo', 's1mple', 'ZywOo', 'device', 'electronic', 'm0NESY', 'Twistzz', 'ropz', 'frozen', 'jks'];
let playerStats = {
    'NiKo': { total_kills: 245, total_deaths: 198, games_played: 12, average_kd: 1.24, nicknames: ['NiKo', 'Nikola'], active_nickname: 'NiKo' },
    's1mple': { total_kills: 312, total_deaths: 205, games_played: 15, average_kd: 1.52, nicknames: ['s1mple', 'Sasha'], active_nickname: 's1mple' },
    'ZywOo': { total_kills: 289, total_deaths: 211, games_played: 14, average_kd: 1.37, nicknames: ['ZywOo', 'Mathieu'], active_nickname: 'ZywOo' },
    'device': { total_kills: 198, total_deaths: 187, games_played: 10, average_kd: 1.06, nicknames: ['device', 'dev1ce'], active_nickname: 'device' },
    'electronic': { total_kills: 221, total_deaths: 203, games_played: 11, average_kd: 1.09, nicknames: ['electronic', 'Denis'], active_nickname: 'electronic' },
    'm0NESY': { total_kills: 267, total_deaths: 189, games_played: 13, average_kd: 1.41, nicknames: ['m0NESY', 'Ilya'], active_nickname: 'm0NESY' },
    'Twistzz': { total_kills: 234, total_deaths: 201, games_played: 12, average_kd: 1.16, nicknames: ['Twistzz', 'Russel'], active_nickname: 'Twistzz' },
    'ropz': { total_kills: 210, total_deaths: 195, games_played: 11, average_kd: 1.08, nicknames: ['ropz', 'Robin'], active_nickname: 'ropz' },
    'frozen': { total_kills: 188, total_deaths: 176, games_played: 10, average_kd: 1.07, nicknames: ['frozen', 'David'], active_nickname: 'frozen' },
    'jks': { total_kills: 203, total_deaths: 198, games_played: 11, average_kd: 1.03, nicknames: ['jks', 'Justin'], active_nickname: 'jks' }
};
let isSupabaseEnabled = false;
let currentMatch = null; // Store current match data
let selectedWinner = null;

// Mock players for testing (not saved to database)
const MOCK_PLAYERS = [
    { name: 'NiKo', kills: 245, deaths: 198, games: 12, kd: 1.24 },
    { name: 's1mple', kills: 312, deaths: 205, games: 15, kd: 1.52 },
    { name: 'ZywOo', kills: 289, deaths: 211, games: 14, kd: 1.37 },
    { name: 'device', kills: 198, deaths: 187, games: 10, kd: 1.06 },
    { name: 'electronic', kills: 221, deaths: 203, games: 11, kd: 1.09 },
    { name: 'm0NESY', kills: 267, deaths: 189, games: 13, kd: 1.41 },
    { name: 'Twistzz', kills: 234, deaths: 201, games: 12, kd: 1.16 },
    { name: 'ropz', kills: 210, deaths: 195, games: 11, kd: 1.08 },
    { name: 'frozen', kills: 188, deaths: 176, games: 10, kd: 1.07 },
    { name: 'jks', kills: 203, deaths: 198, games: 11, kd: 1.03 }
];

function loadMockPlayers() {
    MOCK_PLAYERS.forEach(player => {
        players.push(player.name);
        playerStats[player.name] = {
            total_kills: player.kills,
            total_deaths: player.deaths,
            games_played: player.games,
            average_kd: player.kd
        };
    });
    console.log('✅ Loaded 10 mock players for testing');
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', async () => {
    isSupabaseEnabled = initSupabase();
    
    if (isSupabaseEnabled) {
        // Load players from Supabase
        const loadedPlayers = await loadPlayers();
        if (loadedPlayers.length > 0) {
            loadedPlayers.forEach(player => {
                players.push(player.name);
                playerStats[player.name] = {
                    total_kills: player.total_kills || 0,
                    total_deaths: player.total_deaths || 0,
                    games_played: player.games_played || 0,
                    average_kd: player.average_kd || 0
                };
            });
            updatePlayersList();
        } else {
            // Load mock players if no players in database
            loadMockPlayers();
            updatePlayersList();
        }
        updateSyncButton();
    } else {
        // Load mock players if Supabase is not enabled
        loadMockPlayers();
        updatePlayersList();
    }
    
    // Initialize ranked list on load
    updateRankedPlayersList();
});

function addPlayer() {
    const input = document.getElementById('playerInput');
    const playerName = input.value.trim();
    
    if (playerName === '') {
        alert('Please enter a player name!');
        return;
    }
    
    if (players.includes(playerName)) {
        alert('This player is already added!');
        return;
    }
    
    players.push(playerName);
    input.value = '';
    updatePlayersList();
    input.focus();
    
    // Save to Supabase if enabled
    if (isSupabaseEnabled) {
        savePlayers(players);
    }
}

async function removePlayer(playerName) {
    players = players.filter(p => p !== playerName);
    updatePlayersList();
    
    // Delete from Supabase if enabled
    if (isSupabaseEnabled) {
        await deletePlayer(playerName);
    }
    
    // Hide teams if no players left
    if (players.length === 0) {
        document.getElementById('teamsSection').classList.remove('show');
    }
}

function updatePlayersList() {
    const playersList = document.getElementById('playersList');
    const playerCount = document.getElementById('playerCount');
    
    playerCount.textContent = players.length;
    
    if (players.length === 0) {
        playersList.innerHTML = '<li style="color: #999;">No players added yet</li>';
        return;
    }
    
    playersList.innerHTML = players.map(player => {
        const stats = playerStats[player];
        const kdText = stats ? ` (K/D: ${stats.average_kd})` : '';
        const activeNick = stats?.active_nickname || player;
        const nickCount = stats?.nicknames?.length || 0;
        
        return `
            <li>
                <span class="player-name">
                    ${player}
                    ${activeNick !== player ? `<span class="active-nick"> → ${activeNick}</span>` : ''}
                    ${kdText}
                    ${nickCount > 1 ? `<span class="nick-count"> (${nickCount} nicks)</span>` : ''}
                </span>
                <div class="player-actions">
                    <button class="manage-nick-btn" onclick="manageNicknames('${player}')" title="Manage nicknames">👤</button>
                    <button class="remove-btn" onclick="removePlayer('${player}')">×</button>
                </div>
            </li>
        `;
    }).join('');
    
    // Update ranked list
    updateRankedPlayersList();
}

function manageNicknames(playerName) {
    const stats = playerStats[playerName];
    const currentNicknames = stats?.nicknames || [playerName];
    const activeNick = stats?.active_nickname || playerName;
    
    const nicknamesList = currentNicknames.map((nick, idx) => 
        `${idx + 1}. ${nick}${nick === activeNick ? ' (active)' : ''}`
    ).join('\n');
    
    const action = prompt(
        `Manage nicknames for: ${playerName}\n\nCurrent nicknames:\n${nicknamesList}\n\n` +
        `Options:\n` +
        `- Type "add:nickname" to add new nickname\n` +
        `- Type "set:nickname" to set active nickname\n` +
        `- Type "remove:nickname" to remove nickname\n` +
        `- Press Cancel to close`
    );
    
    if (!action) return;
    
    const [command, value] = action.split(':').map(s => s.trim());
    
    if (!stats.nicknames) {
        stats.nicknames = [playerName];
    }
    
    switch(command.toLowerCase()) {
        case 'add':
            if (value && !stats.nicknames.includes(value)) {
                stats.nicknames.push(value);
                alert(`✅ Added nickname "${value}" for ${playerName}`);
                updatePlayersList();
            } else {
                alert('❌ Nickname already exists or is empty');
            }
            break;
            
        case 'set':
            if (value && stats.nicknames.includes(value)) {
                stats.active_nickname = value;
                alert(`✅ Set active nickname to "${value}" for ${playerName}`);
                updatePlayersList();
            } else {
                alert('❌ Nickname not found in list');
            }
            break;
            
        case 'remove':
            if (value && stats.nicknames.includes(value)) {
                if (stats.nicknames.length === 1) {
                    alert('❌ Cannot remove last nickname');
                } else {
                    stats.nicknames = stats.nicknames.filter(n => n !== value);
                    if (stats.active_nickname === value) {
                        stats.active_nickname = stats.nicknames[0];
                    }
                    alert(`✅ Removed nickname "${value}" for ${playerName}`);
                    updatePlayersList();
                }
            } else {
                alert('❌ Nickname not found in list');
            }
            break;
            
        default:
            alert('❌ Unknown command. Use add:, set:, or remove:');
    }
}

function updateRankedPlayersList() {
    const rankedList = document.getElementById('rankedPlayersList');
    
    if (players.length === 0) {
        rankedList.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">No players yet</div>';
        return;
    }
    
    // Sort players by K/D (descending)
    const sortedPlayers = [...players].sort((a, b) => {
        const kdA = playerStats[a]?.average_kd || 0;
        const kdB = playerStats[b]?.average_kd || 0;
        return kdB - kdA;
    });
    
    rankedList.innerHTML = sortedPlayers.map((player, index) => {
        const stats = playerStats[player] || { average_kd: 0, games_played: 0, total_kills: 0, total_deaths: 0, active_nickname: player };
        const isTop3 = index < 3;
        const displayName = stats.active_nickname || player;
        
        return `
            <div class="ranked-player-item">
                <div class="rank-number ${isTop3 ? 'top3' : ''}">${index + 1}</div>
                <div class="ranked-player-info">
                    <div class="ranked-player-name">${displayName}</div>
                    <div class="ranked-player-stats">
                        <span class="stat-item">
                            <span class="stat-kd">${stats.average_kd.toFixed(2)}</span> K/D
                        </span>
                        <span class="stat-item">
                            <span class="stat-games">${stats.games_played}</span> games
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function generateTeams() {
    if (players.length < 2) {
        alert('You need at least 2 players to generate teams!');
        return;
    }
    
    // Sort players by K/D ratio (descending)
    const sortedPlayers = [...players].sort((a, b) => {
        const kdA = playerStats[a]?.average_kd || 0;
        const kdB = playerStats[b]?.average_kd || 0;
        return kdB - kdA;
    });
    
    // Balanced team distribution (snake draft)
    const tTeam = [];
    const ctTeam = [];
    
    sortedPlayers.forEach((player, index) => {
        if (index % 2 === 0) {
            tTeam.push(player);
        } else {
            ctTeam.push(player);
        }
    });
    
    // Reverse every other pair for better balance (snake pattern)
    if (sortedPlayers.length >= 4) {
        for (let i = 0; i < Math.floor(sortedPlayers.length / 4); i++) {
            const startIdx = i * 2;
            if (startIdx + 1 < tTeam.length) {
                [tTeam[startIdx], tTeam[startIdx + 1]] = [tTeam[startIdx + 1], tTeam[startIdx]];
            }
        }
    }
    
    displayTeams(tTeam, ctTeam);
}

async function displayTeams(tTeam, ctTeam) {
    const tTeamList = document.getElementById('tTeam');
    const ctTeamList = document.getElementById('ctTeam');
    const teamsSection = document.getElementById('teamsSection');
    
    // Calculate total K/D for each team
    const tTeamKD = tTeam.reduce((sum, player) => sum + (playerStats[player]?.average_kd || 0), 0);
    const ctTeamKD = ctTeam.reduce((sum, player) => sum + (playerStats[player]?.average_kd || 0), 0);
    
    // Update team headers with total K/D
    document.querySelector('.terrorist-team h2').innerHTML = `🔴 Terrorist <span class="team-kd">(${tTeamKD.toFixed(2)})</span>`;
    document.querySelector('.ct-team h2').innerHTML = `🔵 Counter-Terrorist <span class="team-kd">(${ctTeamKD.toFixed(2)})</span>`;
    
    tTeamList.innerHTML = tTeam.map((player, index) => {
        const stats = playerStats[player] || { average_kd: 0, active_nickname: player };
        const displayName = stats.active_nickname || player;
        const kd = stats.average_kd || 0;
        return `
        <li>${index + 1}. ${displayName} <span class="player-kd">(${kd.toFixed(2)})</span></li>
    `}).join('');
    
    ctTeamList.innerHTML = ctTeam.map((player, index) => {
        const stats = playerStats[player] || { average_kd: 0, active_nickname: player };
        const displayName = stats.active_nickname || player;
        const kd = stats.average_kd || 0;
        return `
        <li>${index + 1}. ${displayName} <span class="player-kd">(${kd.toFixed(2)})</span></li>
    `}).join('');
    
    teamsSection.classList.add('show');
    
    // Store current match data
    currentMatch = { tTeam, ctTeam };
    
    // Save team generation to history if Supabase is enabled
    if (isSupabaseEnabled) {
        await saveTeamGeneration(tTeam, ctTeam);
        // Show match results entry section
        showMatchResultsEntry(tTeam, ctTeam);
    }
    
    // Scroll to teams
    teamsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showMatchResultsEntry(tTeam, ctTeam) {
    const matchResultsSection = document.getElementById('matchResultsSection');
    const playerStatsInput = document.getElementById('playerStatsInput');
    
    selectedWinner = null; // use active nickname
    const allPlayers = [...tTeam, ...ctTeam];
    playerStatsInput.innerHTML = `
        <div class="stats-grid">
            ${allPlayers.map(player => {
                const stats = playerStats[player];
                const displayName = stats?.active_nickname || player;
                return `
                <div class="player-stat-input">
                    <label>${displayName}</label>
                    <div class="kd-inputs">
                        <input type="number" id="kills-${player}" placeholder="Kills" min="0" value="0" />
                        <span>/</span>
                        <input type="number" id="deaths-${player}" placeholder="Deaths" min="0" value="0" />
                    </div>
                </div>
            `;
            }).join('')}
        </div>
    `;
    
    matchResultsSection.style.display = 'block';
    matchResultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function selectWinner(team) {
    selectedWinner = team;
    document.getElementById('winnerT').classList.toggle('selected', team === 'T');
    document.getElementById('winnerCT').classList.toggle('selected', team === 'CT');
}

async function submitMatchResults() {
    if (!currentMatch) {
        alert('No active match to submit results for!');
        return;
    }
    
    if (!selectedWinner) {
        alert('Please select the winning team!');
        return;
    }
    
    const allPlayers = [...currentMatch.tTeam, ...currentMatch.ctTeam];
    const playerResults = [];
    
    // Collect all player results
    for (const player of allPlayers) {
        const kills = parseInt(document.getElementById(`kills-${player}`).value) || 0;
        const deaths = parseInt(document.getElementById(`deaths-${player}`).value) || 0;
        
        playerResults.push({
            name: player,
            kills,
            deaths
        });
    }
    
    // Save to Supabase
    if (isSupabaseEnabled) {
        const matchData = {
            tTeam: currentMatch.tTeam,
            ctTeam: currentMatch.ctTeam,
            playerResults,
            winner: selectedWinner
        };
        
        const success = await saveMatchResults(matchData);
        
        if (success) {
            alert('✅ Match results saved successfully!');
            
            // Reload player stats
            const loadedPlayers = await loadPlayers();
            playerStats = {};
            loadedPlayers.forEach(player => {
                playerStats[player.name] = {
                    total_kills: player.total_kills || 0,
                    total_deaths: player.total_deaths || 0,
                    games_played: player.games_played || 0,
                    average_kd: player.average_kd || 0
                };
            });
            
            updatePlayersList();
            cancelMatchEntry();
        } else {
            alert('❌ Failed to save match results');
        }
    }
    
    // Update ranked list after match results
    updateRankedPlayersList();
}

function cancelMatchEntry() {
    document.getElementById('matchResultsSection').style.display = 'none';
    currentMatch = null;
    selectedWinner = null;
}

async function showLeaderboard() {
    const leaderboardContent = document.getElementById('leaderboardContent');
    const statsSection = document.getElementById('statsSection');
    
    if (!isSupabaseEnabled) {
        alert('Supabase is not configured!');
        return;
    }
    
    const leaderboard = await getPlayerLeaderboard();
    
    if (leaderboard.length === 0) {
        leaderboardContent.innerHTML = '<p>No statistics available yet.</p>';
    } else {
        leaderboardContent.innerHTML = `
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Games</th>
                        <th>Kills</th>
                        <th>Deaths</th>
                        <th>K/D Ratio</th>
                    </tr>
                </thead>
                <tbody>
                    ${leaderboard.map((player, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${player.name}</td>
                            <td>${player.games_played || 0}</td>
                            <td>${player.total_kills || 0}</td>
                            <td>${player.total_deaths || 0}</td>
                            <td class="kd-value">${player.average_kd || 0}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    statsSection.style.display = 'block';
    statsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function clearAll() {
    if (players.length === 0) {
        return;
    }
    
    if (confirm('Are you sure you want to clear all players?')) {
        players = [];
        updatePlayersList();
        document.getElementById('teamsSection').classList.remove('show');
        
        // Clear from Supabase if enabled
        if (isSupabaseEnabled) {
            await clearAllPlayers();
        }
    }
}

async function syncWithSupabase() {
    if (!isSupabaseEnabled) {
        alert('Supabase is not configured. Please check supabase-config.js file.');
        return;
    }
    
    const syncBtn = document.getElementById('syncBtn');
    const originalText = syncBtn.textContent;
    syncBtn.textContent = '⏳ Syncing...';
    syncBtn.disabled = true;
    
    try {
        // Load players from Supabase
        const loadedPlayers = await loadPlayers();
        
        if (loadedPlayers.length > 0) {
            players = loadedPlayers;
            updatePlayersList();
            alert(`✅ Synced ${loadedPlayers.length} players from cloud`);
        } else {
            // If no players in cloud, save current players
            if (players.length > 0) {
                await savePlayers(players);
                alert(`✅ Uploaded ${players.length} players to cloud`);
            } else {
                alert('No players to sync');
            }
        }
    } catch (error) {
        alert('Failed to sync with cloud: ' + error.message);
    } finally {
        syncBtn.textContent = originalText;
        syncBtn.disabled = false;
    }
}

function updateSyncButton() {
    const syncBtn = document.getElementById('syncBtn');
    if (syncBtn) {
        if (isSupabaseEnabled) {
            syncBtn.style.display = 'block';
        } else {
            syncBtn.style.display = 'none';
        }
    }
}

// Allow Enter key to add player
document.getElementById('playerInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addPlayer();
    }
});

// Initialize
updatePlayersList();
