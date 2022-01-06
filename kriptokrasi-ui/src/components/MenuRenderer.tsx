import AddOrder from "./menus/AddOrder";
import WaitingOrders from "./menus/WaitingOrders";

export default function MenuRenderer(props: { index: number }) {

    switch (props.index) {
        case 0:
            return <AddOrder></AddOrder>

        case 1:
            return <WaitingOrders></WaitingOrders>

        default:
            return <div></div>
    }


}