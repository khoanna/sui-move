module contract::contract {
    
    use sui::random;
    use sui::table;

    const DEALER_WIN: u8 = 0;
    const DRAW: u8 = 1;
    const PLAYER_WIN: u8 = 2;

    public struct UserToGame has key {
        id: object::UID,
        mapping: table::Table<address, ID>,
    }

    public struct Game has key {
        id: object::UID,
        player: address,
        dealer_points: vector<u8>,
        player_points: vector<u8>,
        is_end: bool,
        status: u8,
    }

    fun init(ctx: &mut TxContext) {
        let mapping = UserToGame {
            id: object::new(ctx),
            mapping: table::new<address, ID>(ctx),
        };
        transfer::share_object(mapping);
    }

    entry fun create_game(mapping: &mut UserToGame, r: &random::Random , ctx: &mut TxContext) {
        if (table::contains(&mapping.mapping, ctx.sender())) {
            table::remove(&mut mapping.mapping, ctx.sender());
        };

        let mut game = Game {
            id: object::new(ctx),
            player: ctx.sender(),
            dealer_points: vector::empty<u8>(),
            player_points: vector::empty<u8>(),
            is_end: false,
            status: 0,
        };
    
        table::add(&mut mapping.mapping, ctx.sender(), object::id(&game));

        let mut i = 0;
        while (i < 2) {
            let point = random_point(r, ctx);
            vector::push_back(&mut game.dealer_points, point);
            i = i + 1;
        };

        i = 0;
        while (i < 2) {
            let point = random_point(r, ctx);
            vector::push_back(&mut game.player_points, point);
            i = i + 1;
        };

        transfer::share_object(game);
    }

    entry fun hit(game: &mut Game, r: &random::Random, ctx: &mut TxContext) {
        let point = random_point(r, ctx);
        vector::push_back(&mut game.player_points, point);
        
        if (total_points(&game.player_points) > 21) {
            game.is_end = true;
            game.status = DEALER_WIN;
        };
    }
    
    entry fun stand(game: &mut Game, r: &random::Random, ctx: &mut TxContext) {
        let mut dealer_total = total_points(&game.dealer_points);

        while (dealer_total < 17) {
            let point = random_point(r, ctx);
            vector::push_back(&mut game.dealer_points, point);
            dealer_total = total_points(&game.dealer_points);
        };
        
        game.is_end = true;
        game.status = is_end(game);
    }

    fun random_point(r: &random::Random, ctx: &mut TxContext): u8 {
        let mut gen = random::new_generator(r, ctx);
        let value = random::generate_u8_in_range(&mut gen, 1, 10);
        value
    }

    fun total_points(points: &vector<u8>): u8 {
        let mut total = 0;
        let len = vector::length(points);
        let mut i = 0;
        while (i < len) {
            total = total + *vector::borrow(points, i);
            i = i + 1;
        };
        total
    }

    fun is_end(game: &Game): u8 {
        let dealer_total = total_points(&game.dealer_points);
        let player_total = total_points(&game.player_points);

        if (player_total > 21) {
            DEALER_WIN
        } else if (dealer_total > 21 || player_total > dealer_total) {
            PLAYER_WIN
        } else if (dealer_total > player_total) {
            DEALER_WIN
        } else {
            DRAW
        }
    }

}
