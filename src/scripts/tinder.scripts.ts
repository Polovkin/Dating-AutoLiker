import type {IDatingScript} from "../../types/interfaces.types";

export class TinderScripts implements IDatingScript {
    async getDislikeButton(): Promise<HTMLElement> {
        throw Error("Method not implemented.");
    }

    async getLikeButton(): Promise<HTMLElement> {
        throw Error("Method not implemented.");
    }

    async getUserAge(): Promise<number> {
        throw Error("Method not implemented.");
    }

    async getUserName(): Promise<string> {
        throw Error("Method not implemented.");
    }
}
