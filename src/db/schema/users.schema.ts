import { relations } from "drizzle-orm"
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"
import { tasks } from "./tasks.schema"

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    role: text("role").default("user"),
    createdAt: timestamp("created_at").defaultNow()
})

export const usersRelations = relations(users, ({many})=>({
    task: many(tasks)
}))