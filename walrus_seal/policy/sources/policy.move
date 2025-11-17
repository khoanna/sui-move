module policy::policy {

    public struct NFT has key, store {
        id: UID,
    }

    fun init(ctx: &mut TxContext) {
        let nft = NFT {
            id: object::new(ctx),
        };
        transfer::public_transfer(nft, ctx.sender());
    }
 
    entry fun seal_approve( _id: vector<u8>, _nft: &NFT) {}

}
