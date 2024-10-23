import React, { useState } from "react";
import ProfileInfo from "./ProfileInfo";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
const NavBar = ({userInfo}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");   
  const onLogOut = () => {
    localStorage.clear();
    navigate("/Login");
  };
  const handleSearch = () => {};

  const onClearSearch = () => {
    setSearch("");
  };
  return (
    <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow-sm">
      <h2 className="text-xl font-medium text-black py-2">Notes </h2>
      <SearchBar
        value={search}
        onChange={({ target }) => {
          setSearch(target.value);
        }}
        handleSearch={handleSearch}
        onClearSearch={onClearSearch}
      />
      <ProfileInfo userInfo={userInfo} onLogOut={onLogOut} />
    </div>
  );
};

export default NavBar;
