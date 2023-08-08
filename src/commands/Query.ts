import { SubCommand, CommandRunner } from 'nest-commander';
import { DataSource } from 'typeorm';
import { applyDataSourceOptions } from '../utils/applyDataSourceOptions';

@SubCommand({
  name: 'query',
  arguments: '<query>',
  description: 'Executes given SQL query',
})
export class Query extends CommandRunner {
  // TODO support multiple data sources through options
  constructor(private readonly dataSource: DataSource) {
    super();
  }

  public async run([query]: string[]): Promise<void> {
    await applyDataSourceOptions(this.dataSource, {
      synchronize: false,
      migrationsRun: false,
      dropSchema: false,
      logging: ['query'],
    });

    const queryRunner = this.dataSource.createQueryRunner();
    const result = await queryRunner.query(query);

    if (result === undefined) {
      console.log('Query has been executed. No result was returned.');
    } else {
      console.log('Query has been executed. Result:');
      console.log(JSON.stringify(result, undefined, 2));
    }

    await queryRunner.release();
    await this.dataSource.destroy();

    process.exit(0);
  }
}
