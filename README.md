# NodeJS Project - Summarization API

This project provides an API for summarizing text using the Google Gemini API. It also includes user authentication and database persistence using PostgreSQL and Prisma.

## Prerequisites

* Node.js and npm installed
* Docker and Docker Compose installed
* A Google Gemini API key
* Postman or a similar API testing tool

## Setup

1.  **Clone the Repository:**

    ```bash
    git clone <repository_url>
    cd <project_directory>
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**

    * Create a `.env` file in the root of the project.
    * Add the following variables, replacing the placeholders with your actual values:

        ```dotenv
        JWT_SECRET=rU7lol75MEPzuhd
        GEMINI_API_KEY=AIzaSyC3Jh4fCez72
        DATABASE_URL="postgresql://admin:secret@localhost:5434/aitasks?schema=public"
        ```

4.  **Start PostgreSQL with Docker Compose:**

    ```bash
    docker compose up -d postgres
    ```

5.  **Initialize Prisma:**

    ```bash
    npx prisma init
    ```

    * This will create a `prisma` directory with a `schema.prisma` file.
    * Ensure that the `datasource db` block in `schema.prisma` reflects the `DATABASE_URL` from your `.env` file.
    * Add the user model in schema.prisma

    ```prisma
    model User {
        id       Int    @id @default(autoincrement())
        email    String @unique
        password String
        name     String
    }
    ```

6.  **Generate and Migrate the Database:**

    ```bash
    npx prisma generate
    npx prisma migrate dev --name init
    ```

    * This will create the database tables based on your `schema.prisma` file.

7.  **Start the Application:**

    ```bash
    npm run dev
    ```

    * The API will be running on `http://localhost:3000` (or the port specified in your `.env` file or application configuration. Check the console logs for the exact port number).

## API Endpoints

### 1.  **User Creation (POST /api/v1/user)**

    * **Description:** Creates a new user.
    * **Request Body (JSON):**

        ```json
        {
            "email": "test@example.com",
            "password": "securePassword123",
            "name": "Arley"
        }
        ```

    * **Example cURL request:**

        ```bash
        curl -X POST -H "Content-Type: application/json" -d '{"email": "test@example.com", "password": "securePassword123", "name": "Arley"}' http://localhost:3000/api/v1/user
        ```

### 2.  **User Login (POST /api/v1/login)**

    * **Description:** Authenticates a user and returns a JWT token.
    * **Request Body (JSON):**

        ```json
        {
            "email": "test@example.com",
            "password": "securePassword123"
        }
        ```

    * **Example cURL request:**

        ```bash
        curl -X POST -H "Content-Type: application/json" -d '{"email": "test@example.com", "password": "securePassword123"}' http://localhost:3000/api/v1/login
        ```

    * **Response:**
        * A JSON object containing the JWT token.

        ```json
        {
            "token": "your_jwt_token"
        }
        ```

### 3.  **Text Summarization (POST /api/v1/summarize)**

    * **Description:** Summarizes the provided text using the Google Gemini API.
    * **Request Body (JSON):**

        ```json
        {
            "transcription": "Detective Reynolds, I need a complete rundown of the Vance murder case..."
        }
        ```

        * Note: the api is designed to find text in any key, so any key with a string as value will work.

    * **Headers:**
        * `Authorization: Bearer <your_jwt_token>`

    * **Example cURL request:**

        ```bash
        curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer your_jwt_token" -d '{"transcription": "Detective Reynolds, I need a complete rundown of the Vance murder case..."}' http://localhost:3000/api/v1/summarize
        ```

    * **Response:**
        * A JSON object containing the original text and the summary.

        ```json
        {
            "originalText": "Detective Reynolds, I need a complete rundown of the Vance murder case...",
            "summary": "Summary of the murder case..."
        }
        ```

## Postman Collection Example

1.  **User Creation:**
    * Method: POST
    * URL: `http://localhost:3000/api/v1/user`
    * Headers: `Content-Type: application/json`
    * Body: Raw (JSON)

        ```json
        {
            "email": "[email address removed]",
            "password": "postmanPassword",
            "name": "Postman User"
        }
        ```

2.  **User Login:**
    * Method: POST
    * URL: `http://localhost:3000/api/v1/login`
    * Headers: `Content-Type: application/json`
    * Body: Raw (JSON)

        ```json
        {
            "email": "[email address removed]",
            "password": "postmanPassword"
        }
        ```

    * Save the `token` value from the response.

3.  **Text Summarization:**
    * Method: POST
    * URL: `http://localhost:3000/api/v1/summarize`
    * Headers:
        * `Content-Type: application/json`
        * `Authorization: Bearer <your_jwt_token>` (replace `<your_jwt_token>` with the token from the login response)
    * Body: Raw (JSON)

        ```json
        {
            "transcription": "A long text that will be summarized."
        }
        ```
