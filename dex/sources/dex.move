module dex::dex {
    use std::u64;
    use sui::coin;

    const MIN_LIQUIDITY: u64 = 1000;

    public struct LPShare has key {
        id: UID,
        pair_id: ID,
        amount: u64,
    }

    public struct Pool<phantom X, phantom Y> has key {
        id: UID,
        coin_x: coin::Coin<X>,
        coin_y: coin::Coin<Y>,
        total_share: u64,
        fee_bps: u64,
    }

    entry fun create_pool<X, Y>(
        coin_x: coin::Coin<X>,
        coin_y: coin::Coin<Y>,
        fee_bps: u64,
        ctx: &mut TxContext
    ) {
        let rx = coin::value(&coin_x);
        let ry = coin::value(&coin_y);
        let mut l0 = u64::sqrt(rx * ry);
        assert!(l0 > MIN_LIQUIDITY, 1);
        l0 = l0 - MIN_LIQUIDITY;

        let pool = Pool<X, Y> {
            id: object::new(ctx),
            coin_x,
            coin_y,
            total_share: l0,
            fee_bps,
        };
        transfer::share_object(pool);

        let pair_id = object::id(&pool);
        let lp = LPShare { id: object::new(ctx), pair_id, amount: l0 };
        transfer::transfer(lp, ctx.sender());
    }

    entry fun add_liquidity<X, Y>(
        pool: &mut Pool<X, Y>,
        coin_x: coin::Coin<X>,
        coin_y: coin::Coin<Y>,
        ctx: &mut TxContext
    ) {
        let reserve_x = coin::value(&pool.coin_x);
        let reserve_y = coin::value(&pool.coin_y);
        let ax = coin::value(&coin_x);
        let ay = coin::value(&coin_y);

        let l_x = (ax * pool.total_share) / reserve_x;
        let l_y = (ay * pool.total_share) / reserve_y;
        let l_add = u64::min(l_x, l_y);
        assert!(l_add > 0, 2);

        coin::join(&mut pool.coin_x, coin_x);
        coin::join(&mut pool.coin_y, coin_y);

        pool.total_share = pool.total_share + l_add;

        let pair_id = object::id(pool);
        let lp = LPShare { id: object::new(ctx), pair_id, amount: l_add };
        transfer::transfer(lp, ctx.sender());
    }

    entry fun remove_liquidity<X, Y>(
        pool: &mut Pool<X, Y>,
        lp: LPShare,
        ctx: &mut TxContext
    ) {
        let LPShare { id: lp_id, pair_id, amount: l_user } = lp;
        assert!(pair_id == object::id(pool), 3);
        assert!(l_user > 0 && l_user <= pool.total_share, 4);

        let reserve_x = coin::value(&pool.coin_x);
        let reserve_y = coin::value(&pool.coin_y);
        let ax = (reserve_x * l_user) / pool.total_share;
        let ay = (reserve_y * l_user) / pool.total_share;
        assert!(ax > 0 && ay > 0, 5);

        pool.total_share = pool.total_share - l_user;

        let out_x = coin::split(&mut pool.coin_x, ax, ctx);
        let out_y = coin::split(&mut pool.coin_y, ay, ctx);

        object::delete(lp_id);

        transfer::public_transfer(out_x, ctx.sender());
        transfer::public_transfer(out_y, ctx.sender());
    }

    entry fun swap_x_for_y<X, Y>(
        pool: &mut Pool<X, Y>,
        in_x: coin::Coin<X>,
        min_out_y: u64,
        ctx: &mut TxContext
    ) {
        let ax = coin::value(&in_x);
        assert!(ax > 0, 6);
        let rx = coin::value(&pool.coin_x);
        let ry = coin::value(&pool.coin_y);

        let fee_bps = pool.fee_bps;
        let fee_scale: u64 = 10_000;

        let ax_fee = ax * (fee_scale - fee_bps);
        let numerator = ax_fee * ry;
        let denominator = (rx * fee_scale) + ax_fee;
        let out = numerator / denominator;
        assert!(out >= min_out_y, 7);

        coin::join(&mut pool.coin_x, in_x);

        let out_y = coin::split(&mut pool.coin_y, out, ctx);
        transfer::public_transfer(out_y, ctx.sender());
    }

    entry fun swap_y_for_x<X, Y>(
        pool: &mut Pool<X, Y>,
        in_y: coin::Coin<Y>,
        min_out_x: u64,
        ctx: &mut TxContext
    ) {
        let ay = coin::value(&in_y);
        assert!(ay > 0, 8);
        let rx = coin::value(&pool.coin_x);
        let ry = coin::value(&pool.coin_y);

        let fee_bps = pool.fee_bps;
        let fee_scale: u64 = 10_000;

        let ay_fee = ay * (fee_scale - fee_bps);
        let numerator = ay_fee * rx;
        let denominator = (ry * fee_scale) + ay_fee;
        let out = numerator / denominator;
        assert!(out >= min_out_x, 9);

        coin::join(&mut pool.coin_y, in_y);
        let out_x = coin::split(&mut pool.coin_x, out, ctx);
        transfer::public_transfer(out_x, ctx.sender());
    }
}
