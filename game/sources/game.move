module game::game {
    use std::string::String;

    public struct HeroMinted has key {
        id: UID,
        hasHero: vector<address>
    }

    public struct Hero has key{
        id: UID,
        name: String,
        health: u8,
        power: u8,
        defense: u8,
    }

    public struct Sword has key {
        id: UID,
        power: u8,
    }

    public struct Shield has key {
        id: UID,
        defense: u8,
    }

    fun init (ctx: &mut TxContext) {
        let hero_minted = HeroMinted {
            id: object::new(ctx),
            hasHero: vector::empty<address>(),
        };
        transfer::share_object(hero_minted);
    }

    entry fun mint_hero(name: String, heroMinted: &mut HeroMinted, ctx: &mut TxContext) {
       let mut i  = 0;
       let length = vector::length(&heroMinted.hasHero);

        while (i < length) {
            let addr = *vector::borrow(&heroMinted.hasHero, i);
            assert!(addr != ctx.sender(), 0);
            i = i + 1;
        };

        let hero = Hero {
            id: object::new(ctx),
            name,
            health: 5,
            power: 0,
            defense: 0,
        };
        
        vector::push_back(&mut heroMinted.hasHero, ctx.sender());
        transfer::transfer(hero, ctx.sender());
    }

    entry fun mint_sword(hero: &mut Hero, power: u8, ctx: &mut TxContext) {
        let sword = Sword {
            id: object::new(ctx),
            power,
        };
        hero.power = hero.power + power;
        transfer::transfer(sword, ctx.sender());
    }

    entry fun mint_shield(hero: &mut Hero, defense: u8, ctx: &mut TxContext) {
        let shield = Shield {
            id: object::new(ctx),
            defense,
        };
        hero.defense = hero.defense + defense;
        transfer::transfer(shield, ctx.sender());
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }

    #[test_only]
    public fun get_hero_attributes(hero: &Hero): (u8, u8) {
        (hero.power, hero.defense)
    }

}
