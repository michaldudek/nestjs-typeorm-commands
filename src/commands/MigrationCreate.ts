import * as path from 'path';
import { Inject } from '@nestjs/common';
import { CommandRunner, Option, SubCommand } from 'nest-commander';
import {
  DEFAULT_MIGRATIONS_DIR,
  MODULE_OPTIONS_TOKEN,
  NestTypeOrmCommandsModuleOptions,
} from '../Configuration';
import { makeTimestamp } from '../utils/makeTimestamp';
import { writeFile } from '../utils/writeFile';

type Options = {
  timestamp?: string;
};

@SubCommand({
  name: 'migration:create',
  arguments: '<name>',
  description: 'Creates a new migration file.',
})
export class MigrationCreate extends CommandRunner {
  private readonly migrationsDir: string;

  // TODO support multiple data sources through options
  // TODO should non-default data source name be appended to migrationsDir ?
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    options: NestTypeOrmCommandsModuleOptions,
  ) {
    super();
    this.migrationsDir = options.migrationsDir ?? DEFAULT_MIGRATIONS_DIR;
  }

  public async run(
    [name]: string[],
    { timestamp: timestampParam }: Options,
  ): Promise<void> {
    const timestamp = timestampParam ?? makeTimestamp();
    const className = `${name}${timestamp}`;
    const fileName = `${timestamp}-${name}.ts`;
    const filePath = path.resolve(process.cwd(), this.migrationsDir, fileName);

    const fileContent = this.getTemplate(className);
    await writeFile(filePath, fileContent);

    console.log(`Migration ${filePath} has been created successfully.`);
  }

  @Option({
    flags: '-t, --timestamp <timestamp>',
    description: 'Custom timestamp for the migration name',
    name: 'timestamp',
  })
  public parseTimestampOption(option: string) {
    return option;
  }

  private getTemplate(name: string): string {
    return `import { MigrationInterface, QueryRunner } from 'typeorm';

export class ${name} implements MigrationInterface {
  name = '${name}'

  public async up(queryRunner: QueryRunner): Promise<void> {
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }
}
`;
  }
}
