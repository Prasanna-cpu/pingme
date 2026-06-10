import swaggerJSDoc from "swagger-jsdoc";

const port = process.env.PORT

export const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "PingMe Backend API",
            version: "1.0.0",
            description: "API documentation for the PingMe backend",
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: "Local development server",
            },
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "jwt",
                },
            },
            schemas: {
                ApiResponse: {
                    type: "object",
                    properties: {
                        status: {
                            type: "number",
                            example: 200,
                        },
                        message: {
                            type: "string",
                            example: "Success",
                        },
                    },
                },
                User: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            example: "65f1b2c3d4e5f67890123456",
                        },
                        _id: {
                            type: "string",
                            example: "65f1b2c3d4e5f67890123456",
                        },
                        fullName: {
                            type: "string",
                            example: "John Doe",
                        },
                        email: {
                            type: "string",
                            example: "john@example.com",
                        },
                        profilePic: {
                            type: "string",
                            example: "https://res.cloudinary.com/demo/image/upload/profile.jpg",
                        },
                    },
                },
                Message: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            example: "65f1b2c3d4e5f67890123456",
                        },
                        senderId: {
                            type: "string",
                            example: "65f1b2c3d4e5f67890123456",
                        },
                        receiverId: {
                            type: "string",
                            example: "65f1b2c3d4e5f67890123457",
                        },
                        text: {
                            type: "string",
                            example: "Hello!",
                        },
                        image: {
                            type: "string",
                            example: "https://res.cloudinary.com/demo/image/upload/message.jpg",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },
            },
        },
    },
    apis: ["./src/router/*.ts"],
});

