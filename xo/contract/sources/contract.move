module contract::contract {
    use sui::table::{Self, Table};

    public struct PlayingBoard has key {
        id: UID,
        mapping: Table<address, ID>,
    }
    
    public struct Board has key {
        id: object::UID,
        player: vector<address>,
        next_player: address,
        game: vector<address>,
        winner: address,
        ended: bool,
    }

    fun init (ctx: &mut TxContext) {
        let store = PlayingBoard {
            id: object::new(ctx),
            mapping: table::new<address, ID>(ctx),
        };
        transfer::share_object(store)
    }

    entry fun create_board(playing: &mut PlayingBoard, player_with: address, ctx: &mut TxContext) {
        let board = Board {
            id: object::new(ctx),
            player: vector[ctx.sender(), player_with],
            next_player: ctx.sender(),
            game: vector[@0x0,@0x0,@0x0,@0x0,@0x0,@0x0,@0x0,@0x0,@0x0],
            winner: @0x0,
            ended: false,
        };
        let board_id = object::id(&board);
        table::add(&mut playing.mapping, ctx.sender(), board_id);
        table::add(&mut playing.mapping, player_with, board_id);
        transfer::share_object(board)
    }

    entry fun play_game(playing: &mut PlayingBoard, board: &mut Board, position: u8,  ctx: &TxContext) {
        // Verify game not ended
        assert!(!board.ended, 0);

        // Verify position
        assert!(position < 9, 1);
        let cell = *vector::borrow(&board.game, position as u64);
        assert!(cell == @0x0, 3);
        
        // Verify player
        assert!(ctx.sender() == board.next_player, 2);
        if (ctx.sender() == *vector::borrow(&board.player, 0)) {
            board.next_player = *vector::borrow(&board.player, 1);
        } else {
            board.next_player = *vector::borrow(&board.player, 0);
        };

        // Update the game state
        let player_ref = vector::borrow_mut(&mut  board.game, position as u64);
        *player_ref = ctx.sender();

        // Check for win condition
        if (check_row(board) || check_column(board) || check_diagonal(board)) {
            board.ended = true;
            board.winner = ctx.sender();
            table::remove(&mut playing.mapping, ctx.sender());
            let other_player = if (ctx.sender() == *vector::borrow(&board.player, 0)) {
                *vector::borrow(&board.player, 1)
            } else {
                *vector::borrow(&board.player, 0)
            };
            table::remove(&mut playing.mapping, other_player);
        };

    }

    public fun check_row(board: &Board): bool {
        let mut i = 0;
        while (i < 3) {
            let base = i * 3;
            let cell1 = *vector::borrow(&board.game, base as u64);
            let cell2 = *vector::borrow(&board.game, (base + 1) as u64);
            let cell3 = *vector::borrow(&board.game, (base + 2) as u64);
            if (cell1 != @0x0 && cell1 == cell2 && cell2 == cell3) {
                return true
            };
            i = i + 1;
        };
        false
    }
    
    public fun check_column(board: &Board): bool {
        let mut i = 0;
        while (i < 3) {
            let cell1 = *vector::borrow(&board.game, i as u64);
            let cell2 = *vector::borrow(&board.game, (i + 3) as u64);
            let cell3 = *vector::borrow(&board.game, (i + 6) as u64);
            if (cell1 != @0x0 && cell1 == cell2 && cell2 == cell3) {
                return true
            };
            i = i + 1;
        };
        false
    }

    public fun check_diagonal(board: &Board): bool {
        let cell1 = *vector::borrow(&board.game, 0);
        let cell2 = *vector::borrow(&board.game, 4);
        let cell3 = *vector::borrow(&board.game, 8);
        if (cell1 != @0x0 && cell1 == cell2 && cell2 == cell3) {
            return true
        };
        let cell4 = *vector::borrow(&board.game, 2);
        let cell5 = *vector::borrow(&board.game, 4);
        let cell6 = *vector::borrow(&board.game, 6);
        if (cell4 != @0x0 && cell4 == cell5 && cell5 == cell6) {
            return true
        };
        false
    }

    #[test_only]
    public fun init_testing( ctx: &mut TxContext) {
        init(ctx)
    }

    #[test_only]
    public fun get_board_status(board: &Board): bool {
        board.ended
    }

    #[test_only]
    public fun get_board_winner(board: &Board): address {
        board.winner
    }
}
