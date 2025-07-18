[![REUSE status](https://api.reuse.software/badge/github.com/openmcp-project/docs)](https://api.reuse.software/info/github.com/openmcp-project/docs)

# docs

## About this project

Documentation and Architecture for the openmcp-project.

## Getting Started

This site is built with [Docusaurus 3](https://docusaurus.io/).

### 🚧 Prerequisites

Make sure that you have installed the following tools on your local machine:

- [Node.js](https://nodejs.org/en/download/) version 18.0 or above

### 🧑‍💻 Local Development

```sh
# Install the latest packages.
$ npm install

# Start the development server.
$ npm start
```

The local development server should start and open up a browser window. Most changes are reflected live without having to restart the server or reload the website.

Changes to the documentation must be done via pull requests. A GitHub Actions [workflow](.github/workflows/test-deploy.yml) will check if the website can be built.

### 🌍 Deployment

Deployment is done using a GitHub Actions [workflow](.github/workflows/deploy.yml) when there are new commits on the `main` branch.

## Support, Feedback, Contributing

This project is open to feature requests/suggestions, bug reports etc. via [GitHub issues](https://github.com/openmcp-project/docs/issues). Contribution and feedback are encouraged and always welcome. For more information about how to contribute, the project structure, as well as additional contribution information, see our [Contribution Guidelines](CONTRIBUTING.md).

## Security / Disclosure

If you find any bug that may be a security problem, please follow our instructions at [in our security policy](https://github.com/openmcp-project/docs/security/policy) on how to report it. Please do not create GitHub issues for security-related doubts or problems.

## Code of Conduct

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone. By participating in this project, you agree to abide by its [Code of Conduct](https://github.com/SAP/.github/blob/main/CODE_OF_CONDUCT.md) at all times.

## Licensing

Copyright 2025 SAP SE or an SAP affiliate company and openMCP contributors. Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/openmcp-project/docs).
