// ✅ Load Ethers.js (Ensure this script is in your HTML: <script src="https://cdn.jsdelivr.net/npm/ethers@5.7.umd.min.js"></script>)

// ✅ Define the contract address (Ensure this is correct)
const contractAddress = "0x31a96047666335bf629F68796dd0fCBF46B7C8ca"; // Y2K Staking Contract Address

// ✅ ABI (Ensure this matches your contract)
const abi = [ /* Paste the full ABI here */ ];

const cronosMainnet = {
    chainId: "0x19", // Chain ID for Cronos Mainnet
    chainName: "Cronos",
    nativeCurrency: {
        name: "Cronos",
        symbol: "CRO",
        decimals: 18,
    },
    rpcUrls: ["https://evm.cronos.org"],
    blockExplorerUrls: ["https://cronoscan.com/"],
};

// Global variables
let provider, signer, contract;

// ✅ Connect Wallet Function
async function connectWallet() {
    if (!window.ethereum) {
        alert("❌ MetaMask not detected. Please install MetaMask.");
        return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);
    
    try {
        // Check if the network is Cronos, if not, request a switch
        const { chainId } = await provider.getNetwork();
        if (chainId !== parseInt(cronosMainnet.chainId, 16)) {
            await switchToCronos();
        }

        await provider.send("eth_requestAccounts", []); // Request wallet connection
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, abi, signer);

        const address = await signer.getAddress();
        document.getElementById("wallet-address").textContent = `Connected: ${address.substring(0, 6)}...${address.slice(-4)}`;

        document.getElementById("connect-wallet").style.display = "none";
        document.getElementById("disconnect-wallet").style.display = "block";

        updateStakingInfo(); // Fetch staking info after connecting
    } catch (error) {
        console.error("Wallet connection error:", error);
        alert("❌ Error connecting to wallet. Check console for details.");
    }
}

// ✅ Function to Switch to Cronos Mainnet
async function switchToCronos() {
    try {
        await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [cronosMainnet],
        });
    } catch (error) {
        console.error("Network switch error:", error);
        alert("❌ Please switch to Cronos Mainnet in MetaMask.");
    }
}

// ✅ Disconnect Wallet
function disconnectWallet() {
    document.getElementById("wallet-address").textContent = "";
    document.getElementById("connect-wallet").style.display = "block";
    document.getElementById("disconnect-wallet").style.display = "none";
}

// ✅ Stake Tokens Function
async function stakeTokens() {
    if (!contract) return alert("❌ Connect wallet first!");

    const amount = document.getElementById("stake-amount").value;
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        alert("❌ Enter a valid amount to stake.");
        return;
    }

    try {
        // Approve Y2K contract to spend tokens before staking (only needed for ERC-20 tokens)
        const y2kTokenAddress = "0xB4Df7d2A736Cc391146bB0dF4277E8F68247Ac6d"; // Y2K Token contract
        const y2kTokenAbi = [ 
            { "name": "approve", "type": "function", "inputs": [ { "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" } ], "stateMutability": "nonpayable" }
        ];

        const y2kContract = new ethers.Contract(y2kTokenAddress, y2kTokenAbi, signer);
        const approveTx = await y2kContract.approve(contractAddress, ethers.utils.parseEther(amount));
        await approveTx.wait();

        // Now stake tokens
        const tx = await contract.stake(ethers.utils.parseEther(amount));
        await tx.wait();

        alert(`✅ Successfully staked ${amount} Y2K!`);
        updateStakingInfo();
    } catch (error) {
        console.error("Staking error:", error);
        alert("❌ Error staking tokens. Check console for details.");
    }
}

// ✅ Unstake Tokens
async function unstakeTokens() {
    if (!contract) return alert("❌ Connect wallet first!");

    const amount = document.getElementById("stake-amount").value;
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        alert("❌ Enter a valid amount to unstake.");
        return;
    }

    try {
        const tx = await contract.withdraw(ethers.utils.parseEther(amount));
        await tx.wait();
        alert(`✅ Successfully unstaked ${amount} Y2K!`);
        updateStakingInfo();
    } catch (error) {
        console.error("Unstaking error:", error);
        alert("❌ Error unstaking tokens. Check console for details.");
    }
}

// ✅ Claim Staking Rewards
async function claimRewards() {
    if (!contract) return alert("❌ Connect wallet first!");

    try {
        const tx = await contract.claimRewards();
        await tx.wait();
        alert("✅ Successfully claimed rewards!");
        updateStakingInfo();
    } catch (error) {
        console.error("Claim rewards error:", error);
        alert("❌ Error claiming rewards. Check console for details.");
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
