// Web3 integration
let web3;
let stakingContract;
let y2kTokenContract;
const stakingContractAddress = '0x2A1C780f6A02B0a5Fcaa51a3110B27dc6c15E1f6';
const y2kTokenAddress = '0xB4Df7d2A736Cc391146bB0dF4277E8F68247Ac6d';

// Staking Contract ABI
const stakingABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_y2kToken", "type": "address" },
      { "internalType": "address", "name": "_pogsToken", "type": "address" },
      { "internalType": "uint256", "name": "_rewardRate", "type": "uint256" },
      { "internalType": "address", "name": "_initialOwner", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  { "inputs": [], "name": "claimReward", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "_staker", "type": "address" }], "name": "calculateReward", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "uint256", "name": "_lockPeriod", "type": "uint256" }], "name": "stake", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "unstake", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "stakes", "outputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "startTime", "type": "uint256" }, { "internalType": "uint256", "name": "lockPeriod", "type": "uint256" }], "stateMutability": "view", "type": "function" }
];

// DOM Elements
const connectWalletBtn = document.getElementById('connect-wallet');
const walletAddressElement = document.getElementById('wallet-address');
const stakeAmountInput = document.getElementById('stake-amount');
const stakeButton = document.getElementById('stake-button');
const unstakeButton = document.getElementById('unstake-button');
const claimRewardsButton = document.getElementById('claim-rewards');
const stakedAmountElement = document.getElementById('staked-amount');
const rewardsEarnedElement = document.getElementById('rewards-earned');

// Connect wallet function
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts[0];
            walletAddressElement.textContent = `Connected: ${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
            
            // Initialize contracts
            stakingContract = new web3.eth.Contract(stakingABI, stakingContractAddress);
            
            updateStakingInfo();
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            alert("Error: Unable to connect wallet. Make sure MetaMask is installed.");
        }
    } else {
        alert('Please install MetaMask to interact with the DApp.');
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

        stakedAmountElement.textContent = web3.utils.fromWei(stakeInfo.amount, 'ether');
        rewardsEarnedElement.textContent = web3.utils.fromWei(rewards, 'ether');
    } catch (error) {
        console.error('Failed to update staking info:', error);
        alert("Error: Could not fetch staking data.");
    }
}

// Stake function
async function stake() {
    if (!web3 || !stakingContract) return;
    
    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];
    const amount = web3.utils.toWei(stakeAmountInput.value, 'ether');

    try {
        // Stake Y2K tokens
        await stakingContract.methods.stake(amount, 30 * 24 * 60 * 60).send({ from: userAddress }); // Assuming 30 days lock

        alert("Staking successful!");
        updateStakingInfo();
    } catch (error) {
        console.error('Staking failed:', error);
        alert("Error: Staking transaction failed.");
    }
}

// Unstake function
async function unstake() {
    if (!web3 || !stakingContract) return;

    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];
    const amount = web3.utils.toWei(stakeAmountInput.value, 'ether'); 

    try {
        await stakingContract.methods.unstake(amount).send({ from: userAddress });
        alert("Unstaking successful!");
        updateStakingInfo();
    } catch (error) {
        console.error('Unstaking failed:', error);
        alert("Error: Unstaking transaction failed.");
    }
}

// Claim rewards function
async function claimRewards() {
    if (!web3 || !stakingContract) return;

    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];

    try {
        await stakingContract.methods.claimReward().send({ from: userAddress });
        alert("Rewards claimed successfully!");
        updateStakingInfo();
    } catch (error) {
        console.error('Claiming rewards failed:', error);
        alert("Error: Claiming rewards transaction failed.");
    }
}

// Event Listeners
connectWalletBtn.addEventListener('click', connectWallet);
stakeButton.addEventListener('click', stake);
unstakeButton.addEventListener('click', unstake);
claimRewardsButton.addEventListener('click', claimRewards);
