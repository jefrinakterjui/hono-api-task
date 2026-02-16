import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { logger } from "hono/logger";
import auth from "./modules/auth/auth.routes";

const app = new OpenAPIHono();

app.use("*", logger())

app.get("/", (c)=>{
    return c.text("hono api is running!")
})

app.doc("/doc", {
    openapi: "3.0.0",
    info:{
        version:"1.0.0",
        title: "My Hono App",
        description: "api  with hono and Drizzle"
    }
})

app.route("/auth", auth)

app.get("/ui", swaggerUI({url: "/doc"}))

export default app;