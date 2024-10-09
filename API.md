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
        "email": "phuongha@gmail.com",
        "role": "Staff",
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

## Category

<span style="color:red">**The examples below only apply when Passport is disabled.**</span>

### Create a new category
```bash
curl --location 'http://localhost:8088/api/admin/categories' \
--header 'Content-Type: application/json' \
--data '{
    "name": "Category1",
    "description": "This is description"
}'
```

Output:
```json
{
    "is_deleted": false,
    "id": 4,
    "name": "Category1",
    "description": "This is description",
    "updatedAt": "2024-10-09T03:57:33.921Z",
    "createdAt": "2024-10-09T03:57:33.921Z"
}
```

### Delete a category with categoryId
```bash
curl --location --request DELETE 'http://localhost:8088/api/admin/categories/4'
```

Output (successful)
```json
{
    "message": "Category with id: 4 deleted successfully"
}
```

Output (error)

```json
{
    "code": 404,
    "message": "Category not found"
}
```