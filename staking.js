// Import ethers.js
const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer;
let stakingContract;

// Staking Contract Address (Cronos Mainnet)
const stakingContractAddress = "0x2A1C780f6A02B0a5Fcaa51a3110B27dc6c15E1f6";

// Staking Contract ABI
const stakingABI = [[{"inputs":[{"internalType":"address","name":"_y2kToken","type":"address"},{"internalType":"address","name":"_pogsToken","type":"address"},{"internalType":"uint256","name":"_rewardRate","type":"uint256"},{"internalType":"address","name":"_initialOwner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"lockPeriod","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Unstaked","type":"event"},{"inputs":[],"name":"burnRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_staker","type":"address"}],"name":"calculateReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claimReward","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pogsToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rewardRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"uint256","name":"_lockPeriod","type":"uint256"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"stakes","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"lockPeriod","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newRate","type":"uint256"}],"name":"updateBurnRate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newRate","type":"uint256"}],"name":"updateRewardRate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_tokenAddress","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdrawTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"y2kToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"}]];

// Function to connect wallet
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

// Function to stake tokens
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

// Function to unstake tokens
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

// Function to claim rewards
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
