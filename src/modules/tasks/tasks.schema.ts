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

export const taskQuerySchema = z.object({
    page: z.string().optional().default("1").openapi({example: "1"}),
    limit: z.string().optional().default("5").openapi({example: "5"})
})

export const paginatedTaskResponseSchema = z.object({
    data: z.array(taskResponseSchema),
    meta: z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number()
    })
})