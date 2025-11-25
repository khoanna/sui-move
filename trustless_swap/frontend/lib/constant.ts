export const PACKAGE_ID = "0x52ea4a5e7d5b648f42fb8e9b281cf34cc7248a55f19cb32887d3b3aacee832d7";

// Common Coin Types
export const SUI_COIN_TYPE = "0x2::coin::Coin<0x2::sui::SUI>";
export const WAL_COIN_TYPE = "0x2::coin::Coin<0x8270feb7375eee355e64fdb69c50abb6b5f9393a722883c1cf45f8e26048810a::wal::WAL>";

// Helper function to wrap token type in Coin wrapper
export const wrapCoinType = (innerType: string) => `0x2::coin::Coin<${innerType}>`;

// Common token inner types (without Coin wrapper)
export const TOKEN_TYPES = {
  SUI: "0x2::sui::SUI",
  WAL: "0x8270feb7375eee355e64fdb69c50abb6b5f9393a722883c1cf45f8e26048810a::wal::WAL",
} as const;

