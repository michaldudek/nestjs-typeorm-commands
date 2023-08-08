import { SubCommand, CommandRunner } from 'nest-commander';
import { DataSource } from 'typeorm';
import { applyDataSourceOptions } from '../utils/applyDataSourceOptions';

@SubCommand({
  name: 'schema:drop',
  description: 'Drops all tables in the database.',
})
export class SchemaDrop extends CommandRunner {
  // TODO support multiple data sources through options
  constructor(private readonly dataSource: DataSource) {
    super();
  }

  public async run(): Promise<void> {
    await applyDataSourceOptions(this.dataSource, {
      synchronize: false,
      migrationsRun: false,
      dropSchema: false,
      logging: ['query', 'schema'],
    });

    await this.dataSource.dropDatabase();
    await this.dataSource.destroy();

    console.log('Database schema has been successfully dropped.');

    process.exit(0);
  }
}
