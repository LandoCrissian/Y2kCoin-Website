    <!-- JavaScript -->
    <script>
        // Contract Constants
        const CONTRACT_ADDRESS = "0x7DC6a9900e9DE69fF36ECb7dF56aA7c9157DE483";
        const CRONOS_NETWORK_CONFIG = {
            chainId: '0x19',
            chainName: 'Cronos Mainnet',
            nativeCurrency: {
                name: 'CRO',
                symbol: 'CRO',
                decimals: 18
            },
            rpcUrls: ['https://evm.cronos.org'],
            blockExplorerUrls: ['https://cronoscan.com/']
        };

        // Global state
        let contract;
        let signer;
        let provider;
        let isConnecting = false;

        // Enhanced wallet connection
        async function connectWallet() {
            if (isConnecting) return;
            isConnecting = true;

            try {
                // Check for multiple wallet providers
                const web3Provider = window.ethereum || window.onchain || window.coinbase;
                if (!web3Provider) {
                    alert('Please install MetaMask or use OnChain wallet');
                    return;
                }

                const connectButton = document.getElementById("connect-wallet");
                connectButton.textContent = 'Connecting...';
                
                provider = new ethers.providers.Web3Provider(web3Provider);
                await provider.send("eth_requestAccounts", []);
                
                // Check and switch network
                const network = await provider.getNetwork();
                if (network.chainId !== 25) {
                    await switchToCronosNetwork();
                }
                
                signer = provider.getSigner();
                contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
                
                const address = await signer.getAddress();
                
                // Update UI
                document.getElementById("wallet-address").textContent = 
                    `${address.substring(0, 6)}...${address.substring(38)}`;
                document.getElementById("network-name").textContent = "Cronos";
                document.getElementById("network-info").classList.remove('hidden');
                document.getElementById("connect-wallet").classList.add('hidden');
                document.getElementById("disconnect-wallet").classList.remove('hidden');
                document.getElementById("staking-interface").classList.remove('hidden');
                
                await updateUI();
                setupEventListeners();
                
                showStatus("Wallet connected successfully!", "success");
            } catch (error) {
                console.error("Connection error:", error);
                showError(error.message || "Failed to connect wallet");
            } finally {
                isConnecting = false;
                document.getElementById("connect-wallet").textContent = 'Connect Wallet';
            }
        }

        // Enhanced network switching
        async function switchToCronosNetwork() {
            const web3Provider = window.ethereum || window.onchain || window.coinbase;
            try {
                await web3Provider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x19' }],
                });
                return true;
            } catch (switchError) {
                if (switchError.code === 4902) {
                    try {
                        await web3Provider.request({
                            method: 'wallet_addEthereumChain',
                            params: [CRONOS_NETWORK_CONFIG]
                        });
                        return true;
                    } catch (addError) {
                        showError('Failed to add Cronos network. Please add it manually.');
                        return false;
                    }
                }
                showError('Please switch to Cronos network');
                return false;
            }
        }

        // Enhanced UI updates
        async function updateUI() {
            if (!contract || !signer) return;

            try {
                const address = await signer.getAddress();
                
                // Get stake info
                const stakeInfo = await contract.stakes(address);
                document.getElementById("staked-amount").textContent = 
                    ethers.utils.formatEther(stakeInfo.amount);
                
                // Update staking time if applicable
                if (stakeInfo.startTime.gt(0)) {
                    const stakingDate = new Date(stakeInfo.startTime.mul(1000).toNumber());
                    document.getElementById("staking-time").textContent = stakingDate.toLocaleDateString();
                    
                    // Calculate and show next unlock time
                    const lockPeriod = await contract.LOCK_PERIOD();
                    const unlockDate = new Date((stakeInfo.startTime.add(lockPeriod)).mul(1000).toNumber());
                    document.getElementById("next-unlock").textContent = unlockDate.toLocaleDateString();
                }

                // Get token contracts
                const y2kTokenAddress = await contract.y2kToken();
                const pogsTokenAddress = await contract.pogsToken();
                
                const y2kToken = new ethers.Contract(
                    y2kTokenAddress,
                    ["function balanceOf(address) view returns (uint256)"],
                    signer
                );
                const pogsToken = new ethers.Contract(
                    pogsTokenAddress,
                    ["function balanceOf(address) view returns (uint256)"],
                    signer
                );

                // Get balances
                const [y2kBalance, pogsBalance, referralRewards, burnRate, rewardRate] = await Promise.all([
                    y2kToken.balanceOf(address),
                    pogsToken.balanceOf(address),
                    contract.referralRewards(address),
                    contract.burnRate(),
                    contract.rewardRate()
                ]);

                // Update UI elements
                document.getElementById("y2k-balance").textContent = ethers.utils.formatEther(y2kBalance);
                document.getElementById("pogs-balance").textContent = ethers.utils.formatEther(pogsBalance);
                document.getElementById("referral-rewards").textContent = ethers.utils.formatEther(referralRewards);
                document.getElementById("burn-rate").textContent = burnRate.toString() + "%";
                
                // Calculate and display APR
                const apr = (rewardRate.mul(365).mul(100)).toString();
                document.getElementById("current-apr").textContent = `${apr}%`;

            } catch (error) {
                console.error("Error updating UI:", error);
                showError("Failed to update information");
            }
        }

        // Enhanced staking functions
        async function approveTokens() {
            if (!contract || !signer) return;
            
            try {
                const amount = document.getElementById("stake-amount").value;
                if (!amount || amount <= 0) {
                    showError("Please enter a valid amount");
                    return;
                }

                const amountWei = ethers.utils.parseEther(amount);
                const y2kTokenAddress = await contract.y2kToken();
                
                const y2kToken = new ethers.Contract(
                    y2kTokenAddress,
                    ["function approve(address spender, uint256 amount) public returns (bool)"],
                    signer
                );
                
                showStatus("Approving tokens...");
                const tx = await y2kToken.approve(CONTRACT_ADDRESS, amountWei);
                await tx.wait();
                showStatus("Tokens approved successfully!", "success");
            } catch (error) {
                console.error("Approval error:", error);
                showError(error.message || "Failed to approve tokens");
            }
        }

        async function stake() {
            if (!contract || !signer) return;
            
            try {
                const amount = document.getElementById("stake-amount").value;
                if (!amount || amount <= 0) {
                    showError("Please enter a valid amount");
                    return;
                }

                const referralAddress = document.getElementById("referral-address").value;
                const amountWei = ethers.utils.parseEther(amount);
                
                showStatus("Staking tokens...");
                const tx = await contract.stake(
                    amountWei,
                    referralAddress || ethers.constants.AddressZero
                );
                await tx.wait();
                showStatus("Tokens staked successfully!", "success");
                await updateUI();
            } catch (error) {
                console.error("Staking error:", error);
                showError(error.message || "Failed to stake tokens");
            }
        }

        async function unstake() {
            if (!contract || !signer) return;
            
            try {
                const amount = document.getElementById("stake-amount").value;
                if (!amount || amount <= 0) {
                    showError("Please enter a valid amount");
                    return;
                }

                const amountWei = ethers.utils.parseEther(amount);
                
                showStatus("Unstaking tokens...");
                const tx = await contract.unstake(amountWei);
                await tx.wait();
                showStatus("Tokens unstaked successfully!", "success");
                await updateUI();
            } catch (error) {
                console.error("Unstaking error:", error);
                showError(error.message || "Failed to unstake tokens");
            }
        }

        async function claimRewards() {
            if (!contract || !signer) return;
            
            try {
                showStatus("Claiming rewards...");
                const tx = await contract.claimReward();
                await tx.wait();
                showStatus("Rewards claimed successfully!", "success");
                await updateUI();
            } catch (error) {
                console.error("Claim error:", error);
                showError(error.message || "Failed to claim rewards");
            }
        }

        // Enhanced status messages
        function showStatus(message, type = 'info') {
            const statusEl = document.getElementById("tx-status");
            const messageEl = document.getElementById("tx-message");
            
            messageEl.textContent = message;
            statusEl.classList.remove('hidden');
            
            // Add color based on type
            messageEl.className = type === 'error' ? 'text-red-400' : 
                                type === 'success' ? 'text-green-400' : 
                                'text-cyan-400';

            setTimeout(() => {
                statusEl.classList.add('hidden');
            }, 5000);
        }

        function showError(message) {
            showStatus(message, 'error');
        }

        // Setup event listeners
        function setupEventListeners() {
            document.getElementById("stake-button").addEventListener("click", stake);
            document.getElementById("unstake-button").addEventListener("click", unstake);
            document.getElementById("claim-rewards").addEventListener("click", claimRewards);
            document.getElementById("approve-button").addEventListener("click", approveTokens);
            
            // MAX button functionality
            document.getElementById("max-button").addEventListener("click", async () => {
                if (!contract || !signer) return;
                
                try {
                    const y2kTokenAddress = await contract.y2kToken();
                    const y2kToken = new ethers.Contract(
                        y2kTokenAddress,
                        ["function balanceOf(address) view returns (uint256)"],
                        signer
                    );
                    
                    const balance = await y2kToken.balanceOf(await signer.getAddress());
                    document.getElementById("stake-amount").value = ethers.utils.formatEther(balance);
                } catch (error) {
                    console.error("Error setting max amount:", error);
                    showError("Failed to set maximum amount");
                }
            });
        }

        // Initialize wallet connection
        document.getElementById("connect-wallet")?.addEventListener("click", connectWallet);

        // Update UI periodically if wallet is connected
        setInterval(() => {
            if (contract && signer) {
                updateUI();
            }
        }, 30000);
    </script>
