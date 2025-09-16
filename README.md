# HTML CSV JSON App

## Description
This project is a web application that allows users to read and write data in CSV and JSON formats. It provides a user-friendly interface for interacting with these data formats and is built using Node.js and Express.

## Project Structure
```
jojo-rugby
├── public
│   ├── index.html        # Main HTML file for the user interface
│   └── styles.css       # Styles for the HTML page
├── src
│   ├── server.js        # Entry point of the application
│   ├── routes
│   │   ├── csv.js       # Routes for handling CSV data
│   │   └── json.js      # Routes for handling JSON data
│   └── utils
│       ├── csvHandler.js # Utility functions for CSV handling
│       └── jsonHandler.js # Utility functions for JSON handling
├── package.json          # npm configuration file
└── README.md             # Project documentation
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd jojo-rugby
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
1. Start the server:
   ```
   npm start
   ```
2. Open your web browser and go to `http://localhost:3000` to access the application.

## Features
- Read and write CSV files.
- Read and write JSON files.
- User-friendly interface for data manipulation.

## Contributing
Feel free to submit issues or pull requests for improvements or bug fixes.