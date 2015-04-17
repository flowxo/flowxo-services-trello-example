# Flow XO Trello Service

This is an example Trello service module for the [Flow XO](https://flowxo.com) platform. For more details on how to develop and test this service, please refer to the [Flow XO SDK](http://github.com/flowxo/flowxo-sdk).

## Authorization

Trello uses OAuth 1, which means that before running the tests, you need to fill in the following environment variables with your Trello details:

- TRELLO_KEY=<your_trello_key>
- TRELLO_SECRET=<your_trello_secret>

Get your Trello keys by following the instructions on the [Trello API documentation site](https://trello.com/docs/).

## Contributing

``` bash
# Clone the repo
git clone https://github.com/flowxo/flowxo-services-trello

# Install the dependencies
npm install -g yo grunt-cli
npm install

# Generate a new method
yo flowxo:method

# Watch files for changes, running style checks and unit tests on change
grunt

# Run unit tests
grunt test

# Create/renew an authentication file
grunt auth

# Run integration tests, using authentication
grunt run [--record --replay --name=<name>]

```

