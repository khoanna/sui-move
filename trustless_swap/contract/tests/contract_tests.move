module contract::contract_tests {
    use contract::lock::{Self, ELockKeyMismatch, Lock};
    use contract::escrow::{Self, EMismatchedExchangeObject, EMismatchedSenderRecipient};

    use sui::coin::{Self, Coin};
    use sui::test_scenario::{Self, Scenario};

    const USER1: address = @0x1;
    const USER2: address = @0x2;

    const EOwnershipViolation: u64 = 100;

    public struct SUI has drop {}

    #[test_only]
    fun test_coin(ts: &mut Scenario): Coin<SUI> {
        coin::mint_for_testing<SUI>(100, ts.ctx())
    }

    #[test]
    public fun test_lock_unlock() {
        let mut scenario = test_scenario::begin(USER1);

        scenario.next_tx(USER1);
        let coin = test_coin(&mut scenario);
        lock::entry_lock(coin, scenario.ctx());

        scenario.next_tx(USER1);
        let lock = scenario.take_from_sender<Lock<Coin<SUI>>>();
        let key = scenario.take_from_sender<lock::Key>();
        lock::entry_unlock(lock, key, scenario.ctx());

        scenario.next_tx(USER1);
        let coin = scenario.take_from_sender<Coin<SUI>>();
        coin.burn_for_testing();
        scenario.end();
    }

    #[test]
    public fun test_ownership() {
        let mut scenario = test_scenario::begin(USER1);

        scenario.next_tx(USER1);
        let coin = test_coin(&mut scenario);
        lock::entry_lock(coin, scenario.ctx());

        scenario.next_tx(USER1);
        let lock_ids = scenario.ids_for_sender<Lock<Coin<SUI>>>();
        let key_ids = scenario.ids_for_sender<lock::Key>();
        assert!(lock_ids.length() == 1, EOwnershipViolation);
        assert!(key_ids.length() == 1, EOwnershipViolation);

        scenario.next_tx(USER1);
        let lock = scenario.take_from_sender<Lock<Coin<SUI>>>();
        let key = scenario.take_from_sender<lock::Key>();
        lock::entry_unlock(lock, key, scenario.ctx());

        scenario.next_tx(USER1);
        let coin = scenario.take_from_sender<Coin<SUI>>();
        coin.burn_for_testing();
        scenario.end();
    }

    #[test]
    #[expected_failure(abort_code = ELockKeyMismatch)]
    public fun test_unlock_with_wrong_key() {
        let mut scenario = test_scenario::begin(USER1);

        let coin = test_coin(&mut scenario);
        let (lock, _key) = lock::lock(coin, scenario.ctx());
        let wrong_key = lock::create_key(scenario.ctx());

        let _coin = lock.unlock(wrong_key);

        abort 1
    }

    #[test]
    public fun test_escrow_swap() {
        let mut scenario = test_scenario::begin(USER1);

        scenario.next_tx(USER1);
        let coin1 = test_coin(&mut scenario);

        scenario.next_tx(USER2);
        let coin2 = test_coin(&mut scenario);

        scenario.next_tx(USER1);
        let (lock, key) = lock::lock(coin1, scenario.ctx());

        scenario.next_tx(USER2);
        escrow::create_escrow(coin2, object::id(&key), USER1, scenario.ctx());

        scenario.next_tx(USER1);
        let esc = scenario.take_shared<escrow::Escrow<Coin<SUI>>>();
        escrow::swap(esc, key, lock, scenario.ctx());

        scenario.end();
    }

}
