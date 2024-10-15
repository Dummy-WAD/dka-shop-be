# Customer API Documentation

## Overview
This document provides an overview of the Customer API endpoints, request/response formats, and usage examples.

## Endpoints
- **GET /**: Get customer information

## Examples
### Get customer information
Command
```bash
curl --location 'http://localhost:8088/api/customer' \
--header 'Authorization: ••••••'
```
OUTPUT:
```json
{
    "id": 2,
    "email": "phuongha@gmail.com",
    "firstName": "Ha",
    "lastName": "Nguyen Phuong",
    "role": "CUSTOMER",
    "status": null
}
```