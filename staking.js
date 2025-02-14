import React, { useState } from 'react';
import { Button, Input, VStack, HStack, useToast, Text } from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { stakingContractAddress, stakingContractABI, stakingTokenAddress, stakingTokenABI } from '../config';

function StakingActions() {
  const { active, library, account } = useWeb3React();
  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function stake() {
    if (!active || !library || !account) return;
    
    try {
      setLoading(true);
      const stakingToken = new ethers.Contract(stakingTokenAddress, stakingTokenABI, library.getSigner());
      const stakingContract = new ethers.Contract(stakingContractAddress, stakingContractABI, library.getSigner());
      
      const amount = ethers.utils.parseEther(stakeAmount);

      // ✅ FIX: Ensure approval transaction is awaited
      const approvalTx = await stakingToken.approve(stakingContractAddress, amount);
      await approvalTx.wait(); // Wait for approval confirmation
      
      const tx = await stakingContract.stake(amount);
      await tx.wait(); // Wait for transaction to be confirmed

      toast({
        title: 'Staking successful',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setStakeAmount('');
    } catch (error) {
      console.error('Staking error:', error);
      toast({
        title: 'Staking failed',
        description: error.reason || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  async function withdraw() {
    if (!active || !library || !account) return;
    
    try {
      setLoading(true);
      const stakingContract = new ethers.Contract(stakingContractAddress, stakingContractABI, library.getSigner());

      const amount = ethers.utils.parseEther(withdrawAmount);

      // ✅ FIX: Use `unstake()` instead of `withdraw()`
      const tx = await stakingContract.unstake(amount);
      await tx.wait(); // Wait for transaction confirmation

      toast({
        title: 'Unstaking successful',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setWithdrawAmount('');
    } catch (error) {
      console.error('Unstaking error:', error);
      toast({
        title: 'Unstaking failed',
        description: error.reason || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  async function claimReward() {
    if (!active || !library || !account) return;
    
    try {
      setLoading(true);
      const stakingContract = new ethers.Contract(stakingContractAddress, stakingContractABI, library.getSigner());
      
      const tx = await stakingContract.claimReward();
      await tx.wait(); // Wait for confirmation

      toast({
        title: 'Rewards claimed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Claim reward error:', error);
      toast({
        title: 'Claim reward failed',
        description: error.reason || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  if (!active) {
    return null;
  }

  return (
    <VStack spacing={4} align="stretch">
      <Text fontWeight="bold">Staking Actions</Text>
      <HStack>
        <Input
          placeholder="Amount to stake"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
        />
        <Button onClick={stake} isLoading={loading} loadingText="Staking">Stake</Button>
      </HStack>
      <HStack>
        <Input
          placeholder="Amount to unstake"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
        />
        <Button onClick={withdraw} isLoading={loading} loadingText="Unstaking">Unstake</Button>
      </HStack>
      <Button onClick={claimReward} isLoading={loading} loadingText="Claiming">Claim Reward</Button>
    </VStack>
  );
}

export default StakingActions;
