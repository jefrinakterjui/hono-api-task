import { z } from "@hono/zod-openapi";

export const createTaskSchema = z.object({
    title: z.string().min(2).openapi({example: "Complete project"})
})

export const updateTaskShema = z.object({
    title: z.string().optional().openapi({example: "Updated project"}),
    isCompleted:z.boolean().optional().openapi({example: true})
})

export const taskResponseSchema = z.object({
    id: z.number().openapi({example: 1}),
    title: z.string(),
    isCompleted: z.boolean(),
    createdAt: z.string().datetime().nullable()
})

export const paramIdSchema = z.object({
    id: z.string().openapi({ param: { name: "id", in: "path" }, example: "1" }),
});