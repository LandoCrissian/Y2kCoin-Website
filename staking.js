// Import Ethers.js (Include in your HTML: <script src="https://cdn.jsdelivr.net/npm/ethers@5.7.umd.min.js"></script>)
const contractAddress = "0x31a96047666335bf629F68796dd0fCBF46B7C8ca"; // Your staking contract address
const abi = [ 
    // Replace with your actual ABI
    {
        "inputs": [{"internalType": "uint256","name": "amount","type": "uint256"}],
        "name": "stake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256","name": "amount","type": "uint256"}],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "claimRewards",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address","name": "account","type": "address"}],
        "name": "getStakeInfo",
        "outputs": [{"internalType": "uint256","name": "staked","type": "uint256"},
                    {"internalType": "uint256","name": "rewards","type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

let provider, signer, contract;

// ✅ Connect Wallet
async function connectWallet() {
    if (!window.ethereum) {
        alert("MetaMask not detected. Please install MetaMask.");
        return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);

    const address = await signer.getAddress();
    document.getElementById("wallet-address").textContent = `Connected: ${address.substring(0, 6)}...${address.slice(-4)}`;

    document.getElementById("connect-wallet").style.display = "none";
    document.getElementById("disconnect-wallet").style.display = "block";

    updateStakingInfo();
}

// ✅ Disconnect Wallet
async function disconnectWallet() {
    document.getElementById("wallet-address").textContent = "";
    document.getElementById("connect-wallet").style.display = "block";
    document.getElementById("disconnect-wallet").style.display = "none";
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
        updateStakingInfo();
    } catch (error) {
        console.error("Staking failed:", error);
        alert("❌ Error staking tokens.");
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
        const tx = await contract.withdraw(ethers.utils.parseEther(amount));
        await tx.wait();
        alert(`✅ Successfully unstaked ${amount} Y2K!`);
        updateStakingInfo();
    } catch (error) {
        console.error("Unstaking failed:", error);
        alert("❌ Error unstaking tokens.");
    }
}

// ✅ Claim Staking Rewards
async function claimRewards() {
    if (!contract) return alert("Connect wallet first!");

    try {
        const tx = await contract.claimRewards();
        await tx.wait();
        alert("✅ Successfully claimed rewards!");
        updateStakingInfo();
    } catch (error) {
        console.error("Claiming rewards failed:", error);
        alert("❌ Error claiming rewards.");
    }
}

// ✅ Fetch Staking Info
async function updateStakingInfo() {
    if (!contract) return;

    try {
        const address = await signer.getAddress();
        const [staked, rewards] = await contract.getStakeInfo(address);

        document.getElementById("staked-amount").textContent = ethers.utils.formatEther(staked);
        document.getElementById("rewards-earned").textContent = ethers.utils.formatEther(rewards);
    } catch (error) {
        console.error("Failed to fetch staking info:", error);
    }
}

// ✅ Event Listeners
document.getElementById("connect-wallet").addEventListener("click", connectWallet);
document.getElementById("disconnect-wallet").addEventListener("click", disconnectWallet);
document.getElementById("stake-button").addEventListener("click", stakeTokens);
document.getElementById("unstake-button").addEventListener("click", unstakeTokens);
document.getElementById("claim-rewards").addEventListener("click", claimRewards);
