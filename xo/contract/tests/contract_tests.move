module contract::contract_tests {
    use contract::contract::{Board, create_board, play_game, get_board_status, get_board_winner};
    use sui::test_scenario;
    use contract::contract::init_testing;
    use contract::contract::PlayingBoard;

    const Player1: address = @0x1;
    const Player2: address = @0x2;

    #[test]
    fun test_basic() {
        let mut scenario = test_scenario::begin(Player1);

        init_testing(scenario.ctx());

        // Create board
        scenario.next_tx(Player1);
        let mut store = test_scenario::take_shared<PlayingBoard>(&scenario);
        create_board(&mut store, Player2, scenario.ctx());
        test_scenario::return_shared(store);

        scenario.next_tx(Player1);
        let mut board = test_scenario::take_shared<Board>(&scenario);
        let mut store = test_scenario::take_shared<PlayingBoard>(&scenario);
        play_game(&mut store, &mut board, 0, scenario.ctx());
        test_scenario::return_shared(board);
        test_scenario::return_shared(store);

        scenario.next_tx(Player2);
        let mut board = test_scenario::take_shared<Board>(&scenario);
        let mut store = test_scenario::take_shared<PlayingBoard>(&scenario);
        play_game(&mut store, &mut board, 3, scenario.ctx());
        test_scenario::return_shared(board);
        test_scenario::return_shared(store);

        scenario.next_tx(Player1);
        let mut board = test_scenario::take_shared<Board>(&scenario);
        let mut store = test_scenario::take_shared<PlayingBoard>(&scenario);
        play_game(&mut store, &mut board, 1, scenario.ctx());
        test_scenario::return_shared(board);
        test_scenario::return_shared(store);

        scenario.next_tx(Player2);
        let mut board = test_scenario::take_shared<Board>(&scenario);
        let mut store = test_scenario::take_shared<PlayingBoard>(&scenario);
        play_game(&mut store, &mut board, 4, scenario.ctx());
        test_scenario::return_shared(board);
        test_scenario::return_shared(store);

        scenario.next_tx(Player1);
        let mut board = test_scenario::take_shared<Board>(&scenario);
        let mut store = test_scenario::take_shared<PlayingBoard>(&scenario);
        play_game(&mut store, &mut board, 2, scenario.ctx());
        test_scenario::return_shared(board);
        test_scenario::return_shared(store);

        scenario.next_tx(Player1);
        let board = test_scenario::take_shared<Board>(&scenario);
        assert!(get_board_status(&board), 100);
        assert!(get_board_winner(&board) == Player1, 101);
        test_scenario::return_shared(board);

        scenario.end();
    }
}
