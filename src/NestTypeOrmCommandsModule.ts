import { Module } from '@nestjs/common';
import { TypeOrmCommand } from './commands';
import { CacheClear } from './commands/CacheClear';
import { MigrationCreate } from './commands/MigrationCreate';
import { MigrationGenerate } from './commands/MigrationGenerate';
import { MigrationRevert } from './commands/MigrationRevert';
import { MigrationRun } from './commands/MigrationRun';
import { MigrationShow } from './commands/MigrationShow';
import { Query } from './commands/Query';
import { SchemaDrop } from './commands/SchemaDrop';
import { SchemaLog } from './commands/SchemaLog';
import { SchemaSync } from './commands/SchemaSync';
import { Version } from './commands/Version';
import { ConfigurableModuleClass } from './Configuration';

@Module({
  providers: [
    TypeOrmCommand,
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
export class NestTypeOrmCommandsModule extends ConfigurableModuleClass {}
