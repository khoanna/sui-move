module contract::contract {

    public struct Counter has key {
        id: object::UID,
        owner: address,
        value: u64,
    }

    fun init (ctx: &mut TxContext) {
        let counter = Counter {
            id: object::new(ctx),
            owner: ctx.sender(),
            value: 0,
        };
        transfer::share_object(counter)
    }

    entry fun set_value(counter: &mut Counter, new_value: u64, ctx: &TxContext) {
        assert!(counter.owner == ctx.sender(), 1);
        counter.value = new_value;
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
