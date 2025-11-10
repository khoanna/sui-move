module game::game_tests {
    use game::game::{HeroMinted, Hero, init_for_testing, mint_hero, mint_sword, mint_shield};
    use sui::test_scenario;
    use std::string;
    use game::game::get_hero_attributes;

    #[test]
    fun test_game() {
        let mut scenario = test_scenario::begin(@0xCAFE);

        // Initialize HeroMinted
        scenario.next_tx(@0xCAFE);
        init_for_testing(scenario.ctx());

        // Mint a Hero
        scenario.next_tx(@0xCAFE);
        let mut hero_minted = test_scenario::take_shared<HeroMinted>(&scenario);
        let hero_name = string::utf8(b"BraveHero");
        mint_hero(hero_name, &mut hero_minted, scenario.ctx());
        test_scenario::return_shared<HeroMinted>(hero_minted);

        // Mint a Sword for the Hero
        scenario.next_tx(@0xCAFE);
        let mut hero = test_scenario::take_from_sender<Hero>(&scenario);
        mint_sword(&mut hero, 10, scenario.ctx());
        test_scenario::return_to_sender<Hero>(&scenario,hero);

        // Mint a Shield for the Hero
        scenario.next_tx(@0xCAFE);
        let mut hero = test_scenario::take_from_sender<Hero>(&scenario);
        mint_shield(&mut hero, 10, scenario.ctx());
        test_scenario::return_to_sender<Hero>(&scenario,hero);

        // Check Hero attributes
        scenario.next_tx(@0xCAFE);
        let hero = test_scenario::take_from_sender<Hero>(&scenario);
        let (power, defense) = get_hero_attributes(&hero);
        assert!(power == 10u8, 1);
        assert!(defense == 10u8, 2);
        test_scenario::return_to_sender<Hero>(&scenario,hero);

        scenario.end();
    }
}
