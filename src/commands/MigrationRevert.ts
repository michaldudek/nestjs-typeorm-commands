import { Inject } from '@nestjs/common';
import { CommandRunner, Option, SubCommand } from 'nest-commander';
import { DataSource } from 'typeorm';
import {
  DEFAULT_MIGRATIONS_DIR,
  MODULE_OPTIONS_TOKEN,
  NestTypeOrmCommandsModuleOptions,
} from '../Configuration';
import { applyDataSourceOptions } from '../utils/applyDataSourceOptions';

type Options = {
  fake: boolean;
};

@SubCommand({
  name: 'migration:revert',
  description: 'Reverts last executed migration.',
})
export class MigrationRevert extends CommandRunner {
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

  public async run(args: string[], { fake }: Options): Promise<void> {
    await applyDataSourceOptions(this.dataSource, {
      subscribers: [],
      synchronize: false,
      migrationsRun: false,
      dropSchema: false,
      logging: ['query', 'error', 'schema'],
      migrations: [`${this.migrationsDir}/*`],
    });

    await this.dataSource.undoLastMigration({
      transaction: 'all',
      fake,
    });

    await this.dataSource.destroy();

    process.exit(0);
  }

  @Option({
    flags: '-f, --fake',
    description: 'Fakes reverting the migration.',
    defaultValue: false,
    name: 'fake',
  })
  public parseFakeOption(option: string) {
    return !!option;
  }
}
