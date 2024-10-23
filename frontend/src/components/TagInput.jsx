import React, { useState } from "react";
import { MdAdd, MdClose } from "react-icons/md";

const TagInput = ({ tags, setTags }) => {
  const [InputValue, SetInputValue] = useState("");

  const handleInputChange = (e) => {
    SetInputValue(e.target.value);
  };

  const addNewTag = () => {
    if (InputValue.trim() !== "") {
      setTags([...tags, InputValue.trim()]);
      SetInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      addNewTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div>
      {tags?.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mt-2">
          {tags.map((tag, index) => (
            <span key={index} className="flex items-center gap-2 text-sm text-slate-900 bg-slate-100 px-3 py-1 rounded">
              # {tag}
              <button onClick={() => handleRemoveTag(tag)}>
                <MdClose />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 mt-3">
        <input
          type="text"
          placeholder="Add a Tag"
          className="text-sm bg-transparent border px-3 py-2 rounded outline-none"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          value={InputValue}
        />
        <button
          className="w-8 h-8 flex items-center justify-center rounded border border-blue-700 hover:bg-blue-700"
          onClick={addNewTag}
        >
          <MdAdd className="text-xl text-blue-600 hover:text-white" />
        </button>
      </div>
    </div>
  );
};

export default TagInput;
