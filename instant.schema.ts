import { i } from "@instantdb/core";

export default i.schema({
  entities: {
    // Game sessions track overall player progress
    gameSessions: i.entity({
      playerName: i.string(),
      sessionId: i.string(), // Unique identifier for this game session
      startedAt: i.date(), // When the player started the game
      targetsFound: i.number(), // Current number of targets found
      totalTargets: i.number(), // Total targets in the game (8)
      currentProgress: i.number(), // Progress percentage (0-100)
      isCompleted: i.boolean(), // Whether the session is completed
      lastActivity: i.date(), // Last time player was active
      expiresAt: i.date(), // When this record expires
    }),
    // Separate entity for completion data
    gameCompletions: i.entity({
      sessionId: i.string(), // Link to the game session
      playerName: i.string(),
      completionTime: i.date(), // When they completed
      qrContent: i.string(), // QR code content
      sessionDuration: i.number(), // Total time in seconds
    }),
    // Individual discoveries with detailed timing
    discoveries: i.entity({
      sessionId: i.string(), // Link to the game session
      playerName: i.string(),
      targetIndex: i.number(), // Which target (0-7)
      targetDescription: i.string(), // Description of what was found
      foundAt: i.date(), // Exact timestamp of discovery
      timeSinceStart: i.number(), // Seconds since game start
      sequenceNumber: i.number(), // Order of discovery (1st, 2nd, etc.)
    }),
    // Player statistics and achievements
    playerStats: i.entity({
      playerName: i.string(),
      totalGamesPlayed: i.number(),
      totalGamesCompleted: i.number(),
      bestCompletionTime: i.number().optional(), // Best time in seconds
      totalTargetsFound: i.number(), // Across all games
      averageTargetsPerGame: i.number(),
      lastPlayed: i.date(),
      createdAt: i.date(),
    }),
  },
});
