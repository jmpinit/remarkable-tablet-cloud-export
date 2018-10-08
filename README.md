# ReMarkable Tablet Cloud Export

Export the files in your ReMarkable cloud account.

Does not yet preserve the metadata associated with each file, just the contents and hierarchy.

## Usage

Generate a [one-time code](https://my.remarkable.com/generator-device) and insert it in the command below:

`node index.js --output=remarkable-backup --code=[a one-time-code]`

Please be a good neighbor and avoid DDOSing the ReMarkable infrastructure by creating many large
backups in a short time, they can potentially be several gigs in size.
