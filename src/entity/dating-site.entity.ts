export class DatingSiteEntity {
    readonly name: string;
    readonly url: URL;
    readonly limit: number = 10;

    constructor(url: string = 'https://example.com/', name?: string) {
        this.url = new URL(url);
        this.name = name || this.url.hostname.split('.').slice(-2, -1)[0];
    }

}
