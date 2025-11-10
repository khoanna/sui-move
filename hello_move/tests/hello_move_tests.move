#[test_only]
module hello_move::hello_move_tests{

    use hello_move::hello_move::{Greeting, create_greeting, update_greeting, get_text};
    use std::string;
    use sui::test_scenario;
    use std::unit_test::assert_eq;

    #[test]
    fun test_hello_move() {
        let mut scenario = test_scenario::begin(@0xCAFE);
        let greeting_text = string::utf8(b"Hello Move!");

        // Create greeting
        scenario.next_tx(@0xCAFE);
        create_greeting(greeting_text, scenario.ctx());


        // Update greeting
        scenario.next_tx(@0xCAFE);
        let update_text = string::utf8(b"Hello Updated Move!");
        let mut greeting = test_scenario::take_shared<Greeting>(&scenario);
        assert_eq!(get_text(&greeting), string::utf8(b"Hello Move!"));
        update_greeting(&mut greeting, update_text);
        test_scenario::return_shared<Greeting>(greeting);

        scenario.end();
    }
}

