import { ThirdwebSDK } from "https://unpkg.com/@thirdweb-dev/sdk@latest/dist/index.mjs";

const sdk = new ThirdwebSDK("cronos");

// ✅ Update with your actual staking contract address
const stakingContractAddress = "YOUR_STAKING_CONTRACT_ADDRESS";
const stakingContract = await sdk.getContract(stakingContractAddress);

// DOM Elements
const connectWalletBtn = document.getElementById("connect-wallet");
const disconnectWalletBtn = document.getElementById("disconnect-wallet");
const walletAddressElement = document.getElementById("wallet-address");
const stakeBtn = document.getElementById("stake-button");
const unstakeBtn = document.getElementById("unstake-button");

// ✅ Connect Wallet
async function connectWallet() {
    try {
        const provider = await sdk.wallet.connect();
        const address = await provider.getAddress();
        walletAddressElement.textContent = `Connected: ${address.substring(0, 6)}...${address.slice(-4)}`;

        connectWalletBtn.style.display = "none";
        disconnectWalletBtn.style.display = "block";

        updateStakingInfo();
    } catch (error) {
        console.error("❌ Wallet Connection Failed:", error);
    }
}

// ✅ Disconnect Wallet
async function disconnectWallet() {
    await sdk.wallet.disconnect();
    walletAddressElement.textContent = "";
    
    connectWalletBtn.style.display = "block";
    disconnectWalletBtn.style.display = "none";
}

// ✅ Stake Y2K
async function stakeTokens() {
    const amount = document.getElementById("stake-amount").value;
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        alert("Enter a valid stake amount");
        return;
    }
    
    try {
        const transaction = await stakingContract.prepare("stake", [amount]);
        await sdk.wallet.sendTransaction(transaction);
        alert(`✅ Successfully Staked ${amount} Y2K!`);
        updateStakingInfo();
    } catch (error) {
        console.error("❌ Staking Failed:", error);
        alert("Error Staking Tokens");
    }
}

// ✅ Unstake Y2K
async function unstakeTokens() {
    const amount = document.getElementById("stake-amount").value;
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        alert("Enter a valid unstake amount");
        return;
    }

    try {
        const transaction = await stakingContract.prepare("withdraw", [amount]);
        await sdk.wallet.sendTransaction(transaction);
        alert(`✅ Successfully Unstaked ${amount} Y2K!`);
        updateStakingInfo();
    } catch (error) {
        console.error("❌ Unstaking Failed:", error);
        alert("Error Unstaking Tokens");
    }
}

// ✅ Auto Fetch Data on Page Load if Wallet is Connected
window.onload = async () => {
    if (await sdk.wallet.isConnected()) {
        connectWallet();
    }
};

// ✅ Event Listeners
connectWalletBtn.addEventListener("click", connectWallet);
disconnectWalletBtn.addEventListener("click", disconnectWallet);
stakeBtn.addEventListener("click", stakeTokens);
unstakeBtn.addEventListener("click", unstakeTokens);
