// // // const express = require('express');
// // // const http = require('http');
// // // const { Server } = require('socket.io');
// // // const axios = require('axios');
// // // const Redis = require('ioredis');
// // // const path = require('path'); // File serve karne ke liye

// // // const app = express();
// // // const server = http.createServer(app);
// // // const io = new Server(server, { cors: { origin: '*' } });
// // // const redis = new Redis();

// // // const API_BASE_URL = 'http://200.97.175.210:4909';

// // // // Static files (CSS, JS, Images agar hon) serve karne ke liye
// // // app.use(express.static(path.join(__dirname, 'public')));

// // // // 🔥 SCORECARD ROUTE (Iframe me yeh URL use hoga)
// // // app.get('/scorecard', (req, res) => {
// // //     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// // // });

// // // // Map to store active match details: { "matchRoom": { eventId, matchName, date } }
// // // const activeMatches = new Map();
// // // let globalPollerInterval = null;

// // // // 1. Single API call to fetch match ID
// // // async function findMatchEventId(matchName, targetDate) {
// // //     try {
// // //         const response = await axios.get(`${API_BASE_URL}/matches`, { timeout: 3000 });
// // //         if (response.data?.data?.data) {
// // //             const matches = response.data.data.data;
// // //             const match = matches.find(m => {
// // //                 const nameMatch = m.eventName.toLowerCase().trim() === matchName.toLowerCase().trim();
// // //                 const dateMatch = m.eventTime.startsWith(targetDate);
// // //                 return nameMatch && dateMatch;
// // //             });
// // //             return match ? match.eventId : null;
// // //         }
// // //     } catch (error) {
// // //         console.error(`Error finding eventId for ${matchName}:`, error.message);
// // //     }
// // //     return null;
// // // }

// // // // 2. Fetch score for a single match
// // // async function fetchScoreForMatch(matchRoom, eventId) {
// // //     try {
// // //         const response = await axios.get(`${API_BASE_URL}/getScore?matchId=${eventId}`, { timeout: 3000 });
// // //         if (response.data && response.data.success) {
// // //             const scoreData = response.data.data.ScoreData.Score[0];
            
// // //             // Save in Redis & Broadcast to room
// // //             await redis.set(`score:${matchRoom}`, JSON.stringify(scoreData), 'EX', 60);
// // //             io.to(matchRoom).emit('scoreUpdate', scoreData);
// // //             return { matchRoom, status: 'success' };
// // //         }
// // //     } catch (error) {
// // //         console.error(`Failed to fetch score for ${matchRoom} (${eventId}):`, error.message);
// // //         throw error;
// // //     }
// // // }

// // // // 3. Central Parallel Loop (Promise.allSettled)
// // // function startGlobalPoller() {
// // //     if (globalPollerInterval) return;

// // //     console.log("🚀 Starting Global Parallel Poller Loop...");

// // //     globalPollerInterval = setInterval(async () => {
// // //         if (activeMatches.size === 0) {
// // //             console.log("🛑 No active matches with users. Pausing Global Loop.");
// // //             clearInterval(globalPollerInterval);
// // //             globalPollerInterval = null;
// // //             return;
// // //         }

// // //         const scorePromises = [];

// // //         for (const [matchRoom, matchDetails] of activeMatches.entries()) {
// // //             if (matchDetails.eventId) {
// // //                 scorePromises.push(fetchScoreForMatch(matchRoom, matchDetails.eventId));
// // //             }
// // //         }

// // //         // 🔥 Saare matches ki API Parallel Hit hogi
// // //         if (scorePromises.length > 0) {
// // //             await Promise.allSettled(scorePromises);
// // //         }
// // //     }, 3000);
// // // }

// // // // 4. Socket Connection Logic
// // // io.on('connection', (socket) => {
// // //     socket.on('joinMatch', async ({ matchName, date }) => {
// // //         const matchRoom = `${matchName}_${date}`.replace(/\s+/g, '_');
        
// // //         socket.join(matchRoom);
// // //         socket.currentRoom = matchRoom;

