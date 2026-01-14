// Supabase Configuration
// Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // e.g., https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client
let supabaseClient = null;

function initSupabase() {
    try {
        if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
            console.warn('⚠️ Supabase not configured. Using local storage only.');
            return false;
        }
        
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase connected successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        return false;
    }
}

// Save players to Supabase
async function savePlayers(playersList) {
    if (!supabaseClient) return false;
    
    try {
        const { data, error } = await supabaseClient
            .from('players')
            .upsert(playersList.map(name => {
                const stats = playerStats[name] || {};
                return {
                    name,
                    nicknames: stats.nicknames || [name],
                    active_nickname: stats.active_nickname || name,
                    total_kills: stats.total_kills || 0,
                    total_deaths: stats.total_deaths || 0,
                    games_played: stats.games_played || 0,
                    average_kd: stats.average_kd || 0.0
                };
            }), { 
                onConflict: 'name',
                ignoreDuplicates: true 
            });
        
        if (error) throw error;
        console.log('✅ Players saved to Supabase');
        return true;
    } catch (error) {
        console.error('❌ Error saving players:', error);
        return false;
    }
}

// Load players from Supabase
async function loadPlayers() {
    if (!supabaseClient) return [];
    
    try {
        const { data, error } = await supabaseClient
            .from('players')
            .select('*')
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        console.log('✅ Players loaded from Supabase');
        return data;
    } catch (error) {
        console.error('❌ Error loading players:', error);
        return [];
    }
}

// Get player statistics
async function getPlayerStats(playerName) {
    if (!supabaseClient) return null;
    
    try {
        const { data, error } = await supabaseClient
            .from('players')
            .select('*')
            .eq('name', playerName)
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('❌ Error getting player stats:', error);
        return null;
    }
}

// Save match results with K/D for each player
async function saveMatchResults(matchData) {
    if (!supabaseClient) return false;
    
    try {
        // Update each player's statistics
        for (const playerResult of matchData.playerResults) {
            const { name, kills, deaths } = playerResult;
            
            // Get current player stats
            const currentStats = await getPlayerStats(name);
            if (!currentStats) {
                console.warn(`Player ${name} not found in database`);
                continue;
            }
            
            // Calculate new totals
            const newTotalKills = (currentStats.total_kills || 0) + kills;
            const newTotalDeaths = (currentStats.total_deaths || 0) + deaths;
            const newGamesPlayed = (currentStats.games_played || 0) + 1;
            const newAverageKD = newTotalDeaths > 0 ? (newTotalKills / newTotalDeaths).toFixed(2) : newTotalKills.toFixed(2);
            
            // Update player stats
            const { error: updateError } = await supabaseClient
                .from('players')
                .update({
                    total_kills: newTotalKills,
                    total_deaths: newTotalDeaths,
                    games_played: newGamesPlayed,
                    average_kd: parseFloat(newAverageKD)
                })
                .eq('name', name);
            
            if (updateError) throw updateError;
        }
        
        // Save match to history
        const { error: historyError } = await supabaseClient
            .from('match_history')
            .insert([{
                t_team: matchData.tTeam,
                ct_team: matchData.ctTeam,
                player_stats: matchData.playerResults,
                winner: matchData.winner,
                played_at: new Date().toISOString()
            }]);
        
        if (historyError) throw historyError;
        
        console.log('✅ Match results saved successfully');
        return true;
    } catch (error) {
        console.error('❌ Error saving match results:', error);
        return false;
    }
}

// Get all players with stats sorted by K/D
async function getPlayerLeaderboard() {
    if (!supabaseClient) return [];
    
    try {
        const { data, error } = await supabaseClient
            .from('players')
            .select('*')
            .order('average_kd', { ascending: false });
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('❌ Error loading leaderboard:', error);
        return [];
    }
}

// Save generated teams to history
async function saveTeamGeneration(tTeam, ctTeam) {
    if (!supabaseClient) return false;
    
    try {
        const { data, error } = await supabaseClient
            .from('team_history')
            .insert([{
                t_team: tTeam,
                ct_team: ctTeam,
                generated_at: new Date().toISOString()
            }])
            .select()
            .single();
        
        if (error) throw error;
        console.log('✅ Team generation saved to history');
        
        // Store the last generated match ID for later stats entry
        window.lastGeneratedMatchId = data.id;
        return data.id;
    } catch (error) {
        console.error('❌ Error saving team generation:', error);
        return false;
    }
}

// Load team history
async function loadTeamHistory(limit = 10) {
    if (!supabaseClient) return [];
    
    try {
        const { data, error } = await supabaseClient
            .from('match_history')
            .select('*')
            .order('played_at', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('❌ Error loading team history:', error);
        return [];
    }
}

// Delete a player
async function deletePlayer(playerName) {
    if (!supabaseClient) return false;
    
    try {
        const { error } = await supabaseClient
            .from('players')
            .delete()
            .eq('name', playerName);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('❌ Error deleting player:', error);
        return false;
    }
}

// Clear all players from database
async function clearAllPlayers() {
    if (!supabaseClient) return false;
    
    try {
        const { error } = await supabaseClient
            .from('players')
            .delete()
            .neq('name', ''); // Delete all records
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('❌ Error clearing players:', error);
        return false;
    }
}
