#!/bin/sh
echo "Create package.json file"
cat > package.json <<EOF
{
    "name": "DKA-shop",
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1",
        "lint": "eslint . --fix --max-warnings=0",
        "migrate": "sequelize db:migrate",
        "seed": "sequelize db:seed:all"
    },
    "author": "scrum-members",
    "license": "ISC",
    "devDependencies": {
        "@eslint/js": "^9.12.0",
        "eslint": "^9.12.0",
        "eslint-plugin-react": "^7.37.1",
        "globals": "^15.10.0",
        "lint-staged": "^15.2.10"
    },
    "lint-staged": {
        "*.{js,ts,jsx,tsx}": [
            "eslint --fix --max-warnings=0",
            "prettier --write"
        ]
    },
    "dependencies": {
        "DKA-shop": "file:"
    }
}
EOF
echo "Migrating..."
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all


echo "Remove package.json and package-lock.json"
rm package.json
rm package-lock.json


echo "Migration done"