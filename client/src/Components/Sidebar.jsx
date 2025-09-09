import { useEffect, useState } from "react";
import axios from "axios";

const Sidebar = ({ currentUserId, onSelect }) => {
  const [friends, setFriends] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState("");

  const fetchFriends = () => {
    axios
      .get(`http://localhost:3000/friends/${currentUserId}`)
      .then((res) => setFriends(res.data));
  };

  useEffect(() => {
    if (currentUserId) fetchFriends();
  }, [currentUserId]);

  const handleAddFriend = () => {
    setError("");
    axios
      .post("http://localhost:3000/add-friend", {
        userId: currentUserId,
        friendEmail: emailInput,
      })
      .then(() => {
        setEmailInput("");
        fetchFriends();
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Error adding friend");
      });
  };

  return (
    <div className="w-72 bg-black border-r p-4 shadow-md">
      <h2 className="text-xl font-semibold mb-3">Friends</h2>
      <input
        type="email"
        value={emailInput}
        onChange={(e) => setEmailInput(e.target.value)}
        placeholder="Add friend by email"
        className="w-full border rounded px-3 py-2 mb-2 text-sm"
      />
      <button
        onClick={handleAddFriend}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm"
      >
        Add Friend
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <div className="mt-4 max-h-[60vh] overflow-y-auto divide-y">
        {friends.map((friend) => (
          <div
            key={friend.userId}
            onClick={() => onSelect(friend)}
            className="py-2 px-2 hover:bg-gray-100 cursor-pointer text-sm"
          >
            {friend.email}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
