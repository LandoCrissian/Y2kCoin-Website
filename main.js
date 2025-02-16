// Web3 integration
let web3;
let stakingContract;
let y2kTokenContract;

const stakingContractAddress = "0x2A1C780f6A02B0a5Fcaa51a3110B27dc6c15E1f6";
const y2kTokenAddress = "0xB4Df7d2A736Cc391146bB0dF4277E8F68247Ac6d";

const stakingABI = [
  { inputs: [{ internalType: "address", name: "_staker", type: "address" }], name: "stakes", outputs: [{ internalType: "uint256", name: "amount", type: "uint256" }, { internalType: "uint256", name: "startTime", type: "uint256" }, { internalType: "uint256", name: "lockPeriod", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }, { internalType: "uint256", name: "_lockPeriod", type: "uint256" }], name: "stake", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }], name: "unstake", outputs: [], stateMutability: "nonpayable", type: "function" },
];

const y2kTokenABI = [
  { inputs: [{ internalType: "address", name: "spender", type: "address" }, { internalType: "uint256", name: "amount", type: "uint256" }], name: "approve", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" },
];

// DOM Elements
const connectWalletBtn = document.getElementById("connect-wallet");
const disconnectWalletBtn = document.getElementById("disconnect-wallet"); // New disconnect button
const walletAddressElement = document.getElementById("wallet-address");
const stakeAmountInput = document.getElementById("stake-amount");
const lockPeriodSelect = document.getElementById("lock-period");
const stakeButton = document.getElementById("stake-button");
const unstakeButton = document.getElementById("unstake-button");
const stakedAmountElement = document.getElementById("staked-amount");

// ✅ Connect Wallet Function
async function connectWallet() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const userAddress = accounts[0];
      walletAddressElement.textContent = `Connected: ${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;

      connectWalletBtn.style.display = "none";  // Hide Connect button
      disconnectWalletBtn.style.display = "block"; // Show Disconnect button

      stakingContract = new web3.eth.Contract(stakingABI, stakingContractAddress);
      y2kTokenContract = new web3.eth.Contract(y2kTokenABI, y2kTokenAddress);

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
function disconnectWallet() {
  web3 = null;
  walletAddressElement.textContent = "Wallet Disconnected";
  connectWalletBtn.style.display = "block";  // Show Connect button
  disconnectWalletBtn.style.display = "none"; // Hide Disconnect button
  stakedAmountElement.textContent = "0";
}

// ✅ Update Staking Info
async function updateStakingInfo() {
  if (!web3 || !stakingContract) return;

  const accounts = await web3.eth.getAccounts();
  const userAddress = accounts[0];

  try {
    const stakeInfo = await stakingContract.methods.stakes(userAddress).call();
    stakedAmountElement.textContent = web3.utils.fromWei(stakeInfo.amount, "ether");
  } catch (error) {
    console.error("Failed to update staking info:", error);
  }
}

// ✅ Stake Function
async function stake() {
  if (!web3 || !stakingContract || !y2kTokenContract) return;

  const accounts = await web3.eth.getAccounts();
  const userAddress = accounts[0];
  const amount = stakeAmountInput.value;
  const lockPeriod = parseInt(lockPeriodSelect.value);

  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    alert("Please enter a valid stake amount.");
    return;
  }

  const weiAmount = web3.utils.toWei(amount, "ether");

  try {
    await y2kTokenContract.methods.approve(stakingContractAddress, weiAmount).send({ from: userAddress });
    await stakingContract.methods.stake(weiAmount, lockPeriod).send({ from: userAddress });

    alert("✅ Staking Successful!");
    setTimeout(updateStakingInfo, 3000);
  } catch (error) {
    console.error("Staking failed:", error);
    alert("❌ Staking transaction failed. Please check your balance and try again.");
  }
}

// ✅ Unstake Function
async function unstake() {
  if (!web3 || !stakingContract) return;

  const accounts = await web3.eth.getAccounts();
  const userAddress = accounts[0];
  const amount = stakeAmountInput.value;

  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    alert("Please enter a valid amount to unstake.");
    return;
  }

  const weiAmount = web3.utils.toWei(amount, "ether");

  try {
    await stakingContract.methods.unstake(weiAmount).send({ from: userAddress });

    alert("✅ Unstaking Successful!");
    setTimeout(updateStakingInfo, 3000);
  } catch (error) {
    console.error("Unstaking failed:", error);
    alert("❌ Unstaking failed. Please check if your lock period has ended.");
  }
}

// ✅ Event Listeners
connectWalletBtn.addEventListener("click", connectWallet);
disconnectWalletBtn.addEventListener("click", disconnectWallet);
stakeButton.addEventListener("click", stake);
unstakeButton.addEventListener("click", unstake);

// ✅ Auto Fetch Data on Page Load if Wallet is Connected
window.onload = async () => {
  if (window.ethereum && window.ethereum.selectedAddress) {
    connectWallet();
  }
};
