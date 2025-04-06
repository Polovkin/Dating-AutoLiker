export interface IDatingScript {
    getLikeButton(): Promise<HTMLElement>;
    getDislikeButton(): Promise<HTMLElement>;
    getUserName(): Promise<string>;
    getUserAge(): Promise<number>;
}
