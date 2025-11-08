import { $isMounted } from "@/store/config";
import { useEffect } from "react";

const ReactLoaded = () => {
    useEffect(() => {
        $isMounted.set(true);
    }, []);
    return (<></>);
}

export default ReactLoaded;