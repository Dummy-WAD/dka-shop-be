# API manual

API:
+ Admin
    + 
+ Customer
    + Customer
        + [Get Customer information](docs/customer.md#customer-api-documentation)
+ Auth
    + [Login](docs/auth.md#login)
    + [Sign-up](docs/auth.md#sign-up)
    + [Logout](docs/auth.md#logout)
    + [Refresh-Token](docs/auth.md#refresh-token)

## Category

<!-- <span style="color:red">**The examples below only apply when Passport is disabled.**</span> -->

### Get all categories
```bash
curl --location 'http://localhost:8088/api/admin/categories' \
--header 'Authorization: ••••••'
```

```json
{
    "results": [
        {
            "id": 7,
            "name": "Category3",
            "description": "This is description",
            "is_deleted": false,
            "createdAt": "2024-10-10T09:54:28.000Z",
            "updatedAt": "2024-10-10T09:54:28.000Z"
        }
    ],
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "totalResults": 1
}
```


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