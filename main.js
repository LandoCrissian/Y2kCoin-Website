// Initialize Thirdweb SDK
const { ThirdwebSDK } = window.thirdweb;

// Connect to Cronos Mainnet
const sdk = new ThirdwebSDK("cronos");

// Staking Contract Address (Update this)
const stakingContractAddress = "YOUR_STAKING_CONTRACT_ADDRESS";
const stakingContract = sdk.getContract(stakingContractAddress);

// DOM Elements
const connectWalletBtn = document.getElementById("connect-wallet");
const disconnectWalletBtn = document.getElementById("disconnect-wallet");
const walletAddressElement = document.getElementById("wallet-address");
const stakeBtn = document.getElementById("stake-button");
const unstakeBtn = document.getElementById("unstake-button");

// ✅ Connect Wallet
async function connectWallet() {
    try {
        const provider = await sdk.wallet.connect("injected"); // MetaMask, WalletConnect, etc.
        const address = await provider.getAddress();
        walletAddressElement.textContent = `Connected: ${address.substring(0, 6)}...${address.slice(-4)}`;
        
        connectWalletBtn.style.display = "none";
        disconnectWalletBtn.style.display = "block";

        updateStakingInfo(address);
    } catch (error) {
        console.error("Wallet Connection Failed:", error);
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
        await stakingContract.call("stake", [amount]);
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
        await stakingContract.call("withdraw", [amount]);
        alert(`✅ Successfully Unstaked ${amount} Y2K!`);
        updateStakingInfo();
    } catch (error) {
        console.error("❌ Unstaking Failed:", error);
        alert("Error Unstaking Tokens");
    }
}

// ✅ Update Staking Info
async function updateStakingInfo() {
    try {
        const provider = await sdk.wallet.getProvider();
        if (!provider) return;

        const address = await provider.getAddress();
        const { _tokensStaked, _rewards } = await stakingContract.call("getStakeInfo", [address]);

        document.getElementById("staked-amount").textContent = _tokensStaked;
        document.getElementById("rewards-earned").textContent = _rewards;
    } catch (error) {
        console.error("Failed to fetch staking info:", error);
    }
}

// ✅ Event Listeners
connectWalletBtn.addEventListener("click", connectWallet);
disconnectWalletBtn.addEventListener("click", disconnectWallet);
stakeBtn.addEventListener("click", stakeTokens);
unstakeBtn.addEventListener("click", unstakeTokens);

// ✅ Auto Fetch Data on Page Load if Wallet is Connected
window.onload = async () => {
    if (await sdk.wallet.isConnected()) {
        connectWallet();
    }
};
