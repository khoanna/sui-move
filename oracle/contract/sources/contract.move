module contract::contract {
    use std::string;
    use sui::package;
    use sui::table;

    public struct AdminCap has key, store { id: UID }

    public struct CONTRACT has drop {}

    public struct UserPoint has key {
        id: UID,
        points: table::Table<address, u64>,
    }

    public struct UserPrediction has key {
        id: UID,
        oracle_id: ID,
        predictions: table::Table<address, bool>,
    }

    public struct WeatherOracle has key, store {
        id: UID,
        city: string::String,
        temperature: u64,
        target_temp: u64,
        target_time: u64,
        ended: bool,
    }

    fun init(otw:CONTRACT, ctx: &mut TxContext) {
        package::claim_and_keep(otw, ctx);
        let cap = AdminCap{ id: object::new(ctx)};
        let user_point = UserPoint {
            id: object::new(ctx),
            points: table::new(ctx),
        };

        transfer::share_object(user_point);
        transfer::public_transfer(cap,ctx.sender());
    }

    entry fun create_weather_oracle(
        _: &AdminCap,
        city: string::String,
        temperature: u64,
        target_temp: u64,
        target_time: u64,
        ctx: &mut TxContext
    ) {
        let weather_oracle = WeatherOracle {
            id: object::new(ctx),
            city,
            temperature,
            target_temp,
            target_time,
            ended: false,
        };

        let user_prediction = UserPrediction {
            id: object::new(ctx),
            oracle_id: object::id(&weather_oracle),
            predictions: table::new(ctx),
        }; 

        transfer::share_object(user_prediction);
        transfer::share_object(weather_oracle);
    }

    entry fun make_prediction(
        user_prediction: &mut UserPrediction,
        prediction: bool,
        ctx: &TxContext
    ) {
        assert!(!table::contains(&user_prediction.predictions, ctx.sender()), 1);
        table::add(&mut user_prediction.predictions, ctx.sender(), prediction);
    }

    entry fun claim_point (
        user_point: &mut UserPoint,
        user_prediction: &UserPrediction,
        weather_oracle: &WeatherOracle,
        ctx: &TxContext
    ) {
        assert!(table::contains(&user_prediction.predictions, ctx.sender()), 2);
        let predict = *table::borrow(&user_prediction.predictions, ctx.sender());
        assert!(weather_oracle.ended, 4);
        assert!((weather_oracle.temperature >= weather_oracle.target_temp) == predict, 3);
        if (table::contains(&user_point.points, ctx.sender())) {
            let points_ref = table::borrow_mut(&mut user_point.points, ctx.sender());
            *points_ref = *points_ref + 1;
        } else {
            table::add(&mut user_point.points, ctx.sender(), 1);
        }
    }

    entry fun update_weather_oracle(
        _: &AdminCap,
        oracle: &mut WeatherOracle,
        new_temperature: u64,
        ended: bool,
    ) {
        oracle.temperature = new_temperature;
        oracle.ended = ended;
    }

    #[test_only]
    public fun test_init(ctx: &mut TxContext) {
        let otw = CONTRACT{};
        init(otw, ctx);
    }

    #[test_only]
    public fun get_point_of_sender(user_point: &UserPoint, ctx: &TxContext): u64 {
        if (table::contains(&user_point.points, ctx.sender())) {
            let points_ref = table::borrow(&user_point.points, ctx.sender());
            *points_ref
        } else {
            0
        }
    }
}
