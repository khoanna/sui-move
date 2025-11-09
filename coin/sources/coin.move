module coin::coin {
    use sui::coin;
    use sui::coin_registry;

    public struct COIN has drop {}

    fun init(otw: COIN, ctx: &mut TxContext) {
        let (builder, treasury_cap) = coin_registry::new_currency_with_otw(
            otw,
            6,
            b"COIN".to_string(),
            b"My Coin".to_string(),
            b"coin description".to_string(),
            b"coin_url_img".to_string(),
            ctx,
        );
    
        let metadata_cap = builder.finalize(ctx);

        transfer::public_transfer(treasury_cap, ctx.sender());
        transfer::public_transfer(metadata_cap, ctx.sender());
    }

    #[allow(lint(self_transfer))]
    entry fun mintCoinObject(cap: &mut coin::TreasuryCap<COIN>, amount: u64, ctx: &mut TxContext){
        let coin_object = coin::mint(cap, amount, ctx);
        transfer::public_transfer(coin_object, ctx.sender());
    }

    entry fun burnCoinObject(cap: &mut coin::TreasuryCap<COIN>, coin_object: coin::Coin<COIN>) {
        coin::burn(cap, coin_object);
    }
    
}