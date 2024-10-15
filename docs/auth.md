# Authentication Documentation

## Overview
This document provides an overview of the authentication mechanisms used in the `dka-shop` backend.

## Table of Contents
1. [Introduction](#introduction)
2. [Authentication Flow](#authentication-flow)
3. [Endpoints](#endpoints)
4. [Examples](#examples)
5. [Error Handling](#error-handling)

## Introduction
Authentication is a crucial part of the `dka-shop` backend, ensuring that users can securely access their accounts and perform actions.

## Authentication Flow
1. **User Registration**: Users register by providing necessary details.
2. **Login**: Users log in using their credentials.
3. **Token Generation**: Upon successful login, a JWT token is generated.
4. **Token Validation**: Each request is validated using the JWT token.

## Endpoints
- **POST /sign-up**: Register a new user.
- **POST /login**: Authenticate a user and return a JWT token.
- **POST /logout**: Log out a user
- **POST /refresh-token**: Generate a new access token using a valid refresh token.
## Examples
### Login
```bash
curl --location 'http://<HOST>:<PORT>/api/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "<<email>>",
    "password": "<<password>>"
}'
```
Example: 

Please open the `Terminal` and type the following command: 
```bash
curl --location 'http://localhost:8088/api/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "phuongha@gmail.com",
    "password": "phuongha@123"
}'
```

Output:
```json
{
    "user": {
        "id": 2,
        "email": "phuongha@gmail.com",
        "role": "CUSTOMER",
        "status": null,
        "fullName": "Nguyen Phuong Ha"
    },
    "tokens": {
        "access": {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOnsiaWQiOjIsImVtYWlsIjoicGh1b25naGFAZ21haWwuY29tIiwicm9sZSI6IlN0YWZmIn0sImlhdCI6MTcyODQ4MjcwMSwiZXhwIjoxNzI4NDg0NTAxLCJ0eXBlIjoiYWNjZXNzIn0.eKePbj-aHp_ATjmKsruZonKD5IbJEM96-slNb2c_FNg",
            "expires": "2024-10-09T14:35:01.687Z"
        },
        "refresh": {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOnsiaWQiOjIsImVtYWlsIjoicGh1b25naGFAZ21haWwuY29tIiwicm9sZSI6IlN0YWZmIn0sImlhdCI6MTcyODQ4MjcwMSwiZXhwIjoxNzMxMDc0NzAxLCJ0eXBlIjoicmVmcmVzaCJ9.qhXlrG0TW0x4RFzQuTxhFr6d9hC-kYl8jV1pXxOb_qQ",
            "expires": "2024-11-08T14:05:01.692Z"
        }
    }
}
```

### Sign-up
Command:
```bash
curl --location 'http://localhost:8088/api/auth/sign-up' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email":"test01@gmail.com",
    "firstName":"firstName",
    "lastName":"lastName",
    "phoneNumber":"0123456789",
    "password":"Password@123",
    "confirmPassword":"Password@123"
}'
```

OUTPUT: 
```json
{
    "user": {
        "id": 4,
        "email": "test01@gmail.com",
        "role": "CUSTOMER",
        "status": "INACTIVE"
    },
    "tokens": {
        "access": {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOnsiaWQiOjQsImVtYWlsIjoidGVzdDAxQGdtYWlsLmNvbSIsInJvbGUiOiJDVVNUT01FUiJ9LCJpYXQiOjE3Mjg5ODI5ODYsImV4cCI6MTcyODk4NDc4NiwidHlwZSI6ImFjY2VzcyJ9.oIY1BYEYPCGy-t5tmQcq1FZr2pSF-kzQiInNasqX74E",
            "expires": "2024-10-15T09:33:06.423Z"
        },
        "refresh": {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOnsiaWQiOjQsImVtYWlsIjoidGVzdDAxQGdtYWlsLmNvbSIsInJvbGUiOiJDVVNUT01FUiJ9LCJpYXQiOjE3Mjg5ODI5ODYsImV4cCI6MTczMTU3NDk4NiwidHlwZSI6InJlZnJlc2gifQ.MufIUcw2Rqy7A3Ykw1_0LqRnlFR072kAPz05D0SSXj0",
            "expires": "2024-11-14T09:03:06.427Z"
        }
    }
}
```

### Logout
Command:
```bash
curl --location 'http://localhost:8088/api/auth/logout' \
--header 'Content-Type: application/json' \
--header 'Authorization: ••••••' \
--data '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOnsiaWQiOjIsImVtYWlsIjoicGh1b25naGFAZ21haWwuY29tIiwicm9sZSI6IkNVU1RPTUVSIn0sImlhdCI6MTcyODk4MzMxMSwiZXhwIjoxNzMxNTc1MzExLCJ0eXBlIjoicmVmcmVzaCJ9.YYNpMhjimqFGQ_IdxPOvz30csejfMVx1WHMaDUrJUw0"
}'
```
OUTPUT:
```json
204: No Content
```

### Refresh-Token
```bash
curl --location 'http://localhost:8088/api/auth/refresh-token' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOnsiaWQiOjIsImVtYWlsIjoicGh1b25naGFAZ21haWwuY29tIiwicm9sZSI6IkNVU1RPTUVSIn0sImlhdCI6MTcyODk4MzU4NywiZXhwIjoxNzI4OTg1Mzg3LCJ0eXBlIjoiYWNjZXNzIn0.S1ei0NtXY24S4qA3-v7baQ6AGnY595wHrNNK2S2e8uc' \
--data '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOnsiaWQiOjIsImVtYWlsIjoicGh1b25naGFAZ21haWwuY29tIiwicm9sZSI6IkNVU1RPTUVSIn0sImlhdCI6MTcyODk4MzU4NywiZXhwIjoxNzMxNTc1NTg3LCJ0eXBlIjoicmVmcmVzaCJ9.sjqnCQjYWiO49stQghyuOPz7S3ync3_AOt44xMpYHhw"
}'
```
OUTPUT:
```json
{
    "access": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOnsiaWQiOjIsImVtYWlsIjoicGh1b25naGFAZ21haWwuY29tIiwicm9sZSI6IkNVU1RPTUVSIn0sImlhdCI6MTcyODk4MzY3NCwiZXhwIjoxNzI4OTg1NDc0LCJ0eXBlIjoiYWNjZXNzIn0.PY4f-UFne9rPQw4vbB-orbYzUneXhbtAJUDm2aVA4gA",
        "expires": "2024-10-15T09:44:34.110Z"
    },
    "refresh": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOnsiaWQiOjIsImVtYWlsIjoicGh1b25naGFAZ21haWwuY29tIiwicm9sZSI6IkNVU1RPTUVSIn0sImlhdCI6MTcyODk4MzY3NCwiZXhwIjoxNzMxNTc1Njc0LCJ0eXBlIjoicmVmcmVzaCJ9.I12IHo_4QMm3QgpeqL-CawV88JQ3X8JSIBBkCNk1g-U",
        "expires": "2024-11-14T09:14:34.111Z"
    }
}
```

## Error Handling
- **401 Unauthorized**: Invalid credentials or token.
- **400 Bad Request**: Missing or invalid parameters.

For more detailed information, refer to the API documentation.
