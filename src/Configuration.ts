import { ConfigurableModuleBuilder } from '@nestjs/common';

export type NestTypeOrmCommandsModuleOptions = {
  migrationsDir?: string;
};

export const DEFAULT_MIGRATIONS_DIR = 'src/migrations';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<NestTypeOrmCommandsModuleOptions>()
    .setClassMethodName('forRoot')
    .build();
