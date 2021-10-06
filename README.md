### Solution

- They key / url is committed, for practicality.


To start:
1. Install with `yarn` or `npm` (I use `yarn`)
2. `dotenv-flow` takes in `NODE_ENV={environment}` to match the key file `.env.${environment}`, in this case: `NODE_ENV=development`. `yarn start` is configured with `NODE_ENV=development`


With more time, I'd improve:
- More responses (ending it at words question): I would use the same condition matching, and extract the response similar to `extractNumbers`
- Use enums for common variables, and Error Instances with enums for error handling
- Setup babel for ES6