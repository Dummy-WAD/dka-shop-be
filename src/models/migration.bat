@echo off
echo Create package.json file
(
echo {
echo     "name": "DKA-shop",
echo     "scripts": {
echo         "test": "echo \"Error: no test specified\" && exit 1",
echo         "lint": "eslint . --fix --max-warnings=0",
echo         "migrate": "sequelize db:migrate",
echo         "seed": "sequelize db:seed:all"
echo     },
echo     "author": "scrum-members",
echo     "license": "ISC",
echo     "devDependencies": {
echo         "@eslint/js": "^9.12.0",
echo         "eslint": "^9.12.0",
echo         "eslint-plugin-react": "^7.37.1",
echo         "globals": "^15.10.0",
echo         "lint-staged": "^15.2.10"
echo     },
echo     "lint-staged": {
echo         "*.{js,ts,jsx,tsx}": [
echo             "eslint --fix --max-warnings=0",
echo             "prettier --write"
echo         ]
echo     },
echo     "dependencies": {
echo         "DKA-shop": "file:"
echo     }
echo }
) > package.json

echo Migrating...
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

echo Remove package.json and package-lock.json
del package.json
del package-lock.json

echo Migration done
