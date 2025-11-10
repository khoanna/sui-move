#[test_only]
module dex::dex_tests {
    use sui::coin::{Self, Coin, TreasuryCap};
    use dex::dex::{LPShare, create_pool, get_share_amount, swap_x_for_y, Pool};
    use sui::test_scenario::{Self as test, Scenario};
    use std::u64;
    use bridge::bridge_env::scenario;
    use sui::test_scenario_tests;

    public struct COIN_X has drop {}
    public struct COIN_Y has drop {}

    const ADMIN: address = @0xCAFE;

    fun setup_coin_x(scenario: &mut Scenario) {
        scenario.next_tx(ADMIN);
        {
            let treasury_cap = coin::create_treasury_cap_for_testing<COIN_X>(scenario.ctx());
            transfer::public_transfer(treasury_cap, ADMIN);
        };
    }

    fun setup_coin_y(scenario: &mut Scenario) {
        scenario.next_tx(ADMIN);
        {
            let treasury_cap = coin::create_treasury_cap_for_testing<COIN_Y>(scenario.ctx());
            transfer::public_transfer(treasury_cap, ADMIN);
        };
    }

    #[test]
    fun test_both_coins() {
        let mut scenario = test::begin(ADMIN);
        
        setup_coin_x(&mut scenario);
        setup_coin_y(&mut scenario);
        
        // Mint coin X
        scenario.next_tx(ADMIN);
        {
            let mut treasury_x = scenario.take_from_sender<TreasuryCap<COIN_X>>();
            let coin_x = coin::mint(&mut treasury_x, 10000, scenario.ctx());
            transfer::public_transfer(coin_x, ADMIN);
            test::return_to_sender(&scenario, treasury_x);
        };
        
        // Mint coin Y
        scenario.next_tx(ADMIN);
        {
            let mut treasury_y = scenario.take_from_sender<TreasuryCap<COIN_Y>>();
            let coin_y = coin::mint(&mut treasury_y, 40000, scenario.ctx());
            transfer::public_transfer(coin_y, ADMIN);
            test::return_to_sender(&scenario, treasury_y);
        };

        // Add liquidity
        scenario.next_tx(ADMIN);
        {
            let coin_x = scenario.take_from_sender<Coin<COIN_X>>();
            let coin_y = scenario.take_from_sender<Coin<COIN_Y>>();
            create_pool<COIN_X, COIN_Y>(coin_x, coin_y, 30, scenario.ctx());
        };

        // Check LP share amount
        scenario.next_tx(ADMIN);
        {
            let lp_share = scenario.take_from_sender<LPShare>();
            let share_amount = get_share_amount(&lp_share);
            assert!(share_amount == u64::sqrt(10000 * 40000) - 1000, 1);
            test::return_to_sender(&scenario, lp_share);
        };

        // Mint coin X
        scenario.next_tx(ADMIN);
        {
            let mut treasury_x = scenario.take_from_sender<TreasuryCap<COIN_X>>();
            let coin_x = coin::mint(&mut treasury_x, 5000, scenario.ctx());
            transfer::public_transfer(coin_x, ADMIN);
            test::return_to_sender(&scenario, treasury_x);
        };
        
        // Swap coin X for Y
        scenario.next_tx(ADMIN);
        {
            let coin_x = scenario.take_from_sender<Coin<COIN_X>>();
            let mut pool = test::take_shared<Pool<COIN_X, COIN_Y>>(&scenario);
            swap_x_for_y<COIN_X, COIN_Y>(&mut pool, coin_x, 0,scenario.ctx());
            test::return_shared( pool);
        };

        // Check amount Y
        scenario.next_tx(ADMIN);
        {
            let coin_y = scenario.take_from_sender<Coin<COIN_Y>>();
            let value_y = coin::value(&coin_y);

            let ax = 5000; 
            let rx = 10000; 
            let ry = 40000; 
            let fee_bps = 30; 

            let ax_fee = ax * (10000 - fee_bps); 
            let numerator = ax_fee * ry;
            let denominator = (rx * 10000) + ax_fee;
            let expected_out = numerator / denominator;

            assert!(value_y == expected_out, 2);
            test::return_to_sender(&scenario, coin_y);
        };

        scenario.end();
    }
}