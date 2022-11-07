# NestJS TypeORM commands

[TypeORM](https://typeorm.io/) CLI reimplemented to be conveniently used in [NestJS](https://nestjs.com/) alongside [@nestjs/typeorm](https://www.npmjs.com/package/@nestjs/typeorm) and [nest-commander](https://nest-commander.jaymcdoniel.dev/).

Works with TypeORM version 0.3.x.

## Quick setup

Fully integrated TypeORM cli to make it easier to work with migrations in NestJS.

```
npm i nestjs-typeorm-commands nest-commander
```

In your `app.module.ts`:

```ts
import { NestTypeOrmCommandsModule } from 'nestjs-typeorm-commands';

@Module({
  imports: [
    // ...
    // TypeOrmModule.forRootAsync({
    // ... your TypeORM configuration, usually based on a config module
    // }),
    NestTypeOrmCommandsModule.forRoot({
      migrationsDir: 'src/migrations',
    }),
  ],
})
export class AppModule {}
```

In your `src/cli.ts` ([standard integration of `nest-commander`](https://docs.nestjs.com/recipes/nest-commander), if you haven't done that already):

```ts
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module.ts';

async function bootstrap() {
  await CommandFactory.run(AppModule);
}

bootstrap();
```

In your `package.json`:

```json
{
  "scripts": {
    "migration:generate": "ts-node -r tsconfig-paths/register src/cli.ts typeorm migration:generate",
    "migration:run": "ts-node -r tsconfig-paths/register src/cli.ts typeorm migration:run",
    "migration:revert": "ts-node -r tsconfig-paths/register src/cli.ts typeorm migration:revert"
  }
}
```

And then run them in your CLI:

- `npm run migration:generate MigrationName` - automatically create a migration
- `npm run migration:run` - run pending migrations
- `npm run migration:revert` -- revert last migration

Voila.

**NOTE: More commands are supported, see the full list in the configuration steps below.**

## Why?

If you have followed the [recommended way to integrate with TypeORM](https://docs.nestjs.com/techniques/database) and used `@nestjs/typeorm` package, then your `app.module.ts` probably looks like this:

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      autoLoadEntities: true,
      // synchronize: true, // this is bad
    }),
  ],
})
export class AppModule {}
```

(or, even better, you get the config values from a configuration module that pulls them from env or some other mechanism).

When your project is deployed you want to make use of migrations and... you get stuck. NestJS [migration docs are no help](https://docs.nestjs.com/techniques/database#migrations) and they point to [TypeORM CLI docs](https://typeorm.io/using-cli), but the way TypeORM CLI is implemented is nowhere near compatible with NestJS: it requires a dedicated file that configures `DataSource` class and does not support `autoLoadEntities` flag. Of course, you could create it and pass the same config values to it, but it gets complicated if you have non-trivial configuration layer and you use `autoLoadEntities`.

**TypeORM 0.2.x used to support `ormconfig.js` file, that was slightly easier to manage, but the result was the same.**

Migrations are a core requirement for any production application and their support in NestJS + TypeORM is lacking.

## What?

This package adds 1st class support of TypeORM CLI commands to NestJS, so you don't have to worry about duplicating configuration and shoehorning it to make it work with the original TypeORM CLI.

It leverages [nest-commander](https://nest-commander.jaymcdoniel.dev/) (see also [NestJS docs acout it](https://docs.nestjs.com/recipes/nest-commander)) to build and register the commands in the application. You may already be using it (it's recommended if not yet).

## How?

### Installation

Assuming you're already using NestJS and TypeORM, install these two libraries:

```
npm i nestjs-typeorm-commands nest-commander
```

### Configuration

Open your `app.module.ts` and add the following:

```ts
import { NestTypeOrmCommandsModule } from 'nestjs-typeorm-commands';

@Module({
  imports: [
    // ...
    // TypeOrmModule.forRootAsync({
    // ... your TypeORM configuration, usually based on a config module
    // }),
    NestTypeOrmCommandsModule.forRoot({
      migrationsDir: 'src/migrations',
    }),
  ],
})
export class AppModule {}
```

You can set `migrationsDir` to whatever destination you want, relative to the root of the project.

#### nest-commander integration

**Skip if you already have `nest-commander` integrated into your project.**

Best to follow [standard integration of `nest-commander`](https://docs.nestjs.com/recipes/nest-commander), by creating a `src/cli.ts` file and pasting the below code to it:

```ts
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module.ts';

async function bootstrap() {
  await CommandFactory.run(AppModule);
}

bootstrap();
```

### Configuring package.json

To be able to run these commands, it's best to expose them in your `package.json` file in the `scripts` section.

Copy and paste the below:

```json
{
  "scripts": {
    "migration:create": "ts-node -r tsconfig-paths/register src/cli.ts typeorm migration:create",
    "migration:generate": "ts-node -r tsconfig-paths/register src/cli.ts typeorm migration:generate",
    "migration:run": "ts-node -r tsconfig-paths/register src/cli.ts typeorm migration:run",
    "migration:revert": "ts-node -r tsconfig-paths/register src/cli.ts typeorm migration:revert",
    "migration:show": "ts-node -r tsconfig-paths/register src/cli.ts typeorm migration:show",
    "schema:drop": "ts-node -r tsconfig-paths/register src/cli.ts typeorm schema:drop",
    "schema:log": "ts-node -r tsconfig-paths/register src/cli.ts typeorm schema:log",
    "schema:sync": "ts-node -r tsconfig-paths/register src/cli.ts typeorm schema:sync",
    "typeorm:cache:clear": "ts-node -r tsconfig-paths/register src/cli.ts typeorm cache:clear",
    "typeorm:query": "ts-node -r tsconfig-paths/register src/cli.ts typeorm query",
    "typeorm:version": "ts-node -r tsconfig-paths/register src/cli.ts typeorm version"
  }
}
```

**If you are not using NestJS's monorepo and you use relative paths for imports, as well as no aliases, you may omit the `-r tsconfig-paths/register` part of these commands, for readability.**

**If you have integrated nest-commander via a different file than `src/cli.ts` then replace it here.**

### Usage

Now you have access to the following commands:

- `npm run migration:create MigrationName` - create an empty migration with the given name
- `npm run migration:generate MigrationName` - automatically create a migration with the given name
- `npm run migration:run` - run pending migrations
- `npm run migration:revert` -- revert last migration
- `npm run migration:show` - show list of migrations and their status
- `npm run schema:drop` - drop the db schema
- `npm run schema:log` - show diff between db schema and codebase
- `npm run schema:sync` - sync the db schema with the codebase
- `npm run typeorm:cache:clear` - clear query cache
- `npm run typeorm:query "SELECT * FROM migrations"` - run an SQL query
- `npm run typeorm:version` - check TypeORM version

## Disclaimer

This package simply reimplements the TypeORM CLI commands in a "NestJS-way", injecting the application's `DataSource` into the commands, so the configuration can be fully reused. The actual command code is 100% based on the original commands and some small features might be missing.

For full visibility:

- the commands use the default `DataSource` (connection) to the database. Support for handling multiple connections / specifying which connection should be used in on TODO list.
- `migration:generate` and `migration:create` only supports TypeScript migrations, no JS files
- Output coloring has been removed for simplicity. It might be added later.
- Error handling is simplified and errors simply uncaught.
