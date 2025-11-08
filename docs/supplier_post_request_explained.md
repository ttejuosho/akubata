# API Request Explanation (POST /api/suppliers)

## 1. Request Method & Endpoint

**POST** `http://localhost:5001/api/suppliers`  
This sends data to the server to **create a new supplier**.

---

## 2. Request Body (JSON Sent to Server)

```json
{
  "companyName": "Shenzhen Beauty Inc",
  "contactName": "Jack Zhou Chen",
  "contactEmail": "jackchen@shenzhen.com",
  "contactPhone": "20947749479292",
  "address": "Shanghai Industrial Village",
  "city": "Shanghai",
  "state": "Shanghai",
  "country": "China"
}
```

This is the data being submitted to the API.

---

## 3. Response Status: **201 Created**

This confirms the supplier was successfully created.

---

## 4. Response Body (Data Returned from Server)

```json
{
  "message": "Supplier created successfully",
  "supplier": {
    "supplierId": "1b54d487-fe49-4d69-be9e-dfde6ea6a024",
    "isActive": true,
    "companyName": "Shenzhen Beauty Inc",
    "contactName": "Jack Zhou Chen",
    "contactEmail": "jackchen@shenzhen.com",
    "contactPhone": "20947749479292",
    "address": "Shanghai Industrial Village",
    "city": "Shanghai",
    "state": "Shanghai",
    "country": "China",
    "updatedAt": "2025-11-08T15:21:25.891Z",
    "createdAt": "2025-11-08T15:21:25.891Z"
  }
}
```
