module contract::contract {

    public struct Counter has key {
        id: object::UID,
        value: u64,
    }

    fun init (ctx: &mut TxContext) {
        let counter = Counter {
            id: object::new(ctx),
            value: 0,
        };
        transfer::share_object(counter)
    }

    entry fun increase(counter: &mut Counter) {
        counter.value = counter.value + 1;
    }

    entry fun decrease(counter: &mut Counter) {
        counter.value = counter.value - 1;
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }

    #[test_only]
    public fun get_value(counter: &Counter): u64 {
        counter.value
    }
}