// // //         // Instant Cached Data Dedo
// // //         const cachedScore = await redis.get(`score:${matchRoom}`);
// // //         if (cachedScore) {
// // //             socket.emit('scoreUpdate', JSON.parse(cachedScore));
// // //         }

// // //         if (!activeMatches.has(matchRoom)) {
// // //             const eventId = await findMatchEventId(matchName, date);
// // //             if (eventId) {
// // //                 activeMatches.set(matchRoom, { eventId, matchName, date });
// // //                 fetchScoreForMatch(matchRoom, eventId);
// // //             }
// // //         }

// // //         startGlobalPoller();
// // //     });

// // //     socket.on('disconnect', () => {
// // //         const matchRoom = socket.currentRoom;
        
// // //         if (matchRoom) {
// // //             setTimeout(() => {
// // //                 const roomSize = io.sockets.adapter.rooms.get(matchRoom)?.size || 0;
                
// // //                 if (roomSize === 0) {
// // //                     console.log(`🗑️ Removing empty match room from active list: ${matchRoom}`);
// // //                     activeMatches.delete(matchRoom);
// // //                 }
// // //             }, 3000);
// // //         }
// // //     });
// // // });

// // // server.listen(5001, () => console.log('Scorecard Backend running on port 5001'));



// // const express = require('express');
// // const http = require('http');
// // const { Server } = require('socket.io');
// // const axios = require('axios');
// // const Redis = require('ioredis');
// // const path = require('path');

// // const app = express();
// // const server = http.createServer(app);
// // const io = new Server(server, { cors: { origin: '*' } });
// // const redis = new Redis();

// // const API_BASE_URL = 'http://200.97.175.210:4909';

// // // Public folder serve karne ke liye
// // app.use(express.static(path.join(__dirname, 'public')));

// // // Scorecard Route
// // app.get('/scorecard', (req, res) => {
// //     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// // });

// // const activeMatches = new Map();
// // let globalPollerInterval = null;

// // // Helper: Name Sanitizer (Extra spaces remove + lowercase)
// // function sanitizeName(name) {
// //     if (!name) return '';
// //     return name.toString().toLowerCase().replace(/\s+/g, ' ').trim();
// // }

// // // Helper: Standardized Date Extractor (Formats string to YYYY-MM-DD)
// // function getStandardDate(dateStr) {
// //     if (!dateStr) return '';
// //     try {
// //         // Agar full ISO string aati hai (2026-07-25T14:00:00.000Z) ya normal (2026-07-25)
// //         const d = new Date(dateStr);
// //         if (!isNaN(d.getTime())) {
// //             return d.toISOString().split('T')[0]; // Yields "2026-07-25"
// //         }
// //     } catch (e) {
// //         // Fallback split
// //     }
// //     return dateStr.toString().split('T')[0];
// // }

// // // 1. Bulletproof Match Event ID Finder
// // // Smart & Flexible Match Event ID Finder
// // // Date Formatter: Formats ISO or Normal Date to YYYY-MM-DD
// // function getStandardDate(dateStr) {
// //     if (!dateStr) return '';
// //     try {
// //         const d = new Date(dateStr);
// //         if (!isNaN(d.getTime())) {
// //             return d.toISOString().split('T')[0];
// //         }
// //     } catch (e) {}
// //     return dateStr.toString().split('T')[0];
// // }

// // // Smart Match Event ID Finder with Fallback
// // async function findMatchEventId(matchName, rawDate) {
// //     try {
// //         const response = await axios.get(`${API_BASE_URL}/matches`, { timeout: 3000 });
        
// //         if (response.data?.data?.data) {
// //             const matches = response.data.data.data;
// //             const cleanTargetName = sanitizeName(matchName);
// //             const targetStandardDate = getStandardDate(rawDate);

// //             // 1. Strict Search: Name + Date Match
// //             let match = matches.find(m => {
// //                 const cleanApiName = sanitizeName(m.eventName);
// //                 const apiStandardDate = getStandardDate(m.eventTime);
// //                 return cleanApiName === cleanTargetName && apiStandardDate === targetStandardDate;
// //             });

