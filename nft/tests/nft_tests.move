
module nft::nft_tests{
    use nft::nft::{Collenction, create_collection, mint_nft};
    use sui::test_scenario;
    use std::string;

    #[test]
    fun test_nft() {
        let mut scenario = test_scenario::begin(@0xBEEF);

        // Create a Collection
        scenario.next_tx(@0xBEEF);
        let collection_name = string::utf8(b"MyNFTCollection");
        create_collection(collection_name, scenario.ctx());

        // Retrieve the Collection ID
        scenario.next_tx(@0xBEEF);
        let collection = test_scenario::take_shared<Collenction>(&scenario);
        let collection_id = object::id(&collection);
        test_scenario::return_shared<Collenction>(collection);

        // Mint an NFT in the Collection
        scenario.next_tx(@0xBEEF);
        let nft_name = string::utf8(b"MyFirstNFT");
        let nft_description = string::utf8(b"This is my first NFT");
        let nft_url = string::utf8(b"http://example.com/nft1");
        mint_nft(collection_id, nft_name, nft_description, nft_url, scenario.ctx());

        scenario.end();
    }
}
