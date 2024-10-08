# DKA Shop - An online local store offering a wide variety of clothing for all ages and styles

## Introduction
DKA Shop is an e-commerce platform specializing in fashion retail. It provides customers with an easy-to-use interface for browsing, searching, and purchasing clothing products.

## Setup
### Install
1. Clone the repository: `https://github.com/Dummy-WAD/dka-shop-be.git`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`.
### Configure project to connect to your database
1. Go to `src\models\config\config.json` to fix your database config
### Initialize the database
1. To init the database `npx sequelize-cli db:migrate`
2. To seed data: 
    Run all files: `npx sequelize-cli db:seed:all`
    Run a seed file: `npx sequelize-cli db:seed --seed <seed-filename>`
### Run the application
Start the application using `npm run dev`
### Usage
After setting up, navigate to `http://localhost:YOUR_PORT` in your browser to access the DKA Shop application.