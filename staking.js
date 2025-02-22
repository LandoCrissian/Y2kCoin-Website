// staking.js

// Initialize Web3 and contract variables
let contract;
let signer;
let provider;

const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS";
const CONTRACT_ABI = []; // Add your contract ABI here

// Wallet Connection
async function connectWallet() {
    try {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        const address = await signer.getAddress();
        document.getElementById("wallet-address").textContent = `${address.substring(0, 6)}...${address.substring(38)}`;
        document.getElementById("connect-wallet").style.display = "none";
        document.getElementById("disconnect-wallet").style.display = "block";
        
        // Get network info
        const network = await provider.getNetwork();
        document.getElementById("network-name").textContent = network.name;
        document.getElementById("contract-status").textContent = "Connected";
        
        updateUI();
    } catch (error) {
        console.error("Error connecting wallet:", error);
        alert("Failed to connect wallet");
    }
}

// Disconnect Wallet
async function disconnectWallet() {
    contract = null;
    signer = null;
    provider = null;
    
    document.getElementById("wallet-address").textContent = "";
    document.getElementById("connect-wallet").style.display = "block";
    document.getElementById("disconnect-wallet").style.display = "none";
    document.getElementById("network-name").textContent = "Not Connected";
    document.getElementById("contract-status").textContent = "Not Connected";
    
    resetUI();
}

// Update UI with contract data
async function updateUI() {
    if (!contract) return;
    
    try {
        const address = await signer.getAddress();
        
        // Get staking info
        const stake = await contract.stakes(address);
        document.getElementById("staked-amount").textContent = ethers.utils.formatEther(stake.amount);
        
        // Get pending rewards
        const pendingRewards = await contract.calculateReward(address);
        document.getElementById("pending-rewards").textContent = ethers.utils.formatEther(pendingRewards);
        
        // Get referral rewards
        const referralRewards = await contract.referralRewards(address);
        document.getElementById("referral-rewards").textContent = ethers.utils.formatEther(referralRewards);
        
        // Get protocol info
        const rewardRate = await contract.rewardRate();
        const burnRate = await contract.burnRate();
        const totalStaked = await contract.totalStaked();
        
        document.getElementById("reward-rate").textContent = ethers.utils.formatEther(rewardRate);
        document.getElementById("burn-rate").textContent = burnRate.toString();
        document.getElementById("total-staked").textContent = ethers.utils.formatEther(totalStaked);
        
        // Get feature status
        const autoCompoundingEnabled = await contract.autoCompoundingEnabled(address);
        const lotteryEnabled = await contract.lotteryEnabled();
        
        document.getElementById("auto-compound-toggle").checked = autoCompoundingEnabled;
        document.getElementById("lottery-status").textContent = lotteryEnabled ? "Enabled" : "Disabled";
        
        // Get lottery info if enabled
        if (lotteryEnabled) {
            const nextDraw = await contract.nextLotteryDraw();
            const prizePool = await contract.lotteryPrizePool();
            
            document.getElementById("next-draw").textContent = new Date(nextDraw * 1000).toLocaleString();
            document.getElementById("prize-pool").textContent = ethers.utils.formatEther(prizePool);
        }
    } catch (error) {
        console.error("Error updating UI:", error);
    }
}

// Reset UI to default values
function resetUI() {
    document.getElementById("staked-amount").textContent = "0";
    document.getElementById("pending-rewards").textContent = "0";
    document.getElementById("referral-rewards").textContent = "0";
    document.getElementById("reward-rate").textContent = "0";
    document.getElementById("burn-rate").textContent = "0";
    document.getElementById("total-staked").textContent = "0";
    document.getElementById("lottery-status").textContent = "Disabled";
    document.getElementById("next-draw").textContent = "-";
    document.getElementById("prize-pool").textContent = "0";
    document.getElementById("auto-compound-toggle").checked = false;
    document.getElementById("lottery-toggle").checked = false;
}

// Staking Functions
async function stake() {
    try {
        const amount = document.getElementById("stake-amount").value;
        const referrer = document.getElementById("referral-address").value || ethers.constants.AddressZero;
        
        // Check if amount is valid
        if (!amount || amount <= 0) {
            alert("Please enter a valid amount to stake");
            return;
        }
        
        const tx = await contract.stake(ethers.utils.parseEther(amount), referrer);
        await tx.wait();
        updateUI();
        alert("Staking successful!");
    } catch (error) {
        console.error("Staking error:", error);
        alert("Failed to stake tokens");
    }
}

async function unstake() {
    try {
        const tx = await contract.unstake();
        await tx.wait();
        updateUI();
        alert("Unstaking successful!");
    } catch (error) {
        console.error("Unstaking error:", error);
        alert("Failed to unstake tokens");
    }
}

async function claimRewards() {
    try {
        const tx = await contract.claimReward();
        await tx.wait();
        updateUI();
        alert("Rewards claimed successfully!");
    } catch (error) {
        console.error("Claim error:", error);
        alert("Failed to claim rewards");
    }
}

// Toggle Functions
async function toggleAutoCompound() {
    try {
        const enabled = document.getElementById("auto-compound-toggle").checked;
        const tx = await contract.setAutoCompounding(enabled);
        await tx.wait();
        updateUI();
    } catch (error) {
        console.error("Auto-compound toggle error:", error);
        alert("Failed to toggle auto-compounding");
    }
}

async function toggleLottery() {
    try {
        const enabled = document.getElementById("lottery-toggle").checked;
        const tx = await contract.setLotteryParticipation(enabled);
        await tx.wait();
        updateUI();
    } catch (error) {
        console.error("Lottery toggle error:", error);
        alert("Failed to toggle lottery participation");
    }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("connect-wallet").addEventListener("click", connectWallet);
    document.getElementById("disconnect-wallet").addEventListener("click", disconnectWallet);
    document.getElementById("stake-button").addEventListener("click", stake);
    document.getElementById("unstake-button").addEventListener("click", unstake);
    document.getElementById("claim-rewards").addEventListener("click", claimRewards);
    document.getElementById("auto-compound-toggle").addEventListener("change", toggleAutoCompound);
    document.getElementById("lottery-toggle").addEventListener("change", toggleLottery);
});

// Update UI every 30 seconds
setInterval(updateUI, 30000);
