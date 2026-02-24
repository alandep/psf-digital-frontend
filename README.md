# PsfDigitalFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.2.0.

This project is the **Shell** for a microfrontend architecture using Angular and Webpack Module Federation.

## Development server

To start the local development server for the **Shell** application, run:

```bash
ng serve
```

Alternatively, you can use the npm script configured in `package.json`:

```bash
npm start
```

This will start the shell application, typically on `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

**Note:** For the microfrontends (e.g., `mfe1`) to be loaded, their respective development servers must also be running. For example, `mfe1` is expected to be running on `http://localhost:4201/`.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
# psf-digital-frontend
