// Web3 Integration
let web3;
let stakingContract;
let y2kTokenContract;
const stakingContractAddress = "0x2A1C780f6A02B0a5Fcaa51a3110B27dc6c15E1f6";
const y2kTokenAddress = "0xB4Df7d2A736Cc391146bB0dF4277E8F68247Ac6d";

// ABI for Staking Contract & Y2K Token
const stakingABI = [/* YOUR STAKING CONTRACT ABI HERE */];
const y2kTokenABI = [/* YOUR Y2K TOKEN ABI HERE */];

// DOM Elements
const connectWalletBtn = document.getElementById("connect-wallet");
const walletAddressElement = document.getElementById("wallet-address");
const stakeAmountInput = document.getElementById("stake-amount");
const lockPeriodSelect = document.getElementById("lock-period"); // Lock period dropdown
const stakeButton = document.getElementById("stake-button");
const unstakeButton = document.getElementById("unstake-button");
const claimRewardsButton = document.getElementById("claim-rewards");
const stakedAmountElement = document.getElementById("staked-amount");
const rewardsEarnedElement = document.getElementById("rewards-earned");

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

      updateStakingInfo(); // Fetch staked balance & rewards on connection
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  } else {
    alert("Please install MetaMask!");
  }
}

// ✅ Fetch Staked Amount & Rewards
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
    console.error("Failed to update staking info:", error);
  }
}

// ✅ Stake Function
async function stake() {
  if (!web3 || !stakingContract || !y2kTokenContract) return;

  const accounts = await web3.eth.getAccounts();
  const userAddress = accounts[0];
  const amount = web3.utils.toWei(stakeAmountInput.value, "ether");
  const lockPeriod = parseInt(lockPeriodSelect.value); // Get lock period from dropdown

  try {
    await y2kTokenContract.methods.approve(stakingContractAddress, amount).send({ from: userAddress });
    await stakingContract.methods.stake(amount, lockPeriod).send({ from: userAddress });

    alert("✅ Staking Successful!");
    updateStakingInfo(); // Refresh staked balance & rewards
  } catch (error) {
    console.error("Staking failed:", error);
    alert("❌ Staking transaction failed. Check console for details.");
  }
}

// ✅ Unstake Function
async function unstake() {
  if (!web3 || !stakingContract) return;

  const accounts = await web3.eth.getAccounts();
  const userAddress = accounts[0];

  try {
    await stakingContract.methods.unstake().send({ from: userAddress });

    alert("✅ Unstaking Successful!");
    updateStakingInfo();
  } catch (error) {
    console.error("Unstaking failed:", error);
    alert("❌ Unstaking failed. Check console for details.");
  }
}

// ✅ Claim Rewards Function
async function claimRewards() {
  if (!web3 || !stakingContract) return;

  const accounts = await web3.eth.getAccounts();
  const userAddress = accounts[0];

  try {
    await stakingContract.methods.claimReward().send({ from: userAddress });

    alert("✅ Rewards Claimed!");
    updateStakingInfo();
  } catch (error) {
    console.error("Claiming rewards failed:", error);
    alert("❌ Claiming rewards failed. Check console for details.");
  }
}

// ✅ Event Listeners
connectWalletBtn.addEventListener("click", connectWallet);
stakeButton.addEventListener("click", stake);
unstakeButton.addEventListener("click", unstake);
claimRewardsButton.addEventListener("click", claimRewards);

// ✅ Auto Fetch Data on Page Load if Wallet is Connected
window.onload = async () => {
  if (window.ethereum && window.ethereum.selectedAddress) {
    connectWallet();
  }
};
