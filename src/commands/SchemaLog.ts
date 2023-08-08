import { SubCommand, CommandRunner } from 'nest-commander';
import { DataSource } from 'typeorm';
import { applyDataSourceOptions } from '../utils/applyDataSourceOptions';

@SubCommand({
  name: 'schema:log',
  description: 'Shows sql to be executed by schema:sync command.',
})
export class SchemaLog extends CommandRunner {
  // TODO support multiple data sources through options
  constructor(private readonly dataSource: DataSource) {
    super();
  }

  public async run(): Promise<void> {
    await applyDataSourceOptions(this.dataSource, {
      synchronize: false,
      migrationsRun: false,
      dropSchema: false,
      logging: false,
    });

    const sqlInMemory = await this.dataSource.driver
      .createSchemaBuilder()
      .log();

    if (sqlInMemory.upQueries.length === 0) {
      console.log(
        'Your schema is up to date - there are no queries to be executed by schema synchronization.',
      );
      await this.dataSource.destroy();
      process.exit(0);
    }

    const lengthSeparators = String(sqlInMemory.upQueries.length)
      .split('')
      .map(() => '-')
      .join('');
    console.log(
      '---------------------------------------------------------------' +
        lengthSeparators,
    );
    console.log(
      `-- Schema synchronization will execute following sql queries (${sqlInMemory.upQueries.length.toString()}):`,
    );
    console.log(
      '---------------------------------------------------------------' +
        lengthSeparators,
    );

    sqlInMemory.upQueries.forEach((upQuery) => {
      let sqlString = upQuery.query;
      sqlString = sqlString.trim();
      sqlString = sqlString.endsWith(';') ? sqlString : sqlString + ';';
      console.log(sqlString);
    });

    await this.dataSource.destroy();

    process.exit(0);
  }
}
