import { SubCommand, CommandRunner } from 'nest-commander';
import { DataSource } from 'typeorm';
import { applyDataSourceOptions } from '../utils/applyDataSourceOptions';

@SubCommand({
  name: 'schema:sync',
  aliases: ['schema:synch'],
  description: 'Synchronizes your entities with database schema.',
})
export class SchemaSync extends CommandRunner {
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

    await this.dataSource.synchronize();
    await this.dataSource.destroy();

    console.log('Schema synchronization finished successfully.');

    process.exit(0);
  }
}
