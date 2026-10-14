# OAuth 2.0 and OpenID Connect Playground with Keycloak

A hands-on learning project exploring OAuth 2.0 and OpenID Connect (OIDC) using Keycloak and Node.js.

This project demonstrates the OIDC Authorization Code Flow with PKCE, token exchange, JWT validation, and access to a protected API.

## Project Objectives

- Understand the OIDC Authorization Code Flow.
- Explore PKCE using the S256 challenge method.
- Exchange an authorization code for tokens using Keycloak.
- Understand ID tokens, access tokens, scopes, and token claims.
- Validate access tokens before allowing access to a protected API.

## Technology Stack

- **Identity Provider:** Keycloak
- **Backend:** Node.js and Express
- **Authentication Protocol:** OpenID Connect
- **Authorization Framework:** OAuth 2.0
- **Security Mechanism:** PKCE (S256)
- **Token Validation:** JWT signature and claim validation

## Architecture

The playground uses Keycloak as the identity provider and a Node.js application as the client and API.

The main authentication flow is:

1. The application initiates an OIDC authorization request.
2. The browser is redirected to Keycloak for authentication.
3. Keycloak authenticates the test user and redirects the browser to the application's callback with an authorization code.
4. The application exchanges the authorization code at the Keycloak token endpoint.
5. Keycloak returns tokens according to the client configuration.
6. The access token can be used to call a protected API.
7. The API validates the token before returning a response.

## Keycloak Configuration

The local playground uses the following configuration:

| Setting | Value |
|---|---|
| Realm | `oauth-playground` |
| Client ID | `oauth-playground-client` |
| Issuer | `http://localhost:8080/realms/oauth-playground` |
| Authorization endpoint | `/protocol/openid-connect/auth` |
| Token endpoint | `/protocol/openid-connect/token` |
| Application callback | `http://localhost:5000/auth/callback` |
| API audience | `oauth-playground-api` |
| Protected endpoint | `GET /api/hello` |

These values are for a local learning environment. Configure the corresponding realm, client, redirect URI, and token settings in your own Keycloak instance.

## Understanding PKCE

Proof Key for Code Exchange (PKCE) adds protection to the Authorization Code Flow.

The client generates a random `code_verifier` and derives a `code_challenge` using SHA-256.

With the S256 method:

`code_challenge = BASE64URL(SHA256(code_verifier))`

The authorization request sends the challenge to Keycloak. During token exchange, the client sends the original verifier so Keycloak can validate the relationship between them.

## Token Concepts

- **ID token:** Contains claims about the authentication event and authenticated user.
- **Access token:** Used to access protected APIs.
- **Refresh token:** Can be used to obtain new tokens when permitted by the client's configuration and session policies.
- **Scopes:** Represent requested categories of access or user information, subject to the server's configuration and authorization rules.
- **JWT claims:** Include information such as issuer, audience, subject, and expiration.

## Running the Project Locally

### Prerequisites

- Node.js and npm
- A running Keycloak instance
- A configured `oauth-playground` realm
- An OIDC client configured with the appropriate redirect URI

### Installation

Clone the repository:

```bash
git clone https://github.com/pooja2apr/oauth-oidc-playground.git
cd oauth-oidc-playground
```

Install dependencies:

```bash
npm install
```

Start the application using the start script defined in `package.json`:

```bash
npm start
```

If your `package.json` does not define a start script, use the appropriate command for your project, such as `node server.js`.

The application is intended to run locally on port `5000`, with Keycloak on port `8080`.

## Project Files

- `server.js` — Node.js application, authentication callback, token exchange, and API functionality.
- `pkce.js` — PKCE code verifier and challenge generation.
- `package.json` — Project metadata, scripts, and dependencies.
- `package-lock.json` — Locked dependency versions.
- `.gitignore` — Excludes local dependencies and environment configuration.

## Learning Outcomes

Through this project, I explored how OAuth 2.0 and OpenID Connect work together, how PKCE protects the authorization code flow, and how access tokens can be validated before allowing access to a protected API.

This is a learning playground, not a production-ready identity solution.

## Related Article

**Understanding the OIDC Authorization Code Flow with Keycloak**

[Read the article on Medium](ADD_YOUR_MEDIUM_ARTICLE_URL_HERE)

## Disclaimer

This project is intended for educational purposes. Do not use hardcoded credentials, reusable PKCE verifiers, exposed tokens, or development configuration in production environments. Protect token responses and validate tokens according to the requirements of your application.
