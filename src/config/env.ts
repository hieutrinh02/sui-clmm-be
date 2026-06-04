export const env = {
  get databaseUrl() {
    return process.env.DATABASE_URL ?? '';
  },
  get suiRpcUrl() {
    return process.env.SUI_RPC_URL ?? 'https://fullnode.testnet.sui.io:443';
  },
  get suiPackageId() {
    return process.env.SUI_PACKAGE_ID ?? '';
  },
};
