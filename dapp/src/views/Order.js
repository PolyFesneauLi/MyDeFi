import React, { useState } from 'react'
import { Card, Col, Button, Row, Table, Modal, Form, Input, message, Select } from 'antd';
import { useSelector } from 'react-redux'
import moment from 'moment'
import { PlusOutlined, SwapOutlined, DollarOutlined } from '@ant-design/icons';

function converTime(t) {
    return moment(t * 1000).format("YYYY/MM/DD")
}

function convert(n) {
    if (!window.web || !n) return "0"
    return window.web.web3.utils.fromWei(n, "ether");
}

function getRenderOrder(order, type) {
    if (!window.web) return []

    const account = window.web.account
    // 1. 排除 已经完成以及 取消订单
    let filterIds = [...order.CancelOrders, ...order.FillOrders].map(item => item.id)
    let pendingOrders = order.AllOrders.filter(item => !filterIds.includes(item.id))
    if (type === 1) {
        return pendingOrders.filter(item => item.user === account)
    } else {
        return pendingOrders.filter(item => item.user !== account)
    }
}

export default function Order() {
    const [createOrderModal, setCreateOrderModal] = useState(false);
    const [form] = Form.useForm();
    const [tokenPair, setTokenPair] = useState({
        requireToken: 'KWT',
        payToken: 'ETH'
    });
    const order = useSelector(state => state.order)
    const balance = useSelector(state => state.balance)

    // 创建订单
    const handleCreateOrder = async (values) => {
        try {
            const web = window.web;
            if (!web) {
                message.error('Connect Wallet');
                return;
            }

            // 根据选择的币种确定参数
            const amountRequire = tokenPair.requireToken === 'KWT'
                ? values.amountKWTrequire.toString()
                : values.amountETHrequire.toString();
            const amountPay = tokenPair.payToken === 'ETH'
                ? values.amountETHpay.toString()
                : values.amountKWTpay.toString();

            // 检查余额
            const balanceToCheck = tokenPair.payToken === 'ETH' ? balance.EtherWallet : balance.TokenWallet;
            const currentBalance = convert(balanceToCheck);
            if (parseFloat(amountPay) > parseFloat(currentBalance)) {
                message.error(`${tokenPair.payToken} balance is insufficient.`);
                return;
            }

            // 创建订单
            await web.exchange.methods.makeOrder(
                tokenPair.requireToken === 'KWT' ? web.token.options.address : '0x0000000000000000000000000000000000000000',
                web.web3.utils.toWei(amountRequire, 'ether'),
                web.web3.utils.toWei(amountPay, 'ether')
            ).send({ from: web.account });

            message.success('Order created successfully');
            setCreateOrderModal(false);
            form.resetFields();
        } catch (error) {
            message.error('Failed to create order: ' + error.message);
        }
    };

    const columns = [
        {
            title: 'Time',
            dataIndex: 'timestamp',
            render: (timestamp) => <div>{converTime(timestamp)}</div>
        },
        {
            title: 'KWT',
            dataIndex: 'amountGet',
            render: (amountGet) => <b>{convert(amountGet)}</b>
        },
        {
            title: 'ETH',
            dataIndex: 'amountGive',
            render: (amountGive) => <b>{convert(amountGive)}</b>
        },
    ];

    const columns1 = [
        ...columns,
        {
            title: 'Operate',
            render: (item) => <Button type="primary" onClick={() => {
                const { exchange, account } = window.web
                exchange.methods
                    .cancelOrder(item.id)
                    .send({ from: account })
            }}>cancel</Button>
        },
    ];
    const columns2 = [
        ...columns,
        {
            title: 'Operate',
            render: (item) => <Button danger onClick={() => {
                const { exchange, account } = window.web
                exchange.methods
                    .fillOrder(item.id)
                    .send({ from: account })
            }}>买入</Button>
        },
    ];

    return (
        <div style={{ marginTop: "10px" }}>
            <Row >
                <Col span={8}>
                    <Card title="Completed transactions" bordered={false} style={{ margin: 10 }}>
                        <Table dataSource={order.FillOrders} columns={columns} rowKey={item => item.id} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="In Trades - Orders I Created" bordered={false} style={{
                        margin: 10
                    }}>
                        <Table dataSource={getRenderOrder(order, 1)} columns={columns1} rowKey={item => item.id} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="Trading - other people's orders" bordered={false} style={{
                        margin: 10
                    }}>
                        <Table dataSource={getRenderOrder(order, 2)} columns={columns2} rowKey={item => item.id} />
                    </Card>
                </Col>
            </Row>

            <Card title="Trading centre" bordered={false}>
                {/* 创建订单按钮 */}
                <Row style={{ marginBottom: 20 }}>
                    <Col span={24}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setCreateOrderModal(true)}
                            size="large"
                        >
                            Create New Order
                        </Button>
                    </Col>
                </Row>

                {/* 订单列表 */}
                <Table
                    dataSource={order.AllOrders}
                    columns={[
                        {
                            title: 'Time',
                            dataIndex: 'timestamp',
                            render: (timestamp) => moment(timestamp * 1000).format('YYYY/MM/DD HH:mm')
                        },
                        {
                            title: 'KWT Amount',
                            dataIndex: 'amountGet',
                            render: (amount) => `${convert(amount)} KWT`
                        },
                        {
                            title: 'ETH Amount',
                            dataIndex: 'amountGive',
                            render: (amount) => `${convert(amount)} ETH`
                        },
                        {
                            title: 'State',
                            render: (record) => {
                                const isCancelled = order.CancelOrders.find(o => o.id === record.id);
                                const isFilled = order.FillOrders.find(o => o.id === record.id);
                                if (isCancelled) return <span style={{ color: 'red' }}>cancelled</span>;
                                if (isFilled) return <span style={{ color: 'green' }}>cancelled</span>;
                                return <span style={{ color: 'blue' }}>Processing</span>;
                            }
                        }
                    ]}
                />
            </Card>

            {/* 创建订单模态框 */}
            <Modal
                title="Create New Order"
                open={createOrderModal}
                onOk={() => form.submit()}
                onCancel={() => {
                    setCreateOrderModal(false);
                    form.resetFields();
                }}
                okText="Create an order"
                cancelText="Cancel"
            >
                <Form
                    form={form}
                    onFinish={handleCreateOrder}
                    layout="vertical"
                >
                    <Form.Item label="Token Pair">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Select
                                    value={tokenPair.requireToken}
                                    onChange={(value) => setTokenPair({ ...tokenPair, requireToken: value })}
                                    style={{ width: '100%' }}
                                >
                                    <Select.Option value="KWT">KWT</Select.Option>
                                    <Select.Option value="ETH">ETH</Select.Option>
                                </Select>
                            </Col>
                            <Col span={12}>
                                <Select
                                    value={tokenPair.payToken}
                                    onChange={(value) => setTokenPair({ ...tokenPair, payToken: value })}
                                    style={{ width: '100%' }}
                                >
                                    <Select.Option value="KWT">KWT</Select.Option>
                                    <Select.Option value="ETH">ETH</Select.Option>
                                </Select>
                            </Col>
                        </Row>
                    </Form.Item>

                    <Form.Item
                        name={tokenPair.requireToken === 'KWT' ? 'amountKWTrequire' : 'amountETHrequire'}
                        label={`Amount of ${tokenPair.requireToken} required`}
                        rules={[
                            { required: true, message: `Please enter the amount of ${tokenPair.requireToken} required` },
                            () => ({
                                validator(_, value) {
                                    if (value && parseFloat(value) > 0) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Quantity must be greater than 0'));
                                },
                            }),
                        ]}
                    >
                        <Input
                            prefix={<SwapOutlined />}
                            type="number"
                            placeholder={`Input ${tokenPair.requireToken} amount`}
                            min="0"
                            step={tokenPair.requireToken === 'KWT' ? "0.1" : "0.01"}
                        />
                    </Form.Item>

                    <Form.Item
                        name={tokenPair.payToken === 'ETH' ? 'amountETHpay' : 'amountKWTpay'}
                        label={`Amount of ${tokenPair.payToken} to pay`}
                        rules={[
                            { required: true, message: `Please enter the amount of ${tokenPair.payToken} to pay` },
                            () => ({
                                validator(_, value) {
                                    if (value && parseFloat(value) > 0) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Quantity must be greater than 0'));
                                },
                            }),
                        ]}
                        extra={`Current ${tokenPair.payToken} Balance: ${convert(tokenPair.payToken === 'ETH' ? balance.EtherWallet : balance.TokenWallet)} ${tokenPair.payToken}`}
                    >
                        <Input
                            prefix={<DollarOutlined />}
                            type="number"
                            placeholder={`Enter the amount of ${tokenPair.payToken}`}
                            min="0"
                            step={tokenPair.payToken === 'ETH' ? "0.01" : "0.1"}
                        />
                    </Form.Item>

                    <div style={{ marginTop: 16 }}>
                        <p>说明：</p>
                        <ul>
                            <li>Creating an order will lock the amount of {tokenPair.payToken} you enter</li>
                            <li>Orders can be cancelled at any time after creation</li>
                            <li>Other users can use {tokenPair.requireToken} to purchase your order</li>
                        </ul>
                    </div>
                </Form>
            </Modal>
        </div>
    )
}
