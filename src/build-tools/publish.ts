import * as shell from "shelljs";

if (!shell.which('git')) {
  shell.echo("Please install git.");
  shell.exit(1);
}

const majorRegex = /\d+(?=\.)/g;
shell.exec("git fetch --tags");
const lastVersion = shell.exec("git describe --tags").stdout;
const lastMajor: number = parseInt(lastVersion.match(majorRegex)[0]);
const newMajor: number = lastMajor + 1;

shell.exec(`git tag v${newMajor}.0.0 && git push origin v${newMajor}.0.0`);