import * as path from 'path';
import { Inject } from '@nestjs/common';
import { format } from '@sqltools/formatter/lib/sqlFormatter';
import { SubCommand, CommandRunner, Option } from 'nest-commander';
import { DataSource } from 'typeorm';
import {
  DEFAULT_MIGRATIONS_DIR,
  MODULE_OPTIONS_TOKEN,
  NestTypeOrmCommandsModuleOptions,
} from '../Configuration';
import { applyDataSourceOptions } from '../utils/applyDataSourceOptions';
import { makeTimestamp } from '../utils/makeTimestamp';
import { writeFile } from '../utils/writeFile';

type Options = {
  pretty: boolean;
  dryrun: boolean;
  check: boolean;
  timestamp?: string;
};

@SubCommand({
  name: 'migration:generate',
  arguments: '<name>',
  description:
    'Generates a new migration file with SQL queries that need to be executed to update the schema.',
})
export class MigrationGenerate extends CommandRunner {
  private readonly migrationsDir: string;

  // TODO support multiple data sources through options
  // TODO should non-default data source name be appended to migrationsDir ?
  constructor(
    private readonly dataSource: DataSource,
    @Inject(MODULE_OPTIONS_TOKEN)
    options: NestTypeOrmCommandsModuleOptions,
  ) {
    super();
    this.migrationsDir = options.migrationsDir ?? DEFAULT_MIGRATIONS_DIR;
  }

  public async run(
    [name]: string[],
    { pretty, dryrun, check, timestamp: timestampParam }: Options,
  ): Promise<void> {
    const timestamp = timestampParam ?? makeTimestamp();
    const className = `${name}${timestamp}`;
    const fileName = `${timestamp}-${name}.ts`;
    const filePath = path.resolve(process.cwd(), this.migrationsDir, fileName);

    await applyDataSourceOptions(this.dataSource, {
      subscribers: [],
      synchronize: false,
      migrationsRun: false,
      dropSchema: false,
      logging: ['error', 'schema'],
      migrations: [`${this.migrationsDir}/*`],
    });

    // run any pending migrations to make sure schema is up to date
    await this.dataSource.runMigrations({
      transaction: 'all',
    });

    const upQueries: string[] = [];
    const downQueries: string[] = [];

    try {
      const sqlInMemory = await this.dataSource.driver
        .createSchemaBuilder()
        .log();

      if (pretty) {
        sqlInMemory.upQueries.forEach((query) => {
          query.query = this.prettify(query.query);
        });
        sqlInMemory.downQueries.forEach((query) => {
          query.query = this.prettify(query.query);
        });
      }

      sqlInMemory.upQueries.forEach((query) => {
        upQueries.push(
          '        await queryRunner.query(`' +
            query.query.replace(new RegExp('`', 'g'), '\\`') +
            '`' +
            this.queryParams(query.parameters) +
            ');',
        );
      });
      sqlInMemory.downQueries.forEach((query) => {
        downQueries.push(
          '        await queryRunner.query(`' +
            query.query.replace(new RegExp('`', 'g'), '\\`') +
            '`' +
            this.queryParams(query.parameters) +
            ');',
        );
      });
    } finally {
      await this.dataSource.destroy();
    }

    if (!upQueries.length) {
      if (check) {
        console.log('No changes in database schema were found');
        process.exit(0);
      } else {
        console.log(
          'No changes in database schema were found - cannot generate a migration. To create a new empty migration use "typeorm migration:create" command',
        );
        process.exit(1);
      }
    }

    const fileContent = this.getTemplate(className, upQueries, downQueries);

    if (check) {
      console.log(
        `Unexpected changes in database schema were found in check mode:\n\n${fileContent}`,
      );
      process.exit(1);
    }

    if (dryrun) {
      console.log(`Migration ${filePath} has content:\n\n${fileContent}`);
      return;
    }

    await writeFile(filePath, fileContent);

    console.log(`Migration ${filePath} has been generated successfully.`);
  }

  @Option({
    flags: '-p, --pretty',
    description: 'Pretty-print generated SQL',
    defaultValue: true,
    name: 'pretty',
  })
  public parsePrettyOption(option: string) {
    return !!option;
  }

  @Option({
    flags: '-dr, --dryrun',
    description:
      'Print out the contents of the migration instead of writing it to a file',
    defaultValue: false,
    name: 'dryrun',
  })
  public parseDryOption(option: string) {
    return !!option;
  }

  @Option({
    flags: '-ch, --check',
    description:
      'Verifies that the current database is up to date and that no migrations are needed. Otherwise exits with code 1.',
    defaultValue: false,
    name: 'check',
  })
  public parseCheckOption(option: string) {
    return !!option;
  }

  @Option({
    flags: '-t, --timestamp <timestamp>',
    description: 'Custom timestamp for the migration name',
    name: 'timestamp',
  })
  public parseTimestampOption(option: string) {
    return option;
  }

  private prettify(query: string) {
    const formattedQuery = format(query, { indent: '    ' });
    return '\n' + formattedQuery.replace(/^/gm, '            ') + '\n        ';
  }

  private queryParams(parameters: any[] | undefined): string {
    if (!parameters || !parameters.length) {
      return '';
    }

    return `, ${JSON.stringify(parameters)}`;
  }

  private getTemplate(
    name: string,
    upSqls: string[],
    downSqls: string[],
  ): string {
    return `import { MigrationInterface, QueryRunner } from 'typeorm';

export class ${name} implements MigrationInterface {
  name = '${name}'

  public async up(queryRunner: QueryRunner): Promise<void> {
    ${upSqls.join('\n')}
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    ${downSqls.join('\n')}
  }
}
`;
  }
}
