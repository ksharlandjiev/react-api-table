[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ksharlandjiev_react-api-table&metric=alert_status)](https://sonarcloud.io/dashboard?id=ksharlandjiev_react-api-table)

# React table with remote API data

## Background
The task is to create a single page JavaScript application using React. The app should consume a paginated API endpoint and visualise data in a list.

The application should use React Bootstrap with modified primary colour: (#1D7874)

The applicaiton should feature an URL indication of the page, so that specific page can be directly accessible via URL.

Example: http://localhost:3000/#5 represents page 5.

## Decision taken to complete this task.
For the realisation of this challenge, a decision was made to use a existing component for list view: **react-bootstrap-table-next**.

Initial implementation was to query the endpoint on each page, but this is unefficient and will cause performance issues and bad customer experience.

Hence why a decision was made to initially cache a portion of the API result and incrementally cache missing data.

## Installation & Run in watch mode:
```
yarn install
```
## Configuration

Table specific configuraiton is located in: **./src/config/table_properites.json**

Endpoint URL, Items per page and Cache configuration are stored as environment variables in **.evn** file.
 
## Available Scripts

Inside the project directory, you can run:
```
yarn start
```

Runs the app and the proxy server in the development mode.

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.



