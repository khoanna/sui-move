export interface Oracle {
    id: string;
    predict_id: string;
    city_name: string;
    latitude: number;
    longitude: number;
    target_time: number;
    target_temp: number;
    current_temp?: number; // Current temperature from blockchain
    ended?: boolean; // Oracle status
    user_prediction?: boolean | null; // User's prediction (null if not predicted yet)
}

export interface OracleObject {
    id: string;
    city: string;
    target_temp: number;
    target_time: number;
    temperature: number;
    ended: boolean;
}