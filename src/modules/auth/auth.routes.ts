import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { authResponse, loginSchema, registerSchema } from "./auth.schema";
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { compare, hash } from "bcryptjs";
import { sign } from "hono/jwt";

const auth = new OpenAPIHono();

const JWT_SECRET = process.env.JWT_SECRET

auth.openapi(
    createRoute({
        method:"post",
        path: "/register",
        tags: ["Auth"],
        summary: "Register a new User",
        request: {
            body:{
                content:{
                    "application/json": {
                        schema: registerSchema,
                    },
                }
            }
        },
        responses:{
            201:{
                content:{
                    "application/json":{
                        schema: authResponse
                    }
                },
                description: "User registered successfully!"
            },
            400:{
                description:"User already exisit"
            }
        }
    }),
    async (c)=>{
        const {name, email, password} = c.req.valid("json");

        const existUser = await db.select().from(users).where(eq(users.email, email));
        if(existUser.length >0){
            return c.json({ error: "User already exists" }, 400);
        }

        const hashedPassword = await hash(password, 10);

        const [newUser] =await db
            .insert(users)
            .values({name, email, password: hashedPassword})
            .returning()

        const token = await sign({ id: newUser?.id, role: newUser?.role}, JWT_SECRET as string)

        return c.json({
            token: token,
            user: { id: newUser?.id, name: newUser?.name, role: newUser?.role}
        }, 201)

    }
);

auth.openapi(
    createRoute({
        method: "post",
        path: "/login",
        tags: ["Auth"],
        summary: "Login User",
        request:{
            body:{
                content:{
                    "application/json":{
                        schema: loginSchema
                    }
                }
            }
        },
        responses:{
            200:{
                content:{
                    "application/json":{
                        schema: authResponse
                    }
                },
                description:"Login successful"
            },
            401:{
                description: "Invalid credentials"
            }
        }
    }),
    async (c)=>{
        const {email, password} = c.req.valid("json")

        const [user] = await db.select().from(users).where(eq(users.email, email));

        if(!user){
            return c.json("Invalid credentials please try again", 401)
        }
        const isValid = await compare(password, user.password)
        if(!isValid){
            return c.json("Invalid credentials please try again", 401)
        }

        const token = await sign({id: user.id, role: user.role}, JWT_SECRET as string)

        return c.json(
            {
                token,
                user: { id: user.id, email: user.email, name: user.name },
            },
            200
        );
    }
);

export default auth;