import { ThirdwebSDK } from "https://unpkg.com/@thirdweb-dev/sdk@latest/dist/index.mjs";

// Initialize SDK
let sdk;
let stakingContract;

// DOM Elements
const connectWalletBtn = document.getElementById("connect-wallet");
const disconnectWalletBtn = document.getElementById("disconnect-wallet");
const walletAddressElement = document.getElementById("wallet-address");
const stakeBtn = document.getElementById("stake-button");
const unstakeBtn = document.getElementById("unstake-button");
const stakedAmountElement = document.getElementById("staked-amount");
const rewardsEarnedElement = document.getElementById("rewards-earned");

// Contract address
const stakingContractAddress = "YOUR_STAKING_CONTRACT_ADDRESS"; // Replace with actual address

// Initialize SDK and contract
async function initializeSDK() {
    sdk = new ThirdwebSDK("cronos");
    stakingContract = await sdk.getContract(stakingContractAddress);
}

// Connect Wallet
async function connectWallet() {
    try {
        await initializeSDK();
        const signer = await sdk.wallet.connectToSigner();
        if (!signer) throw new Error("Failed to connect to signer");

        const address = await signer.getAddress();
        walletAddressElement.textContent = `Connected: ${address.substring(0, 6)}...${address.slice(-4)}`;

        connectWalletBtn.style.display = "none";
        disconnectWalletBtn.style.display = "block";

        await updateStakingInfo();
    } catch (error) {
        console.error("❌ Wallet Connection Failed:", error);
        alert("Failed to connect wallet. Please try again.");
    }
}

// Disconnect Wallet
async function disconnectWallet() {
    try {
        await sdk.wallet.disconnect();
        walletAddressElement.textContent = "";
        
        connectWalletBtn.style.display = "block";
        disconnectWalletBtn.style.display = "none";

        stakedAmountElement.textContent = "0";
        rewardsEarnedElement.textContent = "0";
    } catch (error) {
        console.error("❌ Wallet Disconnection Failed:", error);
        alert("Failed to disconnect wallet. Please try again.");
    }
}

// Stake Y2K
async function stakeTokens() {
    const amount = document.getElementById("stake-amount").value;
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        alert("Please enter a valid stake amount");
        return;
    }
    
    try {
        const transaction = await stakingContract.prepare("stake", [amount]);
        await sdk.wallet.sendTransaction(transaction);
        alert(`✅ Successfully Staked ${amount} Y2K!`);
        await updateStakingInfo();
    } catch (error) {
        console.error("❌ Staking Failed:", error);
        alert("Error Staking Tokens. Please try again.");
    }
}

// Unstake Y2K
async function unstakeTokens() {
    const amount = document.getElementById("stake-amount").value;
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        alert("Please enter a valid unstake amount");
        return;
    }

    try {
        const transaction = await stakingContract.prepare("withdraw", [amount]);
        await sdk.wallet.sendTransaction(transaction);
        alert(`✅ Successfully Unstaked ${amount} Y2K!`);
        await updateStakingInfo();
    } catch (error) {
        console.error("❌ Unstaking Failed:", error);
        alert("Error Unstaking Tokens. Please try again.");
    }
}

// Update Staking Info
async function updateStakingInfo() {
    try {
        const address = await sdk.wallet.getAddress();
        const stakedBalance = await stakingContract.call("balanceOf", [address]);
        const rewards = await stakingContract.call("getRewards", [address]);

        stakedAmountElement.textContent = stakedBalance.toString();
        rewardsEarnedElement.textContent = rewards.toString();
    } catch (error) {
        console.error("❌ Failed to update staking info:", error);
    }
}

// Auto Fetch Data on Page Load if Wallet is Connected
window.onload = async () => {
    await initializeSDK();
    if (await sdk.wallet.isConnected()) {
        await connectWallet();
    }
};

// Event Listeners
connectWalletBtn.addEventListener("click", connectWallet);
disconnectWalletBtn.addEventListener("click", disconnectWallet);
stakeBtn.addEventListener("click", stakeTokens);
unstakeBtn.addEventListener("click", unstakeTokens);
