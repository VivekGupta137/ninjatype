import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import ProfileAvatar from "@/components/account/ProfileAvatar";
import { ProBadge } from "@/components/ui/ProBadge";
import { Hint } from "@/components/ui/InfoTip";
import { $account, refreshAccount } from "@/store/account";
import { DEFAULT_PROFILE_AVATAR, loadProfileAvatar, type ProfileAvatar as AvatarChoice } from "@/lib/profileAvatar";
import "@/styles/navbar.css";

/**
 * Signed-in profile picture for the top row, in place of the "Pro" link.
 * Pro members get the "★ PRO" pill on the picture; free members get an "Upgrade" pill below it.
 * Renders nothing until the account is known to be signed in (the server and first paint show the Pro link).
 */
export default function NavProfile({ currentPath }: { currentPath: string }) {
    const account = useStore($account);
    const userId = account.status === "in" ? account.user.id : null;
    const [avatar, setAvatar] = useState<AvatarChoice>(DEFAULT_PROFILE_AVATAR);
    useEffect(() => { if ($account.get().status === "loading") void refreshAccount(); }, []);
    useEffect(() => { if (userId) setAvatar(loadProfileAvatar(userId)); }, [userId]);
    if (account.status !== "in") return null;

    const { user, pro } = account;
    const onAccount = currentPath.startsWith("/account/");
    const label = pro ? `Your account (${user.name}, Pro)` : `Your account (${user.name})`;
    return (
        <span className="navbar-profile">
            <Hint text={user.name}>
                <a href="/account/" className="navbar-profile-link" aria-label={label} aria-current={onAccount ? "page" : undefined} data-active={onAccount}>
                    <ProfileAvatar username={user.id} style={avatar.style} variant={avatar.variant} initial={(user.name.trim()[0] || user.email[0] || "?").toUpperCase()} size={44} />
                </a>
            </Hint>
            {pro ? <ProBadge className="navbar-profile-pill" /> : <a href="/pro/" className="pro-pill navbar-profile-pill" aria-label="Upgrade to Pro">Upgrade</a>}
        </span>
    );
}
