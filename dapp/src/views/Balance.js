/*
 * @作者: kerwin
 */
import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Card, Col, Row, Statistic, Button, Modal, Input, message, Divider, InputNumber, Space } from 'antd';
import { WalletOutlined, SwapOutlined, DollarOutlined } from '@ant-design/icons';
import { initializePayPalButton, resetPayPalButton } from '../assets/paypal-integration';

function convert(n) {
    //window.web
    if (!window.web) return
    return window.web.web3.utils.fromWei(n, "ether");
}

export default function Balance() {
    const [depositModal, setDepositModal] = useState(false);
    const [withdrawModal, setWithdrawModal] = useState(false);
    const [payPalModal, setPayPalModal] = useState(false);
    const [amount, setAmount] = useState('');
    const [kwtAmount, setKwtAmount] = useState(1);
    
    // Reference to store the exchange rate and currentAmount
    const KWT_HKD_RATE = 100; // 1 KWT = 100 HKD
    const currentKwtAmountRef = useRef(1);
    
    const {
        TokenWallet,
        TokenExchange,
        EtherWallet,
        EtherExchange,
    } = useSelector(state => state.balance)

    // Initialize PayPal when modal opens
    useEffect(() => {
        if (payPalModal) {
            console.log("PayPal modal opened, initializing button...");
            // Slight delay to ensure modal is fully rendered
            setTimeout(() => {
                initializePayPalButton(currentKwtAmountRef.current, KWT_HKD_RATE);
            }, 300);
        }
    }, [payPalModal]);

    // Function to handle KWT amount change - only store the value without re-rendering PayPal
    const handleKwtAmountChange = (value) => {
        const newAmount = value || 1; // Default to 1 if empty
        setKwtAmount(newAmount);
        currentKwtAmountRef.current = newAmount;
    };

    // Function to update PayPal button with current amount
    const updatePayPalButton = () => {
        if (payPalModal && document.getElementById('paypal-button-container')) {
            initializePayPalButton(currentKwtAmountRef.current, KWT_HKD_RATE);
        }
    };

    // Mock function for contract interaction (just for logging)
    const mintKwtTokens = (amount, transactionId) => {
        console.log(`[Contract Call] Minting ${amount} KWT tokens for transaction ${transactionId}`);
        message.success(`KWT 代币将很快添加到您的钱包中！`);
        // Here you would actually call the contract method
    };

    // Deposit function
    const handleDeposit = async () => {
        try {
            const web = window.web;
            if (!web) {
                message.error('Please connect your wallet first');
                return;
            }
            
            await web.exchange.methods.depositEther()
                .send({ 
                    from: web.account,
                    value: web.web3.utils.toWei(amount, 'ether')
                });
            
            message.success('Deposit successful');
            setDepositModal(false);
            setAmount('');
        } catch (error) {
            message.error('Deposit failed: ' + error.message);
        }
    };

    // Withdraw function
    const handleWithdraw = async () => {
        try {
            const web = window.web;
            if (!web) {
                message.error('Please connect your wallet first');
                return;
            }
            
            await web.exchange.methods.withdrawEther(
                web.web3.utils.toWei(amount, 'ether')
            ).send({ from: web.account });
            
            message.success('Withdrawal successful');
            setWithdrawModal(false);
            setAmount('');
        } catch (error) {
            message.error('Withdrawal failed: ' + error.message);
        }
    };

    return (
        <div>
            <Card title="Asset Overview" className="asset-overview">
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Card title="Wallet Assets" type="inner">
                            <Statistic
                                title="ETH Balance"
                                value={convert(EtherWallet)}
                                precision={3}
                                prefix={<WalletOutlined />}
                                suffix="ETH"
                            />
                            <Divider />
                            <Statistic
                                title="KWT Balance"
                                value={convert(TokenWallet)}
                                precision={3}
                                prefix={<DollarOutlined />}
                                suffix="KWT"
                            />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title="Exchange Assets" type="inner">
                            <Statistic
                                title="ETH Balance"
                                value={convert(EtherExchange)}
                                precision={3}
                                prefix={<SwapOutlined />}
                                suffix="ETH"
                            />
                            <Divider />
                            <Statistic
                                title="KWT Balance"
                                value={convert(TokenExchange)}
                                precision={3}
                                prefix={<SwapOutlined />}
                                suffix="KWT"
                            />
                        </Card>
                    </Col>
                </Row>
            </Card>

            <Card title="Asset Operations" style={{ marginTop: '20px' }}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Button 
                            type="primary" 
                            icon={<SwapOutlined />}
                            onClick={() => setDepositModal(true)}
                            block
                            size="large"
                        >
                            Deposit ETH
                        </Button>
                    </Col>
                    <Col span={8}>
                        <Button
                            icon={<WalletOutlined />}
                            onClick={() => setWithdrawModal(true)}
                            block
                            size="large"
                        >
                            Withdraw ETH
                        </Button>
                    </Col>
                    <Col span={8}>
                        <Button 
                            type="primary"
                            icon={<DollarOutlined />}
                            onClick={() => {
                                // Reset KWT amount when opening modal
                                setKwtAmount(1);
                                currentKwtAmountRef.current = 1;
                                setPayPalModal(true);
                            }}
                            block
                            size="large"
                            style={{ backgroundColor: '#0070ba' }}
                        >
                            Purchase KWT with HKD
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Deposit Modal */}
            <Modal
                title="Deposit ETH"
                open={depositModal}
                onOk={handleDeposit}
                onCancel={() => {
                    setDepositModal(false);
                    setAmount('');
                }}
                okText="Deposit"
                cancelText="Cancel"
            >
                <Input
                    prefix={<SwapOutlined />}
                    placeholder="Enter deposit amount (ETH)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    min="0"
                    step="0.01"
                />
            </Modal>

            {/* Withdraw Modal */}
            <Modal
                title="Withdraw ETH"
                open={withdrawModal}
                onOk={handleWithdraw}
                onCancel={() => {
                    setWithdrawModal(false);
                    setAmount('');
                }}
                okText="Withdraw"
                cancelText="Cancel"
            >
                <Input
                    prefix={<WalletOutlined />}
                    placeholder="Enter withdrawal amount (ETH)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    min="0"
                    step="0.01"
                />
            </Modal>

            {/* PayPal Payment Modal */}
            <Modal
                title="Purchase KWT with HKD"
                open={payPalModal}
                onCancel={() => {
                    resetPayPalButton(); // Reset PayPal button when closing modal
                    setPayPalModal(false);
                }}
                footer={null}
                width={500}
                destroyOnClose={true}
            >
                <div className="paypal-description">
                    <p>Purchase KWT tokens using PayPal payment in HKD.</p>
                    <p>Exchange Rate: 1 KWT = {KWT_HKD_RATE} HKD</p>
                    
                    <Space direction="vertical" style={{ width: '100%', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px', marginBottom: '10px' }}>
                            <span style={{ marginRight: '10px', minWidth: '120px' }}>KWT Amount:</span>
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0.01}
                                step={0.01}
                                precision={2}
                                value={kwtAmount}
                                onChange={handleKwtAmountChange}
                                placeholder="Enter KWT amount"
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '10px', minWidth: '120px' }}>HKD Total:</span>
                            <InputNumber
                                style={{ width: '100%' }}
                                value={(kwtAmount * KWT_HKD_RATE).toFixed(2)}
                                disabled
                                suffix="HKD"
                            />
                        </div>
                    </Space>
                </div>
                <div id="paypal-button-container" className="paypal-button-container"></div>
                <div id="result-message" style={{ marginTop: '15px', textAlign: 'center', fontWeight: 'bold' }}></div>
            </Modal>
        </div>
    );
}
