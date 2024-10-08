# API manual
## Login 
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
        "first_name": "Ha",
        "last_name": "Nguyen Phuong",
        "email": "phuongha@gmail.com",
        "password": "$2y$10$NVdVT5fdzPLiHpUK9c95geYV3L51IzrgnRuDIoHus.TalwidmFfzW",
        "phone_number": "0353905692",
        "gender": "0",
        "role": "Staff",
        "status": null,
        "register_at": "2024-10-08 14:53:16",
        "createdAt": "2024-10-08T14:53:16.000Z",
        "updatedAt": "2024-10-08T14:53:16.000Z"
    },
    "tokens": {
        "access": {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOnsiaWQiOjIsImVtYWlsIjoicGh1b25naGFAZ21haWwuY29tIiwicm9sZSI6IlN0YWZmIn0sImlhdCI6MTcyODQwMDgzNiwiZXhwIjoxNzI4NDAyNjM2LCJ0eXBlIjoiYWNjZXNzIn0.3vjaMk0bCnppMxDwLCmvqFfS5r35MdSASxdw7Xq-qCA",
            "expires": "2024-10-08T15:50:36.597Z"
        },
        "refresh": {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOnsiaWQiOjIsImVtYWlsIjoicGh1b25naGFAZ21haWwuY29tIiwicm9sZSI6IlN0YWZmIn0sImlhdCI6MTcyODQwMDgzNiwiZXhwIjoxNzMwOTkyODM2LCJ0eXBlIjoicmVmcmVzaCJ9.8bVkYBa1bDlXTi3G5AES8QF29UrAWc2xY-wHRYgF2A4",
            "expires": "2024-11-07T15:20:36.602Z"
        }
    }
}
```