// //             // 2. Fallback Search: Sirf Name Match (Date Mismatch Handling)
// //             if (!match) {
// //                 console.log(`⚠️ Date match missed (${targetStandardDate}). Searching by Name only...`);
// //                 match = matches.find(m => {
// //                     const cleanApiName = sanitizeName(m.eventName);
// //                     return cleanApiName === cleanTargetName || cleanApiName.includes(cleanTargetName);
// //                 });
// //             }

// //             if (match) {
// //                 console.log(`✅ Match Found! ID: ${match.eventId} | Name: "${match.eventName}" | Time: "${match.eventTime}"`);
// //                 return match.eventId;
// //             } else {
// //                 console.log(`❌ No match found in API for "${matchName}"`);
// //             }
// //         }
// //     } catch (error) {
// //         console.error(`Error finding eventId for ${matchName}:`, error.message);
// //     }
// //     return null;
// // }

// // // 2. Fetch Score API
// // async function fetchScoreForMatch(matchRoom, eventId) {
// //     try {
// //         const response = await axios.get(`${API_BASE_URL}/getScore?matchId=${eventId}`, { timeout: 3000 });
// //         if (response.data && response.data.success) {
// //             const scoreData = response.data.data.ScoreData.Score[0];
            
// //             await redis.set(`score:${matchRoom}`, JSON.stringify(scoreData), 'EX', 60);
// //             io.to(matchRoom).emit('scoreUpdate', scoreData);
// //             return { matchRoom, status: 'success' };
// //         }
// //     } catch (error) {
// //         console.error(`Failed to fetch score for ${matchRoom} (${eventId}):`, error.message);
// //         throw error;
// //     }
// // }

// // // 3. Central Parallel Poller
// // function startGlobalPoller() {
// //     if (globalPollerInterval) return;

// //     console.log("🚀 Starting Global Parallel Poller Loop...");

// //     globalPollerInterval = setInterval(async () => {
// //         if (activeMatches.size === 0) {
// //             console.log("🛑 No active matches. Pausing Global Loop.");
// //             clearInterval(globalPollerInterval);
// //             globalPollerInterval = null;
// //             return;
// //         }

// //         const scorePromises = [];

// //         for (const [matchRoom, matchDetails] of activeMatches.entries()) {
// //             if (matchDetails.eventId) {
// //                 scorePromises.push(fetchScoreForMatch(matchRoom, matchDetails.eventId));
// //             }
// //         }

// //         if (scorePromises.length > 0) {
// //             await Promise.allSettled(scorePromises);
// //         }
// //     }, 3000);
// // }

// // // 4. Socket Connection Logic
// // io.on('connection', (socket) => {
// //     socket.on('joinMatch', async ({ matchName, date }) => {
// //         // Clean room key banayenge taaki URL parameters change hone par duplicates na bane
// //         const stdDate = getStandardDate(date);
// //         const matchRoom = `${sanitizeName(matchName)}_${stdDate}`.replace(/\s+/g, '_');

// //         socket.join(matchRoom);
// //         socket.currentRoom = matchRoom;

// //         // Instant Cache
// //         const cachedScore = await redis.get(`score:${matchRoom}`);
// //         if (cachedScore) {
// //             socket.emit('scoreUpdate', JSON.parse(cachedScore));
// //         }

// //         if (!activeMatches.has(matchRoom)) {
// //             const eventId = await findMatchEventId(matchName, date);
// //             if (eventId) {
// //                 activeMatches.set(matchRoom, { eventId, matchName, date });
// //                 fetchScoreForMatch(matchRoom, eventId);
// //             }
// //         }

// //         startGlobalPoller();
// //     });

