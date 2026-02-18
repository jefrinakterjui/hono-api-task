import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const tasks = pgTable("task",{
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    isCompleted: boolean("is_completed").default(false),
    userId: integer("user_id").references(()=> users.id),
    createdAt: timestamp("created_at").defaultNow()
})

export const taskRetations = relations(tasks, ({one})=>({
    author: one(users,{
        fields: [tasks.userId],
        references: [users.id]
    })
}))