// ✅ Load Web3 provider
const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer;
let stakingContract;

// ✅ Staking Contract Address (Cronos Mainnet)
const stakingContractAddress = "0x2A1C780f6A02B0a5Fcaa51a3110B27dc6c15E1f6";

// ✅ Staking Contract ABI (FIXED)
const stakingABI = [{"inputs":[{"internalType":"address","name":"_y2kToken","type":"address"},
{"internalType":"address","name":"_pogsToken","type":"address"},{"internalType":"uint256","name":"_rewardRate","type":"uint256"},
{"internalType":"address","name":"_initialOwner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"uint256","name":"_lockPeriod","type":"uint256"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},
{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"},
{"inputs":[],"name":"claimReward","outputs":[],"stateMutability":"nonpayable","type":"function"}];

// ✅ Connect Wallet
async function connectWallet() {
    if (window.ethereum) {
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        stakingContract = new ethers.Contract(stakingContractAddress, stakingABI, signer);
        alert("Wallet Connected!");
    } else {
        alert("Please install MetaMask!");
    }
}

// ✅ Stake Tokens
async function stakeTokens() {
    const amount = prompt("Enter amount of Y2K to stake:");
    if (!amount || isNaN(amount) || amount <= 0) return alert("Enter a valid amount.");
    
    try {
        const tx = await stakingContract.stake(ethers.utils.parseUnits(amount, 18), 30 * 24 * 60 * 60);
        await tx.wait();
        alert("Staked successfully!");
    } catch (error) {
        console.error("Staking failed:", error);
        alert("Error staking tokens.");
    }
}

// ✅ Unstake Tokens
async function unstakeTokens() {
    const amount = prompt("Enter amount of Y2K to unstake:");
    if (!amount || isNaN(amount) || amount <= 0) return alert("Enter a valid amount.");
    
    try {
        const tx = await stakingContract.unstake(ethers.utils.parseUnits(amount, 18));
        await tx.wait();
        alert("Unstaked successfully!");
    } catch (error) {
        console.error("Unstaking failed:", error);
        alert("Error unstaking tokens.");
    }
}

// ✅ Claim Rewards
async function claimRewards() {
    try {
        const tx = await stakingContract.claimReward();
        await tx.wait();
        alert("Rewards claimed!");
    } catch (error) {
        console.error("Claiming rewards failed:", error);
        alert("Error claiming rewards.");
    }
}
