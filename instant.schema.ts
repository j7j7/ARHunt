import { i } from "@instantdb/core";

export default i.schema({
  entities: {
    gameSessions: i.entity({
      playerName: i.string(),
      completionTime: i.date(),
      qrContent: i.string(),
      targetsFound: i.number(),
      expiresAt: i.date(),
    }),
    discoveries: i.entity({
      playerName: i.string(),
      targetIndex: i.number(),
      foundAt: i.date(),
    }),
  },
});