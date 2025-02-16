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
const lockPeriodSelect = document.getElementById("lock-period");
const stakeButton = document.getElementById("stake-button");
const unstakeButton = document.getElementById("unstake-button");
const claimRewardsButton = document.getElementById("claim-rewards");
const refreshButton = document.getElementById("refresh-button");
const stakedAmountElement = document.getElementById("staked-amount");
const rewardsEarnedElement = document.getElementById("rewards-earned");

// ✅ Connect Wallet Function
async function connectWallet() {
  console.log("🔹 Connecting Wallet...");
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      web3 = new Web3(window.ethereum);
      console.log("✅ Web3 Initialized:", web3);

      const accounts = await web3.eth.getAccounts();
      const userAddress = accounts[0];
      console.log("✅ Wallet Address:", userAddress);
      walletAddressElement.textContent = `Connected: ${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;

      stakingContract = new web3.eth.Contract(stakingABI, stakingContractAddress);
      y2kTokenContract = new web3.eth.Contract(y2kTokenABI, y2kTokenAddress);
      console.log("✅ Staking Contract Loaded:", stakingContract);
      console.log("✅ Y2K Token Contract Loaded:", y2kTokenContract);

      updateStakingInfo();
    } catch (error) {
      console.error("❌ Wallet Connection Failed:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  } else {
    alert("Please install MetaMask!");
  }
}

// ✅ Fetch Staked Amount & Rewards
async function updateStakingInfo() {
  console.log("🔹 Updating Staking Info...");
  if (!web3 || !stakingContract) return;

  const accounts = await web3.eth.getAccounts();
  const userAddress = accounts[0];

  try {
    const stakeInfo = await stakingContract.methods.stakes(userAddress).call();
    const rewards = await stakingContract.methods.calculateReward(userAddress).call();
    console.log("✅ Staked Amount:", stakeInfo.amount);
    console.log("✅ Rewards Earned:", rewards);

    stakedAmountElement.textContent = web3.utils.fromWei(stakeInfo.amount, "ether");
    rewardsEarnedElement.textContent = web3.utils.fromWei(rewards, "ether");
  } catch (error) {
    console.error("❌ Failed to Fetch Staking Info:", error);
    alert("Failed to fetch staking information. Please try again.");
  }
}

// ✅ Stake Function
async function stake() {
  console.log("🔹 Staking Tokens...");
  if (!web3 || !stakingContract || !y2kTokenContract) return;

  const accounts = await web3.eth.getAccounts();
  const userAddress = accounts[0];
  const amount = stakeAmountInput.value;
  
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    alert("Please enter a valid stake amount.");
    return;
  }

  const weiAmount = web3.utils.toWei(amount, "ether");
  const lockPeriod = parseInt(lockPeriodSelect.value);

  try {
    await y2kTokenContract.methods.approve(stakingContractAddress, weiAmount).send({ from: userAddress });
    console.log("✅ Approval Successful");

    await stakingContract.methods.stake(weiAmount, lockPeriod).send({ from: userAddress });
    console.log("✅ Staking Successful");
    
    alert("✅ Staking Successful!");
    updateStakingInfo();
  } catch (error) {
    console.error("❌ Staking Failed:", error);
    alert("❌ Staking transaction failed. Please check your balance and try again.");
  }
}

// ✅ Unstake Function
async function unstake() {
  console.log("🔹 Unstaking Tokens...");
  if (!web3 || !stakingContract) return;

  const accounts = await web3.eth.getAccounts();
  const userAddress = accounts[0];

  try {
    await stakingContract.methods.unstake().send({ from: userAddress });
    console.log("✅ Unstaking Successful");

    alert("✅ Unstaking Successful!");
    updateStakingInfo();
  } catch (error) {
    console.error("❌ Unstaking Failed:", error);
    alert("❌ Unstaking failed. Please check if your lock period has ended.");
  }
}

// ✅ Claim Rewards Function
async function claimRewards() {
  console.log("🔹 Claiming Rewards...");
  if (!web3 || !stakingContract) return;

  const accounts = await web3.eth.getAccounts();
  const userAddress = accounts[0];

  try {
    await stakingContract.methods.claimReward().send({ from: userAddress });
    console.log("✅ Rewards Claimed");

    alert("✅ Rewards Claimed!");
    updateStakingInfo();
  } catch (error) {
    console.error("❌ Claiming Rewards Failed:", error);
    alert("❌ Claiming rewards failed. Please check if you have any rewards to claim.");
  }
}

// ✅ Refresh Button Function
refreshButton.addEventListener("click", updateStakingInfo);

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
