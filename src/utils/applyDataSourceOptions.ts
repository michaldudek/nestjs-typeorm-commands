import { DataSource, DataSourceOptions } from 'typeorm';

export const applyDataSourceOptions = async (
  dataSource: DataSource,
  options: Partial<DataSourceOptions>,
): Promise<void> => {
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }

  dataSource.setOptions(options);
  await dataSource.initialize();
};
