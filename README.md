# Tracepath Diagnostic Server

This repository contains the diagnostic server for the Tracepath application. The **diagnostic server** generates the report (i.e. visual tracerouting, performance reports using lighthouse on a headless chromium browser, etc) on a cloud instance deployed in a particular region & is built using Express Generator, a popular Node.js framework for building web applications.

## Manual setup

---

## Getting Started

To set up the diagnostic server locally, follow the instructions below:

### Prerequisites

Make sure you have the following software installed on your machine:

- Node.js (LTS)
  ```
  node -v
  ```
- npm (Node Package Manager)

  ```
  npm -v
  ```

- traceroute
  ```
  sudo apt-get install traceroute
  ```
- Chromium/Chrome browser

  ```
  sudo apt install -y chromium-browser
  ```

### Installation

```
# Clone the repository to your local machine
git clone https://github.com/n00bgineer/tracepath-diagonostics.git ./diagonostic

# Change into the project directory
cd diagnostic

# Install the dependencies
npm install
```

### Configuration

The server requires a configuration file to run properly. Create a file named .env in the root directory of the project and define the following environment variables:

```
PORT=3000 # The port on which the server should listen
```

### Starting the Server

To start the server, run the following command:

```
npm start
```

The server will start running on the specified port (default: 3000). You can access it via http://localhost:3000.

## Automated Setup (Setup)

---

🚧 TBD

## API Endpoints

---

The diagnostic server provides the following API endpoints:

```
GET /api/status: Check if the server is running and responsive.
POST /api/report: Submit a report generation request to the server.
```

## API Documentation

---

For detailed information about each endpoint and how to use them, refer to the API documentation. The documentation is available at http://localhost:3000/api-docs when the server is running.

## Contributing

---

Contributions are welcome! If you find any issues or want to add new features, please open an issue or submit a pull request to the GitHub repository.

Before contributing, please read the contribution guidelines. If you have any questions or need assistance, please contact our support team at `n00bgineer@protonmail.com`.
