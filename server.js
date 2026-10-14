const express = require("express");
const axios = require("axios");
const { createRemoteJWKSet, jwtVerify } = require("jose");

const app = express();


const PORT = 5000;
const issuer = "http://localhost:8080/realms/oauth-playground";

const jwks = createRemoteJWKSet(
    new URL(`${issuer}/protocol/openid-connect/certs`)
);

const validateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access token required"
            });
        }

        const token = authHeader.substring(7);

        const { payload } = await jwtVerify(token, jwks, {
            issuer: issuer,
            audience: "oauth-playground-api"
        });

        req.user = payload;

        next();

    } catch (error) {
        console.error("Token validation failed:", error.message);

        return res.status(401).json({
            message: "Invalid or expired access token"
        });
    }
};

const requireScope = (scope) => {
    return (req, res, next) => {

        const scopes = req.user?.scope?.split(" ") || [];

        if (!scopes.includes(scope)) {
            return res.status(403).json({
                message: "Forbidden: required scope missing"
            });
        }

        next();
    };
};
const requireRole = (role) => {
    return (req, res, next) => {

        const roles = req.user?.realm_access?.roles || [];

        if (!roles.includes(role)) {
            return res.status(403).json({
                message: "Forbidden: insufficient permissions"
            });
        }

        next();
    };
};

const requireClientRole = (clientId, role) => {
    return (req, res, next) => {

        const roles =
            req.user?.resource_access?.[clientId]?.roles || [];

        if (!roles.includes(role)) {
            return res.status(403).json({
                message: "Forbidden: insufficient client role"
            });
        }

        next();
    };
};

app.get(
    "/api/client-admin",
    validateToken,
    requireClientRole("oauth-playground-client", "api-admin"),
    (req, res) => {
        res.json({
            message: "Welcome, client admin!",
            user: req.user.preferred_username
        });
    }
);

app.get(
    "/api/hello",
    validateToken,
    requireScope("users.read"),
    (req, res) => {

        res.json({
            message: "Hello from OAuth Playground API",
            user: req.user
        });
    }
);

app.get(
    "/api/users",
    validateToken,
    requireScope("users.read"),
    (req, res) => {

        res.json({
            message: "Users retrieved successfully",
            users: [
                {
                    id: 1,
                    username: "alice",
                    email: "alice@example.com"
                },
                {
                    id: 2,
                    username: "bob",
                    email: "bob@example.com"
                }
            ]
        });
    }
);

app.post(
    "/api/users",
    validateToken,
    requireScope("users.write"),
    (req, res) => {

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: 3,
                username: "charlie",
                email: "charlie@example.com"
            }
        });
    }
);

app.get(
    "/api/admin",
    validateToken,
   requireRole("admin"),
    (req, res) => {
        res.json({
            message: "Welcome to the protected admin API",
            user: req.user.preferred_username
        });
    }
);

app.post(
    "/api/admin/users",
    validateToken,
    requireScope("users.write"),
    requireClientRole("oauth-playground-client", "api-admin"),
    (req, res) => {
        res.status(201).json({
            message: "Admin user creation allowed",
            user: req.user
        });
    }
);

app.get("/auth/callback", async (req, res) => {
    const code = req.query.code;

    try {
        const tokenResponse = await axios.post(
            "http://localhost:8080/realms/oauth-playground/protocol/openid-connect/token",
            new URLSearchParams({
                grant_type: "authorization_code",
                client_id: "oauth-playground-client",
                code: code,
                redirect_uri: "http://localhost:5000/auth/callback",
                code_verifier: "Hwh2KE4ww9Qk2Bpuchkw8elHU1B9Ui9KS4nt8wtWT2U"
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );

        res.json({
            message: "Token exchange successful",
            tokens: tokenResponse.data
        });

    } catch (error) {
        console.error("Token exchange failed:", error.response?.data || error.message);

        res.status(500).json({
            message: "Token exchange failed",
            error: error.response?.data || error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});