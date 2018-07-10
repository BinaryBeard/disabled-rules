Finds all `eslint-disable` keywords and reports all the exceptions your code base makes.

## Installation:

```bash
npm install disabled-rules -g
```

## Usage:

```bash
$ disabled              # will search for eslint-disable keywords in cwd
$ disabled lib/ test/   # will search only in lib and test
```

## What It Does:

For example, if a file contained these lines somewhere in it...

```bash
/* eslint-disable */
// eslint-disable other-stuff
// eslint-disable-line sams-code
// eslint-disable-next-line crazy-stuff, more-crazy-stuff
/* eslint-enable */
```

The program would return:

```bash
src/index.js
  Line 91: DISABLED EVERYTHING
  Line 92: DISABLED other-stuff
  Line 93: LINE DISABLED jims-code
  Line 94: NEXT LINE DISABLED crazy-stuff, more-crazy-stuff
  Line 95: ENABLED EVERYTHING

5 eslint exceptions have been found
The linting rules should be re-evaluated for this project
```
