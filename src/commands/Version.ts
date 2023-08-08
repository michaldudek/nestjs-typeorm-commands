import { exec } from 'child_process';
import { SubCommand, CommandRunner } from 'nest-commander';

@SubCommand({
  name: 'version',
  description: 'Prints TypeORM version this project uses.',
})
export class Version extends CommandRunner {
  public async run(): Promise<void> {
    const localNpmList = await this.executeCommand('npm list --depth=0');
    const localMatches = localNpmList.match(/ typeorm@(.*)\n/);
    const localNpmVersion = (
      localMatches && localMatches[1] ? localMatches[1] : ''
    )
      .replace(/"invalid"/gi, '')
      .trim();

    const globalNpmList = await this.executeCommand('npm list -g --depth=0');
    const globalMatches = globalNpmList.match(/ typeorm@(.*)\n/);
    const globalNpmVersion = (
      globalMatches && globalMatches[1] ? globalMatches[1] : ''
    )
      .replace(/"invalid"/gi, '')
      .trim();

    if (localNpmVersion) {
      console.log('Local installed version:', localNpmVersion);
    } else {
      console.log('No local installed TypeORM was found.');
    }
    if (globalNpmVersion) {
      console.log('Global installed TypeORM version:', globalNpmVersion);
    } else {
      console.log('No global installed was found.');
    }

    if (
      localNpmVersion &&
      globalNpmVersion &&
      localNpmVersion !== globalNpmVersion
    ) {
      console.log(
        'To avoid issues with CLI please make sure your global and local TypeORM versions match, ' +
          'or you are using locally installed TypeORM instead of global one.',
      );
    }

    process.exit(0);
  }

  private executeCommand(command: string) {
    return new Promise<string>((ok, fail) => {
      exec(command, (error: any, stdout: any, stderr: any) => {
        if (stdout) return ok(stdout);
        if (stderr) return ok(stderr);
        if (error) return fail(error);
        ok('');
      });
    });
  }
}
