# Services, PetShop, Vet & Auxiliary APIs Documentation

This document covers all auxiliary APIs including Pet Shop products & checkout, Veterinary search & bookings, AI/ML species identification classifier, Client Console logging, and sandbox database resets.

---

## 1. Pet Shop APIs

### Search Products
Retrieves available shop products.

- **Endpoint**: `GET /api/petShop`
- **Query Parameters**:
  - `q` (optional): Query term to search by product name.

#### Response Schema (200 OK)
```json
{
  "success": true,
  "products": [
    {
      "_id": "p1",
      "name": "Premium Dog Food",
      "price": 29.99,
      "description": "Nutritious high-protein kibble for active adult dogs.",
      "imageUrl": "https://images.unsplash.com/photo-1585499103188-5972f78a727f?w=600",
      "shopName": "Happy Tails Shop",
      "shopLocation": "Downtown",
      "shopPhone": "9998887777",
      "stock": 15
    }
  ]
}
```

> [!WARNING]
> **QA Sandbox Bug Notice (Case-Sensitive Search)**:
> The search term query `q` is case-sensitive. Searching for `dog` yields 0 results, while searching for `Dog` matches "Premium Dog Food".

---

### Pet Shop Checkout
Performs checkout on a list of cart items.

- **Endpoint**: `POST /api/petShop`
- **Headers**: `Content-Type: application/json`

#### Request Body Schema
```json
{
  "items": [
    {
      "productId": "p1",
      "quantity": 2
    }
  ]
}
```

#### Response Schema (200 OK)
```json
{
  "success": true,
  "message": "Checkout successful!",
  "totalPrice": 59.98,
  "items": [
    {
      "name": "Premium Dog Food",
      "price": 29.99,
      "quantity": 2
    }
  ]
}
```

> [!WARNING]
> **QA Sandbox Bug Notice (Negative Quantities Allowed)**:
> The checkout endpoint fails to check if quantity is greater than zero. You can send a negative quantity (e.g. `quantity: -5`). This decreases the total price (resulting in negative checkout balances) and actually INCREASES the product stock by 5!

---

## 2. Veterinary APIs

### Search Clinics
Retrieves veterinary clinics by city.

- **Endpoint**: `GET /api/veterinary`
- **Query Parameters**:
  - `city` (optional): Filter clinics by city.

#### Response Schema (200 OK)
```json
{
  "success": true,
  "vets": [
    {
      "_id": "v1",
      "name": "City Animal Hospital",
      "city": "Downtown",
      "address": "123 Vet Blvd, Suite A",
      "phone": "222-333-4444",
      "specialty": "General practice & Surgery",
      "rating": 4.8
    }
  ]
}
```

> [!WARNING]
> **QA Sandbox Bug Notice (Suburbs Search Crash)**:
> Requesting the city `"Suburbs"` (case-sensitive) returns zero hospital results, which triggers an unhandled TypeError crash on the client application when parsing the layout.

---

### Book Vet Appointment
Books an appointment at a vet clinic.

- **Endpoint**: `POST /api/veterinary`
- **Headers**: `Content-Type: application/json`

#### Request Body Schema
```json
{
  "clinicId": "v2",
  "petName": "Luna",
  "reason": "Annual rabies vaccines",
  "date": "2026-06-10",
  "time": "10:30 AM"
}
```

#### Response Schema (200 OK)
```json
{
  "success": true,
  "message": "Appointment successfully booked with City Animal Hospital!",
  "appointment": {
    "clinicId": "v1",
    "clinicName": "City Animal Hospital",
    "petName": "Luna",
    "reason": "Annual rabies vaccines",
    "date": "2026-06-10",
    "time": "10:30 AM"
  }
}
```

> [!CAUTION]
> **QA Sandbox Bug Notice (Appointment Target Swap)**:
> The booking endpoint ignores the provided `clinicId` parameter and always books the appointment at the clinic at index 0 (`mockDb.vets[0]` / first clinic in DB).

---

## 3. AI/ML Classification

### Identify Species
Uses a simulated file-classifier logic to determine whether an image is a Dog or Cat.

- **Endpoint**: `POST /api/identify`
- **Headers**: `Content-Type: application/json`

#### Request Body Schema
```json
{
  "fileName": "dog_retriever.png"
}
```

#### Response Schema (200 OK)
```json
{
  "success": true,
  "species": "Dog",
  "breed": "Golden Retriever",
  "confidence": 0.92,
  "modelDetails": "MobileNetV3-TailWise Animal Classifier v1.2"
}
```

> [!WARNING]
> **QA Sandbox Bug Notice (D-Letter Classification Rule)**:
> The classification ML logic is fake: it simply checks if the lowercased filename contains the letter `'d'`. If it does, it classifies it as a Dog. Otherwise, it defaults to a Cat.

---

## 4. Client Console Logging

### Log Client Activity
Accepts client-side actions and logs them inside the backend server console terminal.

- **Endpoint**: `POST /api/log`
- **Headers**: `Content-Type: application/json`

#### Request Body Schema
```json
{
  "action": "PAGE_NAVIGATION",
  "details": {
    "from": "/",
    "to": "/veterinary"
  }
}
```

#### Response Schema (200 OK)
```json
{
  "success": true
}
```

---

## 5. Sandbox Database Reset

### Reset Sandbox Database
Restores mock variables and collections in memory back to their seeded defaults.

- **Endpoint**: `POST /api/reset`
- **Headers**: None

#### Response Schema (200 OK)
```json
{
  "success": true,
  "message": "Database reset successfully"
}
```
