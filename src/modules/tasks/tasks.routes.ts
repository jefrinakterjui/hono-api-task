import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { authMiddleware } from "../../middleware/auth.middleware";
import { createTaskSchema, paramIdSchema, taskResponseSchema, updateTaskShema } from "./tasks.schema";
import { db } from "../../db";
import { tasks } from "../../db/schema";
import { and, desc, eq } from "drizzle-orm";

export const app = new OpenAPIHono();

app.use("*", authMiddleware);

app.openapi(
    createRoute({
        method: "post",
        path: "/",
        tags: ["Task"],
        security: [{ Bearer: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: createTaskSchema,
                    },
                },
            },
        },
        responses: {
            201: {
                content: {
                    "application/json": {
                        schema: taskResponseSchema,
                    },
                },
                description: "Task Created successfully!",
            },
        },
    }),
    async (c) => {
        const { title } = c.req.valid("json");
        const payload = c.get("jwtPayload");

        const [newTask] = await db
            .insert(tasks)
            .values({
                title,
                userId: payload.id,
            })
            .returning();

        if (!newTask) {
            throw new Error("Task creation failed");
        }
        return c.json(
            {
                id: newTask.id,
                title: newTask.title,
                isCompleted: newTask.isCompleted ?? false,
                createdAt: newTask.createdAt ? newTask.createdAt.toISOString() : null,
            },
            201,
        );
    },
);

app.openapi(
    createRoute({
        method:"get",
        path:"/",
        tags:["Task"],
        security: [{Bearer:[]}],
        responses:{
            200:{
                content:{
                    "application/json":{
                        schema: z.array(taskResponseSchema)
                    }
                },
                description: "List of tasks"
            }
        }
    }),
    async (c)=>{
        const payload = c.get("jwtPayload");

        const allTasks = await db
            .select()
            .from(tasks)
            .where(eq(tasks.userId, payload.id))
            .orderBy(desc(tasks.createdAt));

        const formattedTasks = allTasks.map((task) => ({
            id: task.id,
            title: task.title,
            isCompleted: task.isCompleted ?? false, 
            createdAt: task.createdAt ? task.createdAt.toISOString() : null, 
        }));

        return c.json(formattedTasks, 200);
    }
);

app.openapi(
    createRoute({
        method: "patch",
        path:"/{id}",
        tags: ["Task"],
        security: [{Bearer:[]}],
        request:{
            params: paramIdSchema,
            body:{
                content:{
                    "application/json":{
                        schema: updateTaskShema
                    }
                }
            }
        },
        responses:{
            200:{
                content:{
                    "application/json":{
                        schema: taskResponseSchema
                    }
                },
                description:"Task updated successfully!"
            },
            404: { description: "Task not found" },
        }
    }),
    async (c)=>{
        const id = Number(c.req.param("id"));
        const payload = c.get("jwtPayload");
        const updates = c.req.valid("json");

        const [updatedTask] = await db
            .update(tasks)
            .set(updates)
            .where(and(eq(tasks.id, id), eq(tasks.userId, payload.id)))
            .returning()

        if(!updatedTask){
            return c.json({ error: "Task not found or unauthorized" }, 404);
        }
        return c.json(updatedTask)
    }
);

app.openapi(
    createRoute({
        method: "delete",
        path: "/{id}",
        tags: ["Tasks"],
        security: [{ Bearer: [] }],
        request: { params: paramIdSchema },
        responses: {
            200: { description: "Task deleted" },
            404: { description: "Task not found" },
        },
    }),
    async (c)=>{
        const id = Number(c.req.param("id"))
        const payload =c.get("jwtPayload");

        const result = await db
            .delete(tasks)
            .where(and(eq(tasks.id, id), eq(tasks.userId, payload.id)))
            .returning();

        if (result.length === 0) return c.json({ error: "Task not found or unauthorized" }, 404);
        return c.json({ message: "Deleted successfully" });
    }
);

export default app;
