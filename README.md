# Flow XO Trello Example Service

This is a Trello Example service module for the [Flow XO](https://flowxo.com) platform. For more details on how to develop and test this service, please refer to the [Flow XO SDK](http://github.com/flowxo/flowxo-sdk).

## Integration Tests

First you'll need to edit `runs/runs.json` and find/replace `55030d2096b2b4a164141a27` (a board ID) with a board ID from your Trello test account.  Then find/replace `550310847ac11a6390bd4d89` (a list ID) with a list ID within the board that you're testing with.

Then run `grunt run --replay` to step through this sequence of tests:

- New Card - no new cards (success)
- Add a Card - name/board/list only (success)
- Add a Card - all fields except copy card URL/ID and member (success)
- New Card - finds 2 new cards (success - CHECK FIELDS PRESENT)
- Add a Card - invalid due date/time (error - Due is not a valid datetime input)
- Add a Card - no board ID (error - Board ID can't be blank)
- Add a Card - no list ID (error - List ID can't be blank)
- Add a Card - no fields (error - Board ID can't be blank)
- Add a Card - invalid card copy URL (success)
- New Card - finds 1 new item (success)

#### Notes About Integration Tests

We plan to improve our integration test tooling soon, and add some much needed features.  For now, the idea is to create a sequence of reproducible test methods that prove that the service fundamentally works.  The whole sequence should take no longer than a few minutes to work through.

When you start developing for a service, you should ask Flow XO for access to a shared test account.  Then run your tests against this account.  That way, we don't need to find/replace ID's as we have here.  For testing updates, use a persistent record (mark it _DO NOT DELETE_) that always exists and is ready to run tests against.

Ask us if you're not sure how to structure your tests.

## Usage

Steps to run the service from the command line using the Flow XO SDK

``` bash
# Clone the repo
git clone https://github.com/flowxo/flowxo-services-trello-example
cd flowxo-services-trello-example

# Install the dependencies
npm install
grunt init

# Create a .env file with the following content (no hashes):
TRELLO_EXAMPLE_KEY=<YOUR_APP_KEY>
TRELLO_EXAMPLE_SECRET=<YOUR_APP_SECRET>

# Create an authentication
grunt auth

# Run methods
grunt run
```

## Contributing

``` bash
# Clone the repo
git clone https://github.com/flowxo/flowxo-services-trello-example

# Install the dependencies
npm install -g yo grunt-cli
npm install
grunt init

# Generate a new method
yo flowxo:method

# Watch files for changes and running style checks on change
grunt

# Create/renew an authentication file
grunt auth

# Run integration tests, using authentication
grunt run [--record --replay --name=<name>]

```
