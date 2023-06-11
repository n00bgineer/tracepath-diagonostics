# Tracepath Diagnostic Server

**Tracepath** is an open-source application for performance and security monitoring. Currently, for any given web application's URL (e.g., pangea.cloud), it generates a report consisting of two parts:

1. **Performance analysis**, which contains the web application's performance report generated against one of Tracepath's diagnostic servers. These servers run on a cloud instance deployed at a specific location (e.g., Mumbai, Stockholm). The performance analysis is conducted using Google's `lighthouse` tool running on a headless Chrome browser. However, unlike a typical Lighthouse report, Tracepath presents the performance metrics in a jargon-free form that can be easily understood by non-technical stakeholders of a project.

2. **Security tracerouting**, a unique feature offered by Tracepath, helps visualize the routing path of packets along with their geographic location and IP reputation score to identify malicious IP addresses through which the IP packets might be passing. It combines tracerouting, IP geolocation, and IP threat/reputation intelligence.

This repository contains the code for the **diagnostic server** of Tracepath. The **diagnostic server** is responsible for generating the report (i.e. security tracerouting, performance reports using lighthouse on a headless chromium browser, etc) on a cloud instance deployed in a particular region, which is consumed by the [application client & server](https://github.com/n00bgineer/tracepath) & is built using Express.js, a popular Node.js framework for building server applications.

![Tracepath structure](https://res.cloudinary.com/dgu9rv3om/image/upload/v1686484359/Screenshot_from_2023-06-11_17-21-44_oewpc4.png)

## Pangea API usage

Curently, two API endpoints of Pangea have been used to implement the security tracerouting feature, which is a combination of IP geolocation & IP threat/reputation score:

1. IP (Reputation) Geolocation Endpoint
2. IP (Reputation) Reputation Endpoint

You can find it's implementation in [`/methods/traceroute.js`](https://github.com/n00bgineer/tracepath-diagonostics/blob/master/methods/traceroute.js), where the security tracerouting feature has been implemented.

## Getting Started

To set up the diagnostic server locally, follow the instructions below:

### Manual Setup

  ```
  node -v
  npm -v
  sudo apt-get install traceroute
  sudo apt install -y chromium-browser
  git clone https://github.com/n00bgineer/tracepath-diagonostics.git ./diagonostic  
  cd diagnostic
  npm install
  bash /scripts/setup_prisma.sh
  npm start
  ```
### Automated Setup (Setup)
  ```
  git clone https://github.com/n00bgineer/tracepath-diagonostics.git ./diagonostic  
  cd diagnostic
  sudo bash /scripts/setup.sh
  bash /scripts/setup_prisma.sh
  npm install
  npm start
  ```
### Configuration
The server requires a configuration file to run properly. Create a file named .env in the root directory of the project and define the following environment variables:
```
PORT=3000 # The port on which the server should listen
```

## API Endpoints

The diagnostic server provides the following API endpoints:

```
GET /api/status: Check if the server is running and responsive.
POST /api/report: Submit a report generation request to the server.
```

## Contributing

Contributions are welcome! If you find any issues or want to add new features, please open an issue or submit a pull request to the GitHub repository.

Before contributing, please read the contribution guidelines. If you have any questions or need assistance, please contact our support team at `n00bgineer@protonmail.com`.
