/// Module: nft
module nft::nft {
    use std::string;

    public struct Collenction has key {
        id: UID,
        name: string::String,
    }

    public struct NFT has key {
        id: UID,
        collection_id: ID,
        name: string::String,
        description: string::String,
        url: string::String,
    }

    entry fun create_collection(name: string::String, ctx: &mut TxContext) {
        let collection = Collenction {
            id: object::new(ctx),
            name,
        };
        transfer::share_object(collection)
    }

    entry fun mint_nft(collection_id: object::ID, name: string::String, description: string::String, url: string::String, ctx: &mut TxContext) {
        let nft = NFT {
            id: object::new(ctx),
            collection_id,
            name,
            description,
            url,
        };
        transfer::transfer(nft, ctx.sender());
    }

}