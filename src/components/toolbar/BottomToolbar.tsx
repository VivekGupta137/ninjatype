import ResetButton from "../keyboard/ResetButton";
import Loader from "../common/Loader";


const BottomToolbar = () => {
    return (<div id="bottom-toolbar">
        <Loader />
        <ResetButton />
    </div>);
}

export default BottomToolbar;