// //     socket.on('disconnect', () => {
// //         const matchRoom = socket.currentRoom;
// //         if (matchRoom) {
// //             setTimeout(() => {
// //                 const roomSize = io.sockets.adapter.rooms.get(matchRoom)?.size || 0;
// //                 if (roomSize === 0) {
// //                     console.log(`🗑️ Removing empty match room: ${matchRoom}`);
// //                     activeMatches.delete(matchRoom);
// //                 }
// //             }, 3000);
// //         }
// //     });
// // });

// // server.listen(5001, () => console.log('Scorecard Backend running on port 5001'));




// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const axios = require('axios');
// const Redis = require('ioredis');
// const path = require('path');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: '*' } });
// const redis = new Redis();

// const API_BASE_URL = 'http://200.97.175.210:4909';

// app.use(express.static(path.join(__dirname, 'public')));

// app.get('/scorecard', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// app.get('/main', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'main.html'));
// });

// const activeMatches = new Map();
// let globalPollerInterval = null;

// function sanitizeName(name) {
//     if (!name) return '';
//     return name.toString().toLowerCase().replace(/\s+/g, ' ').trim();
// }

// function getStandardDate(dateStr) {
//     if (!dateStr) return '';
//     try {
//         const d = new Date(dateStr);
//         if (!isNaN(d.getTime())) {
//             return d.toISOString().split('T')[0];
//         }
//     } catch (e) {}
//     return dateStr.toString().split('T')[0];
// }

// // 1. Smart Match Event ID Finder (Passes eventTime as well)
// async function findMatchEventDetails(matchName, rawDate) {
//     try {
//         const response = await axios.get(`${API_BASE_URL}/matches`, { timeout: 3000 });
        
//         if (response.data?.data?.data) {
//             const matches = response.data.data.data;
//             const cleanTargetName = sanitizeName(matchName);
//             const targetStandardDate = getStandardDate(rawDate);

//             let match = matches.find(m => {
//                 const cleanApiName = sanitizeName(m.eventName);
//                 const apiStandardDate = getStandardDate(m.eventTime);
//                 return cleanApiName === cleanTargetName && apiStandardDate === targetStandardDate;
//             });

//             if (!match) {
//                 match = matches.find(m => {
//                     const cleanApiName = sanitizeName(m.eventName);
//                     return cleanApiName === cleanTargetName || cleanApiName.includes(cleanTargetName);
//                 });
//             }

//             if (match) {
//                 return {
//                     eventId: match.eventId,
//                     eventName: match.eventName,
//                     eventTime: match.eventTime
//                 };
//             }
//         }
//     } catch (error) {
//         console.error(`Error finding match for ${matchName}:`, error.message);
//     }
//     return null;
// }

// // 2. Fetch Score API with Live / Upcoming Check
// async function fetchScoreForMatch(matchRoom, matchDetails) {
//     try {
//         const { eventId, eventTime } = matchDetails;
//         const response = await axios.get(`${API_BASE_URL}/getScore?matchId=${eventId}`, { timeout: 3000 });
        
//         if (response.data && response.data.success) {
//             const scoreObj = response.data.data?.Data?.Score;
            
//             // 🔥 Check if match has actual live score data
//             if (scoreObj && scoreObj.length > 0 && (scoreObj[0].Team1Score || scoreObj[0].Team2Score)) {
//                 const scoreData = {
//                     ...scoreObj[0],
//                     isLive: true
//                 };
//                 await redis.set(`score:${matchRoom}`, JSON.stringify(scoreData), 'EX', 60);
//                 io.to(matchRoom).emit('scoreUpdate', scoreData);
//             } else {
//                 // Match Found but Not Live yet (Upcoming UI)
//                 const upcomingData = {
//                     isLive: false,
//                     eventName: matchDetails.matchName,
//                     eventTime: eventTime
//                 };
//                 io.to(matchRoom).emit('scoreUpdate', upcomingData);
//             }
//             return { matchRoom, status: 'success' };
//         }
//     } catch (error) {
//         // Fallback to Upcoming UI on score fetch fail/not started
//         io.to(matchRoom).emit('scoreUpdate', {
//             isLive: false,
//             eventName: matchDetails.matchName,
//             eventTime: matchDetails.eventTime
//         });
//     }
// }

