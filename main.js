// Web3 integration
let web3;
let stakingContract;
let y2kTokenContract;
const stakingContractAddress = "0x2A1C780f6A02B0a5Fcaa51a3110B27dc6c15E1f6";
const y2kTokenAddress = "0xB4Df7d2A736Cc391146bB0dF4277E8F68247Ac6d";

// ABI (Application Binary Interface) for the contracts
const stakingABI = [/* Paste Staking ABI Here */];
const y2kTokenABI = [/* Paste Y2K Token ABI Here */];

// DOM Elements
const connectWalletBtn = document.getElementById("connect-wallet");
const walletAddressElement = document.getElementById("wallet-address");
const stakeAmountInput = document.getElementById("stake-amount");
const lockPeriodInput = document.getElementById("lock-period");
const stakeButton = document.getElementById("stake-button");
const unstakeButton = document.getElementById("unstake-button");
const claimRewardsButton = document.getElementById("claim-rewards");
const stakedAmountElement = document.getElementById("staked-amount");
const rewardsEarnedElement = document.getElementById("rewards-earned");

// Connect wallet function
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

            updateStakingInfo();
        } catch (error) {
            console.error("❌ Failed to connect wallet:", error);
        }
    } else {
        alert("Please install MetaMask to connect your wallet.");
    }
}

// Update staking info
async function updateStakingInfo() {
    if (!web3 || !stakingContract) return;

    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];

    try {
        const stakeInfo = await stakingContract.methods.stakes(userAddress).call();
        const rewards = await stakingContract.methods.calculateReward(userAddress).call();

        stakedAmountElement.textContent = web3.utils.fromWei(stakeInfo.amount, "ether");
        rewardsEarnedElement.textContent = web3.utils.fromWei(rewards, "ether");
    } catch (error) {
        console.error("❌ Failed to fetch staking info:", error);
    }
}

// Stake function
async function stake() {
    if (!web3 || !stakingContract || !y2kTokenContract) return;

    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];
    const amount = web3.utils.toWei(stakeAmountInput.value, "ether");
    const lockPeriod = parseInt(lockPeriodInput.value);

    // 🔥 Validate input fields
    if (amount <= 0) {
        alert("Please enter a valid amount to stake.");
        return;
    }
    if (![2592000, 7776000, 15552000].includes(lockPeriod)) {
        alert("Invalid lock period. Choose 30, 90, or 180 days.");
        return;
    }

    console.log("Staking Y2K:", amount, " Lock Period:", lockPeriod);

    try {
        // 1️⃣ Check if the user has approved enough Y2K tokens
        const allowance = await y2kTokenContract.methods.allowance(userAddress, stakingContractAddress).call();
        if (web3.utils.toBN(allowance).lt(web3.utils.toBN(amount))) {
            console.log("Approving staking contract...");
            await y2kTokenContract.methods.approve(stakingContractAddress, amount).send({ from: userAddress });
        }

        // 2️⃣ Stake tokens after approval
        console.log("Staking now...");
        await stakingContract.methods.stake(amount, lockPeriod).send({ from: userAddress });

        console.log("✅ Staking successful!");
        updateStakingInfo();
    } catch (error) {
        console.error("❌ Staking transaction failed:", error);
        alert("Staking transaction failed. Check console for details.");
    }
}

// Unstake function
async function unstake() {
    if (!web3 || !stakingContract) return;

    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];

    try {
        await stakingContract.methods.unstake().send({ from: userAddress });

        console.log("✅ Unstaking successful!");
        updateStakingInfo();
    } catch (error) {
        console.error("❌ Unstaking transaction failed:", error);
        alert("Unstaking transaction failed. Check console for details.");
    }
}

// Claim Rewards function
async function claimRewards() {
    if (!web3 || !stakingContract) return;

    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];

    try {
        await stakingContract.methods.claimReward().send({ from: userAddress });

        console.log("✅ Rewards claimed successfully!");
        updateStakingInfo();
    } catch (error) {
        console.error("❌ Claim rewards transaction failed:", error);
        alert("Claiming rewards failed. Check console for details.");
    }
}

// Event Listeners
connectWalletBtn.addEventListener("click", connectWallet);
stakeButton.addEventListener("click", stake);
unstakeButton.addEventListener("click", unstake);
claimRewardsButton.addEventListener("click", claimRewards);

// Initialize Web3 on page load
window.addEventListener("load", () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
    }
});
