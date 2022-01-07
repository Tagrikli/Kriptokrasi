import ActiveOrders from "./menus/ActiveOrders";
import AddOrder from "./menus/AddOrder";
import WaitingOrders from "./menus/WaitingOrders";

export default function MenuRenderer(props: { index: number }) {

    switch (props.index) {
        case 0:
            return <AddOrder></AddOrder>

        case 1:
            return <WaitingOrders></WaitingOrders>

        case 2:
            return <ActiveOrders></ActiveOrders>

        default:
            return <div></div>
    }


}