// // 3. Central Parallel Poller Loop
// function startGlobalPoller() {
//     if (globalPollerInterval) return;

//     globalPollerInterval = setInterval(async () => {
//         if (activeMatches.size === 0) {
//             clearInterval(globalPollerInterval);
//             globalPollerInterval = null;
//             return;
//         }

//         const scorePromises = [];

//         for (const [matchRoom, matchDetails] of activeMatches.entries()) {
//             if (matchDetails.eventId) {
//                 scorePromises.push(fetchScoreForMatch(matchRoom, matchDetails));
//             }
//         }

//         if (scorePromises.length > 0) {
//             await Promise.allSettled(scorePromises);
//         }
//     }, 3000);
// }

// // 4. Socket Connection Logic
// io.on('connection', (socket) => {
//     socket.on('joinMatch', async ({ matchName, date }) => {
//         const stdDate = getStandardDate(date);
//         const matchRoom = `${sanitizeName(matchName)}_${stdDate}`.replace(/\s+/g, '_');

//         socket.join(matchRoom);
//         socket.currentRoom = matchRoom;

//         // Instant Cache Check
//         const cachedScore = await redis.get(`score:${matchRoom}`);
//         if (cachedScore) {
//             socket.emit('scoreUpdate', JSON.parse(cachedScore));
//         }

//         if (!activeMatches.has(matchRoom)) {
//             const matchInfo = await findMatchEventDetails(matchName, date);
//             if (matchInfo) {
//                 const details = { ...matchInfo, matchName, date };
//                 activeMatches.set(matchRoom, details);
//                 fetchScoreForMatch(matchRoom, details);
//             } else {
//                 // Agar ID hi Na mile API se
//                 socket.emit('scoreUpdate', {
//                     isLive: false,
//                     eventName: matchName,
//                     eventTime: date
//                 });
//             }
//         }

//         startGlobalPoller();
//     });

//     socket.on('disconnect', () => {
//         const matchRoom = socket.currentRoom;
//         if (matchRoom) {
//             setTimeout(() => {
//                 const roomSize = io.sockets.adapter.rooms.get(matchRoom)?.size || 0;
//                 if (roomSize === 0) {
//                     activeMatches.delete(matchRoom);
//                 }
//             }, 3000);
//         }
//     });
// });

// server.listen(5001, () => console.log('Scorecard Backend running on port 5001'));





const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const Redis = require('ioredis');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

const redis = new Redis();

const API_BASE_URL = 'http://200.97.175.210:4909';


/* ============================================================
   STATIC FILES
============================================================ */

app.use(express.static(path.join(__dirname, 'public')));


/* ============================================================
   SCORECARD ROUTE
============================================================ */

app.get('/scorecard', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'public', 'index.html')
    );
});


/* ============================================================
   MAIN ROUTE
============================================================ */

app.get('/main', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'public', 'main.html')
    );
});


/* ============================================================
   ACTIVE MATCHES
============================================================ */

const activeMatches = new Map();

let globalPollerInterval = null;


/* ============================================================
   TEMPORARY HARDCODED MATCH IDS

   IMPORTANT:
   /matches API band hone ki wajah se temporarily
   ye IDs manually use hongi.

   Name sanitize hone ke baad lowercase me check hoga.
============================================================ */

const HARDCODED_MATCHES = {

    "mpumalanga rhinos v tuskers": {
        eventId: 36134092
    },

    "knights v titans": {
        eventId: 36131081
    },

    "lions v north west dragons": {
        eventId: 36127463
    }

};


/* ============================================================
   NAME SANITIZER
============================================================ */

function sanitizeName(name) {

    if (!name) {
        return '';
    }

    return name
        .toString()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}


/* ============================================================
   DATE FORMATTER
============================================================ */

