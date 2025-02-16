let web3;
let stakingContract;
const stakingContractAddress = "0x2A1C780f6A02B0a5Fcaa51a3110B27dc6c15E1f6";
const stakingABI = [
  // Staking contract ABI here
];

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

async function connectWallet() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const userAddress = accounts[0];
      walletAddressElement.textContent = `Connected: ${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;

      stakingContract = new web3.eth.Contract(stakingABI, stakingContractAddress);

      updateStakingInfo();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  } else {
    console.log("Please install MetaMask!");
  }
}

async function updateStakingInfo() {
  if (!web3 || !stakingContract) return;

  const accounts = await web3.eth.getAccounts();
  const userAddress = accounts[0];

  try {
    const stakeInfo = await stakingContract.methods.stakes(userAddress).call();
    const pendingRewards = await stakingContract.methods.calculateReward(userAddress).call();

    const stakedAmount = web3.utils.fromWei(stakeInfo.amount, "ether");
    const earnedRewards = web3.utils.fromWei(pendingRewards, "ether");

    stakedAmountElement.textContent = stakedAmount;
    rewardsEarnedElement.textContent = earnedRewards;
  } catch (error) {
    console.error("Failed to update staking info:", error);
  }
}

async function stake() {
  if (!web3 || !stakingContract) return;

  const accounts = await web3.eth.getAccounts();
  const userAddress = accounts[0];
  const amount = web3.utils.toWei(stakeAmountInput.value, "ether");
  const lockPeriod = parseInt(lockPeriodInput.value); // Ensure it's an integer

  console.log("Staking Y2K: ", amount, " Lock Period: ", lockPeriod);

  try {
    // 1️⃣ **Approve the staking contract to spend the tokens**
    console.log("Approving staking contract...");
    await stakingContract.methods.approve(stakingContractAddress, amount).send({ from: userAddress });

    // 2️⃣ **Stake the tokens after approval**
    console.log("Staking now...");
    await stakingContract.methods.stake(amount, lockPeriod).send({ from: userAddress });

    console.log("Staking successful!");
    updateStakingInfo();
  } catch (error) {
    console.error("❌ Staking failed:", error);
    alert("Staking transaction failed. Check console for details.");
  }
}

async function unstake() {
  if (!web3 || !stakingContract) return;

  const accounts = await web3.eth.getAccounts();
  const userAddress = accounts[0];

  try {
    console.log("Unstaking now...");
    await stakingContract.methods.unstake().send({ from: userAddress });

    console.log("Unstaking successful!");
    updateStakingInfo();
  } catch (error) {
    console.error("❌ Unstaking failed:", error);
    alert("Unstaking transaction failed.");
  }
}

async function claimRewards() {
  if (!web3 || !stakingContract) return;

  const accounts = await web3.eth.getAccounts();
  const userAddress = accounts[0];

  try {
    console.log("Claiming rewards...");
    await stakingContract.methods.claimReward().send({ from: userAddress });

    console.log("Rewards claimed successfully!");
    updateStakingInfo();
  } catch (error) {
    console.error("❌ Claiming rewards failed:", error);
    alert("Claiming rewards transaction failed.");
  }
}

// Event Listeners
connectWalletBtn.addEventListener("click", connectWallet);
stakeButton.addEventListener("click", stake);
unstakeButton.addEventListener("click", unstake);
claimRewardsButton.addEventListener("click", claimRewards);
