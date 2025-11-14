module contract::escrow {
    use contract::lock::{Lock, Key};
    use sui::dynamic_object_field;

    const EMismatchedExchangeObject: u64 = 2;
    const EMismatchedSenderRecipient: u64 = 3;

    public struct EscrowedObjectKey has copy, drop, store {}

    public struct Escrow <phantom T: key + store> has key, store {
        id: UID,
        sender: address,
        receiver: address,
        exchange_key: ID
    }

    entry fun create_escrow<T: key + store> (escrowed_asset: T, exchange_key: ID, receiver: address, ctx: &mut TxContext) {
        let mut escrow = Escrow<T> {
            id: object::new(ctx),
            sender: ctx.sender(),
            receiver,
            exchange_key
        };

        dynamic_object_field::add(&mut escrow.id, EscrowedObjectKey{}, escrowed_asset);
        transfer::share_object(escrow);
    }

    entry fun swap<T: key + store, U: key + store> (mut escrow: Escrow<T>, key: Key, lock: Lock<U>, ctx: &TxContext) {
        assert!(escrow.exchange_key == object::id(&key), EMismatchedExchangeObject);
        assert!(escrow.receiver == ctx.sender(), EMismatchedSenderRecipient);

        let escrowed_asset = dynamic_object_field::remove<EscrowedObjectKey, T>(&mut escrow.id, EscrowedObjectKey{});
        let exchanged_asset = lock.unlock(key);

        transfer::public_transfer(escrowed_asset, escrow.receiver);
        transfer::public_transfer(exchanged_asset, escrow.sender);

        let Escrow { id, sender: _, receiver: _, exchange_key: _ } = escrow;

        object::delete(id);
    }

    entry fun cancel<T: key + store> (mut escrow: Escrow<T>, ctx: &TxContext) {
        assert!(escrow.sender == ctx.sender(), EMismatchedSenderRecipient);

        let escrowed_asset = dynamic_object_field::remove<EscrowedObjectKey, T>(&mut escrow.id, EscrowedObjectKey{});

        transfer::public_transfer(escrowed_asset, ctx.sender());

        let Escrow { id, sender: _, receiver: _, exchange_key: _ } = escrow;

        object::delete(id);
    }
    
}