// Web3 integration
let web3;
let stakingContract;
let y2kTokenContract;
const stakingContractAddress = '0x2A1C780f6A02B0a5Fcaa51a3110B27dc6c15E1f6';
const y2kTokenAddress = '0xB4Df7d2A736Cc391146bB0dF4277E8F68247Ac6d';

// ABI (Application Binary Interface) for the contracts
const stakingABI = []; // Add the ABI for the staking contract here
const y2kTokenABI = []; // Add the ABI for the Y2K token contract here

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
            
            stakingContract = new web3.eth.Contract(stakingABI, stakingContractAddress);
            y2kTokenContract = new web3.eth.Contract(y2kTokenABI, y2kTokenAddress);
            
            updateStakingInfo();
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        }
    } else {
        console.log('Please install MetaMask!');
    }
}

// Update staking info
async function updateStakingInfo() {
    if (!web3 || !stakingContract) return;

    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];

    try {
        const stakedAmount = await stakingContract.methods.stakedAmount(userAddress).call();
        const rewards = await stakingContract.methods.calculateRewards(userAddress).call();

        stakedAmountElement.textContent = web3.utils.fromWei(stakedAmount, 'ether');
        rewardsEarnedElement.textContent = web3.utils.fromWei(rewards, 'ether');
    } catch (error) {
        console.error('Failed to update staking info:', error);
    }
}

// Stake function
async function stake() {
    if (!web3 || !stakingContract || !y2kTokenContract) return;

    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];
    const amount = web3.utils.toWei(stakeAmountInput.value, 'ether');

    try {
        await y2kTokenContract.methods.approve(stakingContractAddress, amount).send({ from: userAddress });
        await stakingContract.methods.stake(amount).send({ from: userAddress });
        updateStakingInfo();
    } catch (error) {
        console.error('Staking failed:', error);
    }
}

// Unstake function
async function
