import { ThirdwebSDK } from "https://unpkg.com/@thirdweb-dev/sdk@latest/dist/index.mjs";

// ✅ Initialize Thirdweb SDK on Cronos
const sdk = new ThirdwebSDK("cronos");

// ✅ Staking Contract Address (Update This)
const stakingContractAddress = "0x31a96047666335bf629F68796dd0fCBF46B7C8ca";
let stakingContract;

async function loadContract() {
    try {
        stakingContract = await sdk.getContract(stakingContractAddress);
        console.log("✅ Staking contract loaded successfully.");
    } catch (error) {
        console.error("❌ Failed to load staking contract:", error);
    }
}

// **DOM Elements**
const connectWalletBtn = document.getElementById("connect-wallet");
const disconnectWalletBtn = document.getElementById("disconnect-wallet");
const walletAddressElement = document.getElementById("wallet-address");

// ✅ Connect Wallet
async function connectWallet() {
    try {
        const provider = await sdk.wallet.connect(); // Auto detects wallet (MetaMask, WalletConnect, etc.)
        const address = await provider.getAddress();
        console.log("✅ Wallet Connected:", address);

        walletAddressElement.textContent = `Connected: ${address.substring(0, 6)}...${address.slice(-4)}`;
        connectWalletBtn.style.display = "none";
        disconnectWalletBtn.style.display = "block";
    } catch (error) {
        console.error("❌ Wallet Connection Failed:", error);
        alert("Error connecting wallet. Check console.");
    }
}

// ✅ Disconnect Wallet
async function disconnectWallet() {
    try {
        await sdk.wallet.disconnect();
        walletAddressElement.textContent = "";
        connectWalletBtn.style.display = "block";
        disconnectWalletBtn.style.display = "none";
        console.log("✅ Wallet disconnected successfully.");
    } catch (error) {
        console.error("❌ Failed to disconnect wallet:", error);
    }
}

// ✅ Auto Connect Wallet on Page Load
window.onload = async () => {
    await loadContract();
    if (await sdk.wallet.isConnected()) {
        await connectWallet();
    }
};

// ✅ Event Listeners
connectWalletBtn.addEventListener("click", connectWallet);
disconnectWalletBtn.addEventListener("click", disconnectWallet);