function getStandardDate(dateStr) {

    if (!dateStr) {
        return '';
    }

    try {

        const d = new Date(dateStr);

        if (!isNaN(d.getTime())) {

            return d
                .toISOString()
                .split('T')[0];
        }

    } catch (e) {

        console.log(
            'Date parse error:',
            e.message
        );

    }

    return dateStr
        .toString()
        .split('T')[0];
}


/* ============================================================
   FIND MATCH EVENT DETAILS

   FLOW:

   1. Sabse pehle hardcoded match check
   2. Agar hardcoded mila -> direct eventId return
   3. Agar nahi mila -> normal /matches API
   4. API me pehle Name + Date
   5. Fir Name-only fallback
============================================================ */

async function findMatchEventDetails(
    matchName,
    rawDate
) {

    const cleanTargetName =
        sanitizeName(matchName);

    const targetStandardDate =
        getStandardDate(rawDate);


    /* ========================================================
       1. HARDCODED MATCH CHECK
    ======================================================== */

    const hardcodedMatch =
        HARDCODED_MATCHES[cleanTargetName];


    if (hardcodedMatch) {

        console.log(
            `🔥 HARDCODED MATCH FOUND | ` +
            `${matchName} | ` +
            `ID: ${hardcodedMatch.eventId}`
        );


        return {

            eventId:
                hardcodedMatch.eventId,

            eventName:
                matchName,

            /*
             * Match-list API se eventTime nahi mil raha,
             * isliye frontend/socket se jo date aa rahi hai
             * wahi use karenge.
             */

            eventTime:
                rawDate,

            hardcoded:
                true

        };
    }


    /* ========================================================
       2. NORMAL MATCH -> /matches API
    ======================================================== */

    try {

        console.log(
            `🔍 Searching match from API: ${matchName}`
        );


        const response =
            await axios.get(
                `${API_BASE_URL}/matches`,
                {
                    timeout: 3000
                }
            );


        if (
            response.data?.data?.data
        ) {

            const matches =
                response.data.data.data;


            /* =================================================
               STRICT SEARCH
               NAME + DATE
            ================================================= */

            let match =
                matches.find((m) => {

                    const cleanApiName =
                        sanitizeName(
                            m.eventName
                        );


                    const apiStandardDate =
                        getStandardDate(
                            m.eventTime
                        );


                    return (
                        cleanApiName ===
                            cleanTargetName
                        &&
                        apiStandardDate ===
                            targetStandardDate
                    );

                });


            /* =================================================
               FALLBACK
               NAME ONLY
            ================================================= */

            if (!match) {

                console.log(
                    `⚠️ Exact date match not found. ` +
                    `Trying name-only search: ${matchName}`
                );


                match =
                    matches.find((m) => {

                        const cleanApiName =
                            sanitizeName(
                                m.eventName
                            );


                        return (

                            cleanApiName ===
                                cleanTargetName

                            ||

                            cleanApiName.includes(
                                cleanTargetName
                            )

                        );

                    });

            }


            /* =================================================
               MATCH FOUND
            ================================================= */

            if (match) {

                console.log(
                    `✅ API MATCH FOUND | ` +
                    `${match.eventName} | ` +
                    `ID: ${match.eventId} | ` +
                    `Time: ${match.eventTime}`
                );


                return {

                    eventId:
                        match.eventId,

                    eventName:
                        match.eventName,

                    eventTime:
                        match.eventTime,

                    hardcoded:
                        false

                };
            }

        }


        console.log(
            `❌ No match found from API: ${matchName}`
        );


    } catch (error) {

        console.error(
            `❌ Error finding match for ${matchName}:`,
            error.message
        );

    }


    return null;
}


/* ============================================================
   FETCH SCORE FOR MATCH
============================================================ */

