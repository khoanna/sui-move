export interface Board {
    id: string;
    game: string[]
    next_player: string;
    player: string[];
    winner: string;
    ended: boolean;
}