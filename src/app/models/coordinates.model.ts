export interface CoordinatesGame {
    uid?: string;
    uidUser: string;
    score: number;
    squaresGood: string[];
    squaresBad: string[];
    round: string[];
    date: number;
    color: 'w' | 'b';
}