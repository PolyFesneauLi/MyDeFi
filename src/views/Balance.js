/*
 * @作者: kerwin
 */
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Card, Col, Row, Statistic, Button, Modal, Input, message, Divider } from 'antd';
import { WalletOutlined, SwapOutlined, DollarOutlined } from '@ant-design/icons';

function convert(n) {
    //window.web
    if (!window.web) return
    return window.web.web3.utils.fromWei(n, "ether");
}

export default function Balance() {
    const [depositModal, setDepositModal] = useState(false);
    const [withdrawModal, setWithdrawModal] = useState(false);
    const [amount, setAmount] = useState('');
    
    const {
        TokenWallet,
        TokenExchange,
        EtherWallet,
        EtherExchange,
    } = useSelector(state => state.balance)

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
                    <Col span={12}>
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
                    <Col span={12}>
                        <Button
                            icon={<WalletOutlined />}
                            onClick={() => setWithdrawModal(true)}
                            block
                            size="large"
                        >
                            Withdraw ETH
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
        </div>
    );
}
