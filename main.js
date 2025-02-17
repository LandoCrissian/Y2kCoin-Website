// Web3 integration
let web3;
let stakingContract;
let y2kTokenContract;

const stakingContractAddress = "0x2A1C780f6A02B0a5Fcaa51a3110B27dc6c15E1f6";
const y2kTokenAddress = "0xB4Df7d2A736Cc391146bB0dF4277E8F68247Ac6d";

// ABI Definitions
const stakingABI = [ /* Your Staking ABI Here */ ];
const y2kTokenABI = [ /* Your Token ABI Here */ ];

// DOM Elements
const connectWalletBtn = document.getElementById("connect-wallet");
const disconnectWalletBtn = document.getElementById("disconnect-wallet");
const walletAddressElement = document.getElementById("wallet-address");

// ✅ Connect Wallet Function
async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts[0];

            walletAddressElement.textContent = `Connected: ${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;

            stakingContract = new web3.eth.Contract(stakingABI, stakingContractAddress);
            y2kTokenContract = new web3.eth.Contract(y2kTokenABI, y2kTokenAddress);

            connectWalletBtn.style.display = "none";
            disconnectWalletBtn.style.display = "block";

            updateStakingInfo();
        } catch (error) {
            console.error("Failed to connect wallet:", error);
            alert("Failed to connect wallet. Please try again.");
        }
    } else {
        alert("Please install MetaMask!");
    }
}

// ✅ Disconnect Wallet Function
async function disconnectWallet() {
    walletAddressElement.textContent = "";
    connectWalletBtn.style.display = "block";
    disconnectWalletBtn.style.display = "none";
    web3 = null;
    stakingContract = null;
    y2kTokenContract = null;
}

// ✅ Auto Fetch Data on Page Load if Wallet is Connected
window.onload = async () => {
    if (window.ethereum && window.ethereum.selectedAddress) {
        connectWallet();
    }
};

// ✅ Event Listeners
connectWalletBtn.addEventListener("click", connectWallet);
disconnectWalletBtn.addEventListener("click", disconnectWallet);
