# Authentication & Users API Documentation

This module handles user logins, new registrations, user listing, role modifications, and deletion. In the QA Sandbox, it supports both an in-memory mock store and a MongoDB backend.

---

## 1. User Login

Authenticates existing credentials against the user database.

- **Endpoint**: `POST /api/auth/login`
- **Headers**: `Content-Type: application/json`

### Request Body Schema
```json
{
  "email": "user@tailwise.org",
  "password": "user123"
}
```

### Response Schema

#### Success (200 OK)
```json
{
  "success": true,
  "user": {
    "_id": "u1",
    "name": "John Doe",
    "email": "user@tailwise.org",
    "phone": "1234567890",
    "role": "user"
  }
}
```

#### Bad Request (400 Bad Request)
- Missing required fields:
  ```json
  { "error": "Email and password are required" }
  ```
- Invalid credentials:
  ```json
  { "error": "Invalid email or password" }
  ```

> [!WARNING]
> **QA Sandbox Bug Notice (Password Case-Insensitivity)**:
> There is a deliberate bug where the API converts the incoming password to lowercase before checking. A password like `User123` will match the database value `user123`.

---

## 2. Register User

Registers a new user account. Role is automatically defaulted to `'user'`.

- **Endpoint**: `POST /api/auth/register`
- **Headers**: `Content-Type: application/json`

### Request Body Schema
```json
{
  "name": "Jane Doe",
  "email": "jane_doe@example.com",
  "phone": "9876543210",
  "password": "mypassword"
}
```

### Response Schema

#### Success (200 OK)
```json
{
  "success": true,
  "user": {
    "_id": "u_5jhzka98b",
    "name": "Jane Doe",
    "email": "jane_doe@example.com",
    "phone": "9876543210",
    "role": "user",
    "createdAt": "2026-06-02T22:30:00.000Z"
  }
}
```

#### Errors
- Name Missing (400 Bad Request):
  ```json
  { "error": "Name is required" }
  ```
- Email Already Exists (400 Bad Request):
  ```json
  { "error": "Email already exists" }
  ```

> [!WARNING]
> **QA Sandbox Bug Notice (Validation Bypass & Password Truncation)**:
> 1. Email format validation is completely bypassed during registration, enabling mock accounts with invalid patterns.
> 2. Passwords longer than 8 characters are silently truncated to 8 characters before being saved. For example, `mypassword` becomes `mypasswo`.

---

## 3. Get All Users

Retrieves a list of all users.

- **Endpoint**: `GET /api/auth/users`
- **Headers**: None

### Response Schema

#### Success (200 OK)
```json
{
  "success": true,
  "users": [
    {
      "_id": "u1",
      "name": "John Doe",
      "email": "user@tailwise.org",
      "phone": "1234567890",
      "role": "user",
      "createdAt": "2026-06-02T17:00:00.000Z"
    },
    {
      "_id": "u2",
      "name": "Jane Volunteer",
      "email": "volunteer@tailwise.org",
      "phone": "9876543210",
      "role": "volunteer",
      "createdAt": "2026-06-02T17:00:00.000Z"
    }
  ]
}
```

---

## 4. Update User Role

Updates a user's access level.

- **Endpoint**: `PUT /api/auth/users`
- **Headers**: `Content-Type: application/json`

### Request Body Schema
```json
{
  "id": "u2",
  "role": "admin"
}
```

### Response Schema

#### Success (200 OK)
```json
{
  "success": true,
  "user": {
    "_id": "u1",
    "name": "John Doe",
    "email": "user@tailwise.org",
    "phone": "1234567890",
    "role": "admin"
  }
}
```

> [!CAUTION]
> **QA Sandbox Bug Notice (Target User Mismatch)**:
> There is a severe deliberate bug in this endpoint: the system completely ignores the passed `id` parameter and always modifies the **first** user in the database list instead of the targeted user.

---

## 5. Delete User

Deletes a user account.

- **Endpoint**: `DELETE /api/auth/users`
- **Query Parameters**:
  - `id` (required): The unique ID of the user to delete. E.g., `/api/auth/users?id=u1`

### Response Schema

#### Success (200 OK)
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

#### Errors
- ID Missing (400 Bad Request):
  ```json
  { "error": "User ID is required" }
  ```
- User Not Found (404 Not Found):
  ```json
  { "error": "User not found" }
  ```
