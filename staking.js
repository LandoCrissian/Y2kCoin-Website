import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  sendTransaction,
} from "thirdweb";
import { defineChain } from "thirdweb/chains";

// ✅ Create the Thirdweb client
const client = createThirdwebClient({
  clientId: "cb4c41b2ca4e8cfbc3a2f92d205a65cf",
});

// ✅ Connect to the staking contract on Cronos
const contract = getContract({
  client,
  chain: defineChain(25), // Cronos Mainnet
  address: "0x31a96047666335bf629F68796dd0fCBF46B7C8ca",
});

// ✅ DOM Elements
const connectWalletBtn = document.getElementById("connect-wallet");
const disconnectWalletBtn = document.getElementById("disconnect-wallet");
const stakeBtn = document.getElementById("stake-button");
const unstakeBtn = document.getElementById("unstake-button");
const claimRewardsBtn = document.getElementById("claim-rewards");
const walletAddressElement = document.getElementById("wallet-address");

// ✅ Connect Wallet (Supports Multiple Wallets)
async function connectWallet() {
  try {
    const { wallet } = await client.wallet.connect([
      "injected",      // MetaMask, Rabby, Zerion
      "coinbaseWallet", // Coinbase Wallet
      "walletConnect", // Rainbow Wallet & others via WalletConnect
    ]);

    const address = await wallet.getAddress();
    walletAddressElement.textContent = `Connected: ${address.substring(0, 6)}...${address.slice(-4)}`;

    connectWalletBtn.style.display = "none";
    disconnectWalletBtn.style.display = "block";

    updateStakingInfo(address);
  } catch (error) {
    console.error("Wallet connection failed:", error);
    alert("❌ Wallet connection failed. Please try again.");
  }
}

// ✅ Disconnect Wallet
async function disconnectWallet() {
  try {
    await client.wallet.disconnect();
    walletAddressElement.textContent = "";
    connectWalletBtn.style.display = "block";
    disconnectWalletBtn.style.display = "none";
  } catch (error) {
    console.error("Wallet disconnection failed:", error);
    alert("❌ Failed to disconnect wallet.");
  }
}

// ✅ Stake Y2K Tokens
async function stakeTokens() {
  const amount = document.getElementById("stake-amount").value;
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    alert("❌ Enter a valid amount to stake.");
    return;
  }

  try {
    const transaction = await prepareContractCall({
      contract,
      method: "stake",
      params: [BigInt(amount * 1e18)], // Convert to BigNumber for smart contracts
    });

    await sendTransaction({ transaction });
    alert(`✅ Successfully staked ${amount} Y2K!`);
    updateStakingInfo();
  } catch (error) {
    console.error("Staking failed:", error);
    alert("❌ Error staking tokens.");
  }
}

// ✅ Unstake Y2K Tokens
async function unstakeTokens() {
  const amount = document.getElementById("stake-amount").value;
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    alert("❌ Enter a valid amount to unstake.");
    return;
  }

  try {
    const transaction = await prepareContractCall({
      contract,
      method: "withdraw",
      params: [BigInt(amount * 1e18)], // Convert to BigNumber
    });

    await sendTransaction({ transaction });
    alert(`✅ Successfully unstaked ${amount} Y2K!`);
    updateStakingInfo();
  } catch (error) {
    console.error("Unstaking failed:", error);
    alert("❌ Error unstaking tokens.");
  }
}

// ✅ Claim Staking Rewards
async function claimRewards() {
  try {
    const transaction = await prepareContractCall({
      contract,
      method: "claimRewards",
      params: [],
    });

    await sendTransaction({ transaction });
    alert("✅ Successfully claimed rewards!");
    updateStakingInfo();
  } catch (error) {
    console.error("Claiming rewards failed:", error);
    alert("❌ Error claiming rewards.");
  }
}

// ✅ Fetch Staking Info
async function updateStakingInfo() {
  try {
    const provider = await client.wallet.getProvider();
    if (!provider) return;

    const address = await provider.getAddress();
    const { _tokensStaked, _rewards } = await contract.call("getStakeInfo", [address]);

    document.getElementById("staked-amount").textContent = (_tokensStaked / BigInt(1e18)).toString();
    document.getElementById("rewards-earned").textContent = (_rewards / BigInt(1e18)).toString();
  } catch (error) {
    console.error("Failed to fetch staking info:", error);
    alert("❌ Error fetching staking information.");
  }
}

// ✅ Event Listeners
connectWalletBtn.addEventListener("click", connectWallet);
disconnectWalletBtn.addEventListener("click", disconnectWallet);
stakeBtn.addEventListener("click", stakeTokens);
unstakeBtn.addEventListener("click", unstakeTokens);
claimRewardsBtn.addEventListener("click", claimRewards);

// ✅ Auto Fetch Data on Page Load if Wallet is Connected
window.onload = async () => {
  if (await client.wallet.isConnected()) {
    connectWallet();
  }
};