async function fetchScoreForMatch(matchRoom, matchDetails) {
    try {
        const { eventId, eventTime } = matchDetails;

        console.log(
            `🏏 Fetching Score | ${matchDetails.matchName} | ID: ${eventId}`
        );

        const response = await axios.get(
            `${API_BASE_URL}/getScore?matchId=${eventId}`,
            {
                timeout: 3000
            }
        );

        // console.log(
        //     `📦 SCORE API RESPONSE ${eventId}:`,
        //     JSON.stringify(response.data)
        // );

        if (!response.data ) {
            console.log(`❌ Score API success false | ID: ${eventId}`);
            return;
        }

        // ========================================================
        // SUPPORT MULTIPLE API RESPONSE FORMATS
        // ========================================================

        const scoreObj =
            response.data?.data?.Data?.Score ||
            response.data?.data?.ScoreData?.Score ||
            response.data?.Data?.Score ||
            response.data?.ScoreData?.Score ||
            [];

            console.log(scoreObj?.data?.Data?.Score,"dfghjkl;")

        console.log(
            `📊 SCORE ARRAY | ID: ${eventId}:`,
            scoreObj
        );

        if (
            Array.isArray(scoreObj) &&
            scoreObj.length > 0
        ) {
            const rawScore = scoreObj[0];

            /*
             * IMPORTANT:
             *
             * Score API ne actual Score object diya hai
             * to frontend ko wahi pura object bhejna hai.
             *
             * Frontend already Team1Score, Team2Score,
             * CurrentInning, Player1, Player2 etc handle karta hai.
             */

            const scoreData = {
                ...rawScore,
                isLive: true
            };

            await redis.set(
                `score:${matchRoom}`,
                JSON.stringify(scoreData),
                'EX',
                60
            );

            io.to(matchRoom).emit(
                'scoreUpdate',
                scoreData
            );

            console.log(
                `✅ SCORE SENT | ${matchDetails.matchName} | ID: ${eventId}`
            );

            return {
                matchRoom,
                status: 'success'
            };
        }

        // ========================================================
        // SCORE ARRAY NAHI MILA
        // ========================================================

        console.log(
            `⚠️ Score data empty | ${matchDetails.matchName} | ID: ${eventId}`
        );

        io.to(matchRoom).emit(
            'scoreUpdate',
            {
                isLive: false,
                eventName: matchDetails.matchName,
                eventTime
            }
        );

        return {
            matchRoom,
            status: 'upcoming'
        };

    } catch (error) {
        console.error(
            `❌ SCORE API ERROR | ${matchDetails.matchName} | ID: ${matchDetails.eventId}`,
            error?.response?.data || error.message
        );

        io.to(matchRoom).emit(
            'scoreUpdate',
            {
                isLive: false,
                eventName: matchDetails.matchName,
                eventTime: matchDetails.eventTime
            }
        );

        return {
            matchRoom,
            status: 'error'
        };
    }
}


/* ============================================================
   GLOBAL SCORE POLLER
============================================================ */

function startGlobalPoller() {

    if (globalPollerInterval) {

        return;

    }


    console.log(
        '🚀 Starting Global Score Poller...'
    );


    globalPollerInterval =
        setInterval(
            async () => {


                /* =============================================
                   NO ACTIVE MATCH
                ============================================= */

                if (
                    activeMatches.size === 0
                ) {

                    console.log(
                        '🛑 No active matches. ' +
                        'Stopping poller.'
                    );


                    clearInterval(
                        globalPollerInterval
                    );


                    globalPollerInterval =
                        null;


                    return;
                }


                const scorePromises = [];


                /* =============================================
                   FETCH ALL ACTIVE MATCHES
                ============================================= */

                for (
                    const [
                        matchRoom,
                        matchDetails
                    ]
                    of
                    activeMatches.entries()
                ) {

                    if (
                        matchDetails.eventId
                    ) {

                        scorePromises.push(

                            fetchScoreForMatch(
                                matchRoom,
                                matchDetails
                            )

                        );

                    }

                }


                /* =============================================
                   PARALLEL SCORE REQUESTS
                ============================================= */

                if (
                    scorePromises.length > 0
                ) {

                    await Promise.allSettled(
                        scorePromises
                    );

                }


            },
            3000
        );

}


/* ============================================================
   SOCKET CONNECTION
============================================================ */

