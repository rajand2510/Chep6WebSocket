    import { UserButton, useUser } from "@clerk/clerk-react";

    const Navbar = () => {
    const { user } = useUser();

    return (
        <div className="flex justify-between items-center p-4 bg-gray-100 shadow">
        <div className="text-lg font-bold">Realtime Chat</div>
        <div className="flex items-center gap-2">
            <span>{user?.emailAddresses[0]?.emailAddress}</span>
            <UserButton />
        </div>
        </div>
    );
    };

    export default Navbar;
