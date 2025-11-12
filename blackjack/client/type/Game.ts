export enum GameStatus {
    DEALER_WIN = 0,
    DRAW = 1,
    PLAYER_WIN = 2,
}

export interface Game {
    id: string;
    player: string;
    dealer_points: number[];
    player_points: number[];
    is_end: boolean;
    status: GameStatus;
}