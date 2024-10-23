import React, { useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
const SearchBar = ({ value, onChange, handleLoginSearch, onClearSearch }) => {
  return (
    <div className="w-90 flex items-center px-4 bg-slate-100 roundedd-md">
      <input
        type="text"
        placeholder="Search"
        value={value}
        onChange={onChange}
        className="w-full text-x py-[13px] "
      />
      {value && (
        <IoMdClose
          className="text-xl  text-slate-500 cursor-pointer hover:text-black mr-3"
          onClick={onClearSearch}
        />
      )}
      <FaMagnifyingGlass
        className="text-slate-400 cursor-pointer hover:text-black"
        onClick={handleLoginSearch}
      />
    </div>
  );
};

export default SearchBar;
