import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";


export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    role: text("role").default("user"),
    createdAt: timestamp("created_at").defaultNow()
})

export const tasks = pgTable("task",{
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    isCompleted: boolean("is_completed").default(false),
    userId: integer("user_id").references(()=> users.id),
    createdAt: timestamp("created_at").defaultNow()
})

export const usersRelations = relations(users, ({many})=>({
    task: many(tasks)
}))

export const taskRetations = relations(tasks, ({one})=>({
    author: one(users,{
        fields: [tasks.userId],
        references: [users.id]
    })
}))