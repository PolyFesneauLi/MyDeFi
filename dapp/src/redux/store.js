import {configureStore} from '@reduxjs/toolkit'
import balanceReducer from './slices/balanceSlice'
import orderReducer from './slices/orderSlice'

const store = configureStore({
    reducer:{
        //余额reducer
        balance:balanceReducer,
        order:orderReducer
        //订单reducer
    },
    middleware:getDefaultMiddleware => getDefaultMiddleware({
        serializableCheck:false
    })
    // middleware: ...
})

export default store