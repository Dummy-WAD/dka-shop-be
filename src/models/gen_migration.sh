#!/bin/sh
echo "Generate config/config.json file"
user=$1
password=$2
cp -r config/config.json config/config.json.bak
cat > config/config.json <<EOF
{
    "development": {
        "username": "$user",
        "password": "$password",
        "database": "dka_shop",
        "host": "127.0.0.1",
        "dialect": "mysql",
        "port": 3306
    },
    "test": {
        "username": "$user",
        "password": "$password",
        "database": "dka_shop",
        "host": "",
        "dialect": "mysql"
    },
    "production": {
        "username": "$user",
        "password": "$password",
        "database": "dka_shop",
        "host": "",
        "dialect": "mysql"
    }
}
EOF

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

echo "Restore config/config.json file"
mv config/config.json.bak config/config.json
rm config/config.json.bak