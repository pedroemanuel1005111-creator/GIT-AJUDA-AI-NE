import { pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

// Table to store default and custom quiz questions
export const questions = pgTable("questions", {
  id: text("id").primaryKey(), // unique ID
  category: text("category").notNull(), // 'saude_digital' | 'cultura_digital' | 'cultura_alagoana' | 'geral'
  text: text("text").notNull(),
  option0: text("option_0").notNull(),
  option1: text("option_1").notNull(),
  option2: text("option_2").notNull(),
  option3: text("option_3").notNull(),
  correctOption: integer("correct_option").notNull(), // 0, 1, 2, or 3
  explanation: text("explanation").notNull(), // Great for learning after the question ends!
  timeLimit: integer("time_limit").default(20).notNull(), // in seconds
  points: integer("points").default(1000).notNull(), // Max points for Kahoot calculation
});

// Game Rooms (Multiplayer Kahoot Style)
export const rooms = pgTable("rooms", {
  id: text("id").primaryKey(), // 6-digit PIN code like '482910'
  name: text("name").notNull(), // e.g. "Super Quiz Alagoano"
  hostName: text("host_name").notNull(), // Name of the host
  status: text("status").notNull(), // 'waiting' | 'countdown' | 'playing' | 'question_results' | 'leaderboard' | 'podium'
  quizCategory: text("quiz_category").notNull(), // 'all' | 'saude_digital' | 'cultura_digital' | 'cultura_alagoana'
  currentQuestionIndex: integer("current_question_index").default(0).notNull(),
  questionStartTime: integer("question_start_time"), // timestamp in Unix epoch (ms) or seconds
  timePerQuestion: integer("time_per_question").default(20).notNull(),
  totalQuestions: integer("total_questions").default(20).notNull(),
  showResultsUntil: integer("show_results_until"), // when transitioning automatically or manual
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Players inside Rooms
export const players = pgTable("players", {
  id: text("id").primaryKey(), // UUID or specific session ID
  roomId: text("room_id").references(() => rooms.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(), // Player Nickname
  avatar: text("avatar").notNull(), // Emoji avatar e.g. '🏖️', '🧙‍♂️', etc.
  score: integer("score").default(0).notNull(), // Total points
  correctAnswers: integer("correct_answers").default(0).notNull(),
  streak: integer("streak").default(0).notNull(), // Active answer streak for extra flames/bonuses
  isHost: boolean("is_host").default(false).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Real-time answers submitted by players
export const answers = pgTable("answers", {
  id: text("id").primaryKey(),
  roomId: text("room_id").references(() => rooms.id, { onDelete: "cascade" }).notNull(),
  playerId: text("player_id").references(() => players.id, { onDelete: "cascade" }).notNull(),
  questionIndex: integer("question_index").notNull(),
  selectedOption: integer("selected_option").notNull(), // 0, 1, 2, or 3
  isCorrect: boolean("is_correct").notNull(),
  scoreEarned: integer("score_earned").notNull(),
  responseTimeMs: integer("response_time_ms").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// Live Interactive Reactions (e.g., emojis floated across the screen)
export const roomReactions = pgTable("room_reactions", {
  id: text("id").primaryKey(),
  roomId: text("room_id").references(() => rooms.id, { onDelete: "cascade" }).notNull(),
  playerName: text("player_name").notNull(),
  emoji: text("emoji").notNull(), // 🔥, ❤️, 🚀, 🌴, 🤯
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
