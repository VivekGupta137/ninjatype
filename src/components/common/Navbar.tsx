import { Link } from "@heroui/react";
import { Globe2, GraduationCap, HistoryIcon, Settings2 } from "lucide-react";
import React from "react";

const Navbar = () => {
    return (
        <div className="flex gap-2 flex-wrap">
            <Link href="/online/">
                <Link.Icon className="size-5 mr-1">
                    <Globe2 />
                </Link.Icon>
                Online
            </Link>
            <Link href="/learn/">
                <Link.Icon className="size-5 mr-1">
                    <GraduationCap />
                </Link.Icon>
                Learn
            </Link>
            <Link href="/history/">
                <Link.Icon className="size-5 mr-1">
                    <HistoryIcon />
                </Link.Icon>
                History
            </Link>
            <Link href="/settings/">
                <Link.Icon className="size-5 mr-1">
                    <Settings2 />
                </Link.Icon>
                Settings
            </Link>
        </div>
    );
};

export default Navbar;
