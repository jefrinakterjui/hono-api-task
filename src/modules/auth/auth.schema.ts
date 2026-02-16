import { z } from "@hono/zod-openapi";

export const registerSchema = z.object({
    name: z.string().min(2).openapi({example: "Tuku"}),
    email: z.string().email().openapi({example: "tuku@gmail.com"}),
    password: z.string().min(6).openapi({ example: "secret123" })
})

export const loginSchema = z.object({
    email: z.string().email().openapi({example: "tuku@gmail.com"}),
    password: z.string().min(6).openapi({example: "secret123"})
})

export const authResponse = z.object({
    token: z.string(),
    user: z.object({
        id: z.number(),
        email: z.string(),
        name: z.string()
    })
})