io.on(
    'connection',
    (socket) => {


        console.log(
            `🔌 Socket connected: ${socket.id}`
        );


        /* =====================================================
           JOIN MATCH
        ===================================================== */

        socket.on(
            'joinMatch',
            async ({
                matchName,
                date
            }) => {


                console.log(
                    `🏏 Join Match Request | ` +
                    `${matchName} | ${date}`
                );


                const stdDate =
                    getStandardDate(
                        date
                    );


                const matchRoom =
                    `${sanitizeName(matchName)}_${stdDate}`
                        .replace(
                            /\s+/g,
                            '_'
                        );


                /* =============================================
                   JOIN SOCKET ROOM
                ============================================= */

                socket.join(
                    matchRoom
                );


                socket.currentRoom =
                    matchRoom;


                console.log(
                    `✅ Socket joined room: ${matchRoom}`
                );


                /* =============================================
                   INSTANT REDIS CACHE
                ============================================= */

                try {

                    const cachedScore =
                        await redis.get(
                            `score:${matchRoom}`
                        );


                    if (cachedScore) {

                        console.log(
                            `⚡ Sending cached score: ${matchRoom}`
                        );


                        socket.emit(
                            'scoreUpdate',
                            JSON.parse(
                                cachedScore
                            )
                        );

                    }

                } catch (error) {

                    console.error(
                        'Redis cache error:',
                        error.message
                    );

                }


                /* =============================================
                   ADD MATCH TO ACTIVE MATCHES
                ============================================= */

                if (
                    !activeMatches.has(
                        matchRoom
                    )
                ) {


                    const matchInfo =
                        await findMatchEventDetails(
                            matchName,
                            date
                        );


                    if (matchInfo) {


                        const details = {

                            ...matchInfo,

                            matchName,

                            date

                        };


                        activeMatches.set(
                            matchRoom,
                            details
                        );


                        console.log(
                            `✅ ACTIVE MATCH ADDED | ` +
                            `${matchName} | ` +
                            `ID: ${details.eventId} | ` +
                            `Hardcoded: ${details.hardcoded === true}`
                        );


                        /* =====================================
                           IMMEDIATE SCORE FETCH
                        ===================================== */

                        fetchScoreForMatch(
                            matchRoom,
                            details
                        );

                    } else {


                        console.log(
                            `❌ Match ID not found: ${matchName}`
                        );


                        /* =====================================
                           NO MATCH ID
                        ===================================== */

                        socket.emit(
                            'scoreUpdate',
                            {

                                isLive: false,

                                eventName:
                                    matchName,

                                eventTime:
                                    date

                            }
                        );

                    }

                } else {


                    console.log(
                        `ℹ️ Match already active: ${matchName}`
                    );

                }


                /* =============================================
                   START POLLER
                ============================================= */

                startGlobalPoller();

            }
        );


        /* =====================================================
           SOCKET DISCONNECT
        ===================================================== */

        socket.on(
            'disconnect',
            () => {


                console.log(
                    `🔌 Socket disconnected: ${socket.id}`
                );


                const matchRoom =
                    socket.currentRoom;


                if (matchRoom) {


                    setTimeout(
                        () => {


                            const roomSize =
                                io
                                    .sockets
                                    .adapter
                                    .rooms
                                    .get(
                                        matchRoom
                                    )
                                    ?.size
                                || 0;


                            /* =================================
                               REMOVE UNUSED MATCH
                            ================================= */

                            if (
                                roomSize === 0
                            ) {


                                console.log(
                                    `🗑️ Removing empty match: ${matchRoom}`
                                );


                                activeMatches.delete(
                                    matchRoom
                                );

                            }


                        },
                        3000
                    );

                }

            }
        );

    }
);


/* ============================================================
   START SERVER
============================================================ */

server.listen(
    5001,
    () => {

        console.log(
            '🚀 Scorecard Backend running on port 5001'
        );

        console.log(
            '🔥 Temporary hardcoded matches loaded:',
            Object.keys(
                HARDCODED_MATCHES
            ).length
        );

    }
);