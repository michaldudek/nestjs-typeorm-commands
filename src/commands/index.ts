import { Command, CommandRunner } from 'nest-commander';
import { CacheClear } from './CacheClear';
import { MigrationCreate } from './MigrationCreate';
import { MigrationGenerate } from './MigrationGenerate';
import { MigrationRevert } from './MigrationRevert';
import { MigrationRun } from './MigrationRun';
import { MigrationShow } from './MigrationShow';
import { Query } from './Query';
import { SchemaDrop } from './SchemaDrop';
import { SchemaLog } from './SchemaLog';
import { SchemaSync } from './SchemaSync';
import { Version } from './Version';

@Command({
  name: 'typeorm',
  arguments: '<cmd> [name]',
  description: 'Use TypeORM commands.',
  subCommands: [
    CacheClear,
    MigrationCreate,
    MigrationGenerate,
    MigrationRevert,
    MigrationRun,
    MigrationShow,
    Query,
    SchemaDrop,
    SchemaLog,
    SchemaSync,
    Version,
  ],
})
export class TypeOrmCommand extends CommandRunner {
  public async run([cmd, ...rest]: string[]): Promise<void> {
    throw new Error(`Unrecognized command ${cmd} ${rest.join(' ')}`);
  }
}
