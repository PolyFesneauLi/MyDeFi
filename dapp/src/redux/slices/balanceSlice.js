/*
 * @作者: kerwin
 */
import { createSlice } from '@reduxjs/toolkit'

export const balanceSlice = createSlice({
    name: 'balance',
    initialState: {
        TokenWallet: "0",
        TokenExchange: "0",
        EtherWallet: "0",
        EtherExchange: "0",
    },
    reducers: {
        setBalance: (state, action) => {
            state.TokenWallet = action.payload.TokenWallet
            state.TokenExchange = action.payload.TokenExchange
            state.EtherWallet = action.payload.EtherWallet
            state.EtherExchange = action.payload.EtherExchange
        }
    }
})

export const { setBalance } = balanceSlice.actions

export const loadBalanceData = (web) => async dispatch => {
    try {
        const TokenWallet = await web.token.methods.balanceOf(web.account).call()
        const TokenExchange = await web.token.methods.balanceOf(web.exchange.options.address).call()
        const EtherWallet = await web.web3.eth.getBalance(web.account)
        const EtherExchange = await web.web3.eth.getBalance(web.exchange.options.address)

        dispatch(setBalance({
            TokenWallet,
            TokenExchange,
            EtherWallet,
            EtherExchange
        }))
    } catch (error) {
        console.error('加载余额数据失败:', error)
    }
}

export default balanceSlice.reducer