import { BASE_URL, WS_URL } from "../kriptokrasi-common/consts";
import ActiveOrders from "./menus/ActiveOrders";
import AddOrder from "./menus/AddOrder";
import WaitingOrders from "./menus/WaitingOrders";






export default function MenuRenderer(props: { index: number }) {

    const ws = new WebSocket(`ws://${WS_URL}`);



    switch (props.index) {
        case 0:
            return <AddOrder ></AddOrder>

        case 1:
            return <WaitingOrders ws={ws}></WaitingOrders>

        case 2:
            return <ActiveOrders ws={ws}></ActiveOrders>

        default:
            return <div></div>
    }


}