/*
 * @作者: kerwin
 */
import {useEffect} from 'react'
import {useDispatch} from 'react-redux'
import Web3 from 'web3'
import tokenjson from '../build/KerwinToken.json'
import exchangejson from '../build/Exchange.json'
import Balance from './Balance'
import Order from './Order'
import { Tabs } from 'antd'
import { loadBalanceData } from '../redux/slices/balanceSlice'
import { loadCancelOrderData,loadAllOrderData,loadFillOrderData } from '../redux/slices/orderSlice'

export default function Content() {
    const dispatch = useDispatch()
    
    useEffect(() => {
        async function start() {
            try {
                const web = await initWeb()
                console.log("Web3 initialized:", web) // 添加日志
                window.web = web
                
                dispatch(loadBalanceData(web))
                dispatch(loadCancelOrderData(web))
                dispatch(loadAllOrderData(web))
                dispatch(loadFillOrderData(web))
                
                // 监听事件
                web.exchange.events.Order({}, (error, event) => {
                    if (error) console.error("Order event error:", error)
                    dispatch(loadAllOrderData(web))
                })
                web.exchange.events.Cancel({}, (error, event) => {
                    if (error) console.error("Cancel event error:", error)
                    dispatch(loadCancelOrderData(web))
                })
                web.exchange.events.Trade({}, (error, event) => {
                    if (error) console.error("Trade event error:", error)
                    dispatch(loadFillOrderData(web))
                    dispatch(loadBalanceData(web))
                })
            } catch (error) {
                console.error("Failed to initialize Web3:", error)
            }
        }
        start()
    }, [dispatch])

    async function initWeb() {
        try {
            var web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
            
            // 请求用户授权
            let accounts = await web3.eth.requestAccounts()
            console.log("Connected account:", accounts[0])

            // 获取网络ID
            const networkId = await web3.eth.net.getId();
            console.log("Network ID:", networkId)

            // 初始化合约
            const tokenabi = tokenjson.abi
            const tokenaddress = tokenjson.networks[networkId].address
            const token = new web3.eth.Contract(tokenabi, tokenaddress);

            const exchangeabi = exchangejson.abi
            const exchangeaddress = exchangejson.networks[networkId].address
            const exchange = new web3.eth.Contract(exchangeabi, exchangeaddress);

            return {
                web3,
                account: accounts[0],
                token,
                exchange
            }
        } catch (error) {
            console.error("InitWeb error:", error)
            throw error
        }
    }

    const items = [
        {
            key: '1',
            label: 'Assets management',
            children: <Balance />,
        },
        {
            key: '2',
            label: 'Order Management',
            children: <Order />,
        },
    ];

    return (
        <div style={{padding:"20px"}}>
            <Tabs defaultActiveKey="1" items={items} />
        </div>
    )
}
