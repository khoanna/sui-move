
module contract::lock {
    use sui::dynamic_object_field;

    const ELockKeyMismatch: u64 = 1; 

    public struct Lock<phantom T: key + store> has key, store {
        id: UID,
        key: ID
    }

    public struct Key has key, store {
        id: UID
    }

    public struct LockedAsset has store, copy, drop {}

    public fun lock<T: key + store>(asset: T, ctx: &mut TxContext) : (Lock<T>, Key) {
        let key = Key { id: object::new(ctx) };

        let mut lock = Lock<T> {
            id: object::new(ctx),
            key: object::id(&key),
        };   

        dynamic_object_field::add(&mut lock.id, LockedAsset{}, asset);

        (lock, key)
    }

    entry fun entry_lock<T: key + store>(asset: T, ctx: &mut TxContext) {
        let (locked, key) = lock(asset, ctx);
        transfer::public_transfer(locked, ctx.sender());
        transfer::public_transfer(key, ctx.sender());
    }

    public fun unlock<T: key + store>(mut locked: Lock<T>, key: Key) : T{
        assert!(locked.key == object::id(&key), ELockKeyMismatch);
        let Key { id } = key;
        id.delete();

        let obj = dynamic_object_field::remove<LockedAsset, T>(&mut locked.id, LockedAsset{});

        let Lock { id, key: _ } = locked;
        id.delete();
        
        obj
    }

    entry fun entry_unlock<T: key + store>(locked: Lock<T>, key: Key, ctx: &TxContext) {
        let asset_unlocked = unlock(locked, key);
        transfer::public_transfer(asset_unlocked, ctx.sender());
    }

    #[test_only]
    public fun create_key(ctx: &mut TxContext): Key {
        Key { id: object::new(ctx) }
    }
}

