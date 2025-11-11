module contract::contract_tests {
    use sui::test_scenario;
    use contract::contract::{increase, decrease, get_value, init_for_testing, Counter};
    use std::unit_test::assert_eq;

    const ADMIN: address = @0xCAFE;

    #[test]
    fun test_count() {
        let mut scenario = test_scenario::begin(ADMIN);

        {
            scenario.next_tx(ADMIN);
            init_for_testing(scenario.ctx());
        };

        {
            scenario.next_tx(ADMIN);
            let mut counter = test_scenario::take_shared<Counter>(&scenario);
            increase(&mut counter);
            test_scenario::return_shared(counter);
        };

        {
            scenario.next_tx(ADMIN);
            let mut counter = test_scenario::take_shared<Counter>(&scenario);
            decrease(&mut counter);
            test_scenario::return_shared(counter);
        };

        {
            scenario.next_tx(ADMIN);
            let counter = test_scenario::take_shared<Counter>(&scenario);
            let t1 = get_value(&counter);
            assert_eq!(t1, 0u64);
            test_scenario::return_shared(counter);
        };

        scenario.end();
    }
}
