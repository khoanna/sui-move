#[test_only]
module coin::coin_tests{
    use sui::test_scenario;
    use sui::coin;
    use sui::coin::{TreasuryCap};
    use coin::coin::{COIN, init_for_testing, mintCoinObject, burnCoinObject};

    const ADMIN: address = @0xCAFE;

    #[test]
    fun test_init_mint_burn_coin() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Init Coin
        init_for_testing(scenario.ctx());

        
        // Mint coin
        scenario.next_tx(ADMIN);
        let mut treasury_cap = test_scenario::take_from_sender<TreasuryCap<COIN>>(&scenario);
        mintCoinObject(&mut treasury_cap, 10000000000, test_scenario::ctx(&mut scenario));
        scenario.return_to_sender(treasury_cap);

        // Burn coin
        scenario.next_tx(ADMIN);
        let mut treasury_cap = test_scenario::take_from_sender<TreasuryCap<COIN>>(&scenario);
        let coin_object = test_scenario::take_from_sender<coin::Coin<COIN>>(&scenario);
        burnCoinObject(&mut treasury_cap, coin_object);
        scenario.return_to_sender(treasury_cap);

        scenario.end();
    }

}

