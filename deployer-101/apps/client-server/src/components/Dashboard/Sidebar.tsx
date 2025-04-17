import React from "react";
import { Home, Settings, User, Bell, BookOpen } from "lucide-react"; // You might need to install lucide-react or use another icon library

export default function Sidebar() {
  return (
    <div className="w-[70px] py-5">
      <div className="flex flex-col items-center gap-7">
        <div className="flex justify-center items-center w-10 h-10 rounded-lg cursor-pointer text-neutral-600 hover:bg-neutral-200 hover:text-black transition-all duration-200">
          <Home size={24} />
        </div>
        <div className="flex justify-center items-center w-10 h-10 rounded-lg cursor-pointer text-neutral-600 hover:bg-neutral-200 hover:text-black transition-all duration-200">
          <User size={24} />
        </div>
        <div className="flex justify-center items-center w-10 h-10 rounded-lg cursor-pointer text-neutral-600 hover:bg-neutral-200 hover:text-black transition-all duration-200">
          <Bell size={24} />
        </div>
        <div className="flex justify-center items-center w-10 h-10 rounded-lg cursor-pointer text-neutral-600 hover:bg-neutral-200 hover:text-black transition-all duration-200">
          <BookOpen size={24} />
        </div>
        <div className="flex justify-center items-center w-10 h-10 rounded-lg cursor-pointer text-neutral-600 hover:bg-neutral-200 hover:text-black transition-all duration-200">
          <Settings size={24} />
        </div>
      </div>
    </div>
  );
}
