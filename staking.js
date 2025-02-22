const CONTRACT_ADDRESS = "0x7DC6a9900e9DE69fF36ECb7dF56aA7c9157DE483";

const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_y2kToken", "type": "address" },
      { "internalType": "address", "name": "_pogsToken", "type": "address" },
      { "internalType": "uint256", "name": "_rewardRate", "type": "uint256" },
      { "internalType": "address", "name": "_treasury", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  { "inputs": [], "name": "claimReward", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "stake", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "unstake", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "rewardRate", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "burnRate", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "lotteryEnabled", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "autoCompoundingEnabled", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "bool", "name": "_status", "type": "bool" }], "name": "toggleAutoCompounding", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "bool", "name": "_status", "type": "bool" }], "name": "toggleLottery", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_newRate", "type": "uint256" }], "name": "updateRewardRate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

// ✅ Connect Wallet
async function connectWallet() {
  try {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to use this DApp');
      return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();

    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    const address = await signer.getAddress();
    document.getElementById("wallet-address").textContent = `Connected: ${address.substring(0, 6)}...${address.substring(38)}`;

    await updateUI();
  } catch (error) {
    console.error("Error connecting wallet:", error);
    alert("Failed to connect wallet: " + error.message);
  }
}

// ✅ Fetch Staking Info
async function updateUI() {
  if (!contract) return;
  
  try {
    const address = await signer.getAddress();
    
    const stake = await contract.stakes(address);
    document.getElementById("staked-amount").textContent = ethers.utils.formatEther(stake.amount);
    
    const rewardRate = await contract.rewardRate();
    document.getElementById("reward-rate").textContent = ethers.utils.formatEther(rewardRate);

    const autoCompounding = await contract.autoCompoundingEnabled();
    document.getElementById("auto-compound-toggle").checked = autoCompounding;

  } catch (error) {
    console.error("Error updating UI:", error);
  }
}

// ✅ Stake Tokens
async function stakeTokens() {
  if (!contract) return alert("Connect wallet first!");

  const amount = document.getElementById("stake-amount").value;
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    alert("Enter a valid amount to stake.");
    return;
  }

  try {
    const tx = await contract.stake(ethers.utils.parseEther(amount));
    await tx.wait();
    alert(`✅ Successfully staked ${amount} Y2K!`);
    updateUI();
  } catch (error) {
    console.error("Staking failed:", error);
    alert("❌ Error staking tokens. Check console for details.");
  }
}

// ✅ Unstake Tokens
async function unstakeTokens() {
  if (!contract) return alert("Connect wallet first!");

  const amount = document.getElementById("stake-amount").value;
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    alert("Enter a valid amount to unstake.");
    return;
  }

  try {
    const tx = await contract.unstake(ethers.utils.parseEther(amount));
    await tx.wait();
    alert(`✅ Successfully unstaked ${amount} Y2K!`);
    updateUI();
  } catch (error) {
    console.error("Unstaking failed:", error);
    alert("❌ Error unstaking tokens. Check console for details.");
  }
}

// ✅ Claim Staking Rewards
async function claimRewards() {
  if (!contract) return alert("Connect wallet first!");

  try {
    const tx = await contract.claimReward();
    await tx.wait();
    alert("✅ Successfully claimed rewards!");
    updateUI();
  } catch (error) {
    console.error("Claiming rewards failed:", error);
    alert("❌ Error claiming rewards. Check console for details.");
  }
}

// ✅ Toggle Auto-Compounding
async function toggleAutoCompounding() {
  if (!contract) return alert("Connect wallet first!");

  try {
    const status = document.getElementById("auto-compound-toggle").checked;
    const tx = await contract.toggleAutoCompounding(status);
    await tx.wait();
    alert(`✅ Auto-Compounding is now ${status ? "Enabled" : "Disabled"}`);
    updateUI();
  } catch (error) {
    console.error("Error toggling auto-compounding:", error);
    alert("❌ Error toggling auto-compounding. Check console for details.");
  }
}

// ✅ Event Listeners
document.getElementById("connect-wallet").addEventListener("click", connectWallet);
document.getElementById("stake-button").addEventListener("click", stakeTokens);
document.getElementById("unstake-button").addEventListener("click", unstakeTokens);
document.getElementById("claim-rewards").addEventListener("click", claimRewards);
document.getElementById("auto-compound-toggle").addEventListener("change", toggleAutoCompounding);
