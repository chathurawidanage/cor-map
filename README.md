# Contact Tracing App

## Installation

```
yarn install
```

## Development

You can start the application locally in development mode by running `yarn start`.  The application should open on `localhost:3000` and present a dialog which allows you to select the target DHIS2 server and log in with credentials.

!> NOTE: Login will fail if the domain `http://localhost:3000` isn't listed in the CORS whitelist for the given DHIS2 instance!  The CORS whitelist can be edited from the System Settings application, under the Access tab.  You can also use wildcards, for instance `http://localhost:*` if you'd like.

The server you select is "sticky", so the next time you visit `http://localhost:3000` it will use an active session for the selected server (if one exists).  To clear this, simply log out from the link in the Headerbar, return to `http://localhost:3000`, and log in to a different server.

## Production Build

You can create a production build simply by running:

```
> yarn build
```

This creates a set of static files in `build/app` and also automatically generates a flat `.zip` file in `build/bundle` which can be uploaded directly to a DHIS2 instance using the App Management App, or uploaded to the [DHIS2 App Store](https://play.dhis2.org/appstore).

## Generalization TODO

1. [ ] Don't hardcode Program or Attribute UIDs
2. [ ] Use DataStore to allow application configuration with different programs
3. [ ] Use [@dhis2/ui-core] components for consistent DHIS2 look-and-feel