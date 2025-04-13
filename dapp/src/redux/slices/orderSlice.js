import {createSlice,createAsyncThunk} from "@reduxjs/toolkit"


const orderSlice = createSlice({
    name:"order", // type: order/set,,,
    initialState:{
        CancelOrders:[],
        FillOrders:[],
        AllOrders:[]
    },
    reducers:{
        setCancelOrders(state,action){
            state.CancelOrders = action.payload
        },
        setFillOrders(state,action){
            state.FillOrders = action.payload
        },
        setAllOrders(state,action){
            state.AllOrders = action.payload
        }
    }
})

export const {setCancelOrders,setFillOrders,setAllOrders} = orderSlice.actions

export default orderSlice.reducer;
//balanceSlice.action


export const loadCancelOrderData = (web) => async dispatch => {
    try {
        const orders = await web.exchange.methods.getCancelOrders().call()
        dispatch(setCancelOrders(orders))
    } catch (error) {
        console.error('Failed to load cancellation order：', error)
    }
}

export const loadAllOrderData = (web) => async dispatch => {
    try {
        const orders = await web.exchange.methods.getAllOrders().call()
        dispatch(setAllOrders(orders))
    } catch (error) {
        console.error('Failed to load all orders：', error)
    }
}

export const loadFillOrderData = (web) => async dispatch => {
    try {
        const orders = await web.exchange.methods.getFillOrders().call()
        dispatch(setFillOrders(orders))
    } catch (error) {
        console.error('Failed to load completion order：', error)
    }
}


