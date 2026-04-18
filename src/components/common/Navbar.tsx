import { Link } from "@heroui/react";
import { Globe2, GraduationCap, HistoryIcon, Settings2 } from "lucide-react";
import React from "react";

const Navbar = () => {
    return (
        <div className="flex gap-2">
            <Link
                href="/online/"
                render={(props) => <span {...props} data-custom="foo" />}
            >
                <Link.Icon className="size-5 mr-1">
                    <Globe2 />
                </Link.Icon>
                Online
            </Link>
            <Link
                href="/learn/"
                render={(props) => <span {...props} data-custom="foo" />}
            >
                <Link.Icon className="size-5 mr-1">
                    <GraduationCap />
                </Link.Icon>
                Learn
            </Link>
            <Link
                href="/history/"
                render={(props) => <span {...props} data-custom="foo" />}
            >
                <Link.Icon className="size-5 mr-1">
                    <HistoryIcon />
                </Link.Icon>
                History
            </Link>
            <Link
                href="/settings/"
                render={(props) => <span {...props} data-custom="foo" />}
            >
                <Link.Icon className="size-5 mr-1">
                    <Settings2 />
                </Link.Icon>
                Settings
            </Link>
        </div>
    );
};

export default Navbar;
