// Data from backend (only IDs + coordinates)
export interface Oracle {
    id: string;
    predict_id: string;
    latitude?: number;
    longitude?: number;
}

// Data enriched from blockchain
export interface EnrichedOracle extends Oracle {
    city?: string;
    temperature?: number;
    target_temp?: number;
    target_time?: number;
    ended?: boolean;
    user_prediction?: boolean | null;
    current_temp?: number; // Current temperature from blockchain
}

// Blockchain oracle object structure
export interface OracleObject {
    id: string;
    city: string;
    target_temp: number;
    target_time: number;
    temperature: number;
    ended: boolean;
}