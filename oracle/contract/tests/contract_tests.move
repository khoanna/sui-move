#[test_only]
module contract::contract_tests {
    use sui::test_scenario;
    use contract::contract::{AdminCap, UserPoint, WeatherOracle, UserPrediction, test_init, create_weather_oracle, update_weather_oracle, make_prediction, claim_point};
    use contract::contract::get_point_of_sender;

    const ADMIN: address = @0x1;
    const PLAYER: address = @0x2;

    #[test]
    fun basic_test () {
        let mut scenario = test_scenario::begin(ADMIN);

        // Initialize the contract
        scenario.next_tx(ADMIN);
        test_init(scenario.ctx());

        // Create a weather oracle
        scenario.next_tx(ADMIN);
        let admin_cap = scenario.take_from_sender<AdminCap>();
        create_weather_oracle(&admin_cap, "New York", 75, 70, 1625097600, scenario.ctx());
        scenario.return_to_sender(admin_cap);

        // Player predict
        scenario.next_tx(PLAYER);
        let mut user_prediction = scenario.take_shared<UserPrediction>();
        make_prediction(&mut user_prediction, false, scenario.ctx());
        test_scenario::return_shared(user_prediction);

        // Update weather forecast
        scenario.next_tx(ADMIN);
        let admin_cap = scenario.take_from_sender<AdminCap>();
        let mut oracle = scenario.take_shared<WeatherOracle>();
        update_weather_oracle(&admin_cap, &mut oracle, 35, true);
        test_scenario::return_shared(oracle);
        scenario.return_to_sender(admin_cap);

        // Player claim point
        scenario.next_tx(PLAYER);
        let user_prediction = scenario.take_shared<UserPrediction>();
        let mut user_point = scenario.take_shared<UserPoint>();
        let oracle = scenario.take_shared<WeatherOracle>();
        claim_point(&mut user_point, &user_prediction, &oracle, scenario.ctx());
        test_scenario::return_shared(user_point);
        test_scenario::return_shared(user_prediction);
        test_scenario::return_shared(oracle);

        // Check final state
        scenario.next_tx(PLAYER);
        let user_point = scenario.take_shared<UserPoint>();
        let point = get_point_of_sender(&user_point, scenario.ctx());
        assert!(point == 1, 0);
        test_scenario::return_shared(user_point);

        scenario.end();
    }
}
