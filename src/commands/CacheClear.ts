import { SubCommand, CommandRunner } from 'nest-commander';
import { DataSource } from 'typeorm';
import { applyDataSourceOptions } from '../utils/applyDataSourceOptions';

@SubCommand({
  name: 'cache:clear',
  description: 'Clears all data stored in query runner cache.',
})
export class CacheClear extends CommandRunner {
  // TODO support multiple data sources through options
  constructor(private readonly dataSource: DataSource) {
    super();
  }

  public async run(): Promise<void> {
    await applyDataSourceOptions(this.dataSource, {
      subscribers: [],
      synchronize: false,
      migrationsRun: false,
      dropSchema: false,
      logging: ['schema'],
    });

    if (!this.dataSource.queryResultCache) {
      throw new Error(
        'Cache is not enabled. To use cache enable it in data source configuration.',
      );
    }

    await this.dataSource.queryResultCache.clear();
    console.log('Cache was successfully cleared');

    await this.dataSource.destroy();
  }
}
