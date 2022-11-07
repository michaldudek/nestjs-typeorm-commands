import { Inject } from '@nestjs/common';
import { SubCommand, CommandRunner } from 'nest-commander';
import { DataSource } from 'typeorm';
import {
  DEFAULT_MIGRATIONS_DIR,
  MODULE_OPTIONS_TOKEN,
  NestTypeOrmCommandsModuleOptions,
} from '../Configuration';
import { applyDataSourceOptions } from '../utils/applyDataSourceOptions';

@SubCommand({
  name: 'migration:show',
  description: 'Show all migrations and whether they have been run or not',
})
export class MigrationShow extends CommandRunner {
  private readonly migrationsDir: string;

  // TODO support multiple data sources through options
  constructor(
    private readonly dataSource: DataSource,
    @Inject(MODULE_OPTIONS_TOKEN)
    options: NestTypeOrmCommandsModuleOptions,
  ) {
    super();
    this.migrationsDir = options.migrationsDir ?? DEFAULT_MIGRATIONS_DIR;
  }

  public async run(): Promise<void> {
    await applyDataSourceOptions(this.dataSource, {
      subscribers: [],
      synchronize: false,
      migrationsRun: false,
      dropSchema: false,
      logging: ['schema'],
      migrations: [`${this.migrationsDir}/*`],
    });

    await this.dataSource.showMigrations();

    await this.dataSource.destroy();
  }
}
