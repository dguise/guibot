import Database from "object-to-file";

export function runMigrations(version: string) {

    this.v24 = () => {
        const funny = new Database("funny-people");
        const agree = new Database("agreeable-people");
    
        funny.truncate();
        agree.truncate();
    }

    version = version.match(/v\d+/)[0];
    if (version === undefined)
        return;

    const functionToRun = this[version];
    if (typeof functionToRun == "function")
        functionToRun();
}