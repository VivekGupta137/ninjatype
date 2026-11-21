import ResetButton from "../keyboard/ResetButton";
import Loader from "../common/Loader";
import type { LearnLocale } from "@/lib/learnLocale";


const BottomToolbar = ({ locale = "en" }: { locale?: LearnLocale }) => {
    return (<div id="bottom-toolbar">
        <Loader />
        <ResetButton locale={locale} />
    </div>);
}

export default BottomToolbar;