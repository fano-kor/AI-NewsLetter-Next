"use client";

import React, { useEffect } from "react";
import { FiGrid, FiCalendar, FiUser, FiFileText, FiLayout, FiLayers, FiLogIn, FiSettings } from "react-icons/fi";
import { RiAdminLine } from "react-icons/ri";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useQuery } from '@tanstack/react-query';

interface User {
  name: string;
  role: string;
  // 필요한 다른 사용자 정보 필드
}

const fetchUser = async (): Promise<User> => {
  const response = await fetch('/api/user');
  if (!response.ok) throw new Error('사용자 데이터를 불러오는데 실패했습니다.');
  return response.json();
};

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

// menuGroups 배열 수정
const menuGroups = [
  {
    name: "MENU",
    menuItems: [
      // {
      //   icon: <FiGrid className="w-5 h-5" />,
      //   label: "Dashboard",
      //   route: "#",
      //   children: [{ label: "eCommerce", route: "/" }],
      // },
      {
        icon: <FiFileText className="w-5 h-5" />,
        label: "Keyword News",
        route: "/keyword-news",
      },
      {
        icon: <FiCalendar className="w-5 h-5" />,
        label: "IT News",
        route: "/it-news",
      },
      {
        icon: <FiSettings className="w-5 h-5" />,
        label: "Settings",
        route: "/settings",
      },
      {
        icon: <RiAdminLine className="w-5 h-5" />,
        label: "Admin",
        route: "/admin",
      },
      // {
      //   icon: <FiCalendar className="w-5 h-5" />,
      //   label: "Calendar",
      //   route: "/calendar",
      // },
      // {
      //   icon: <FiUser className="w-5 h-5" />,
      //   label: "Profile",
      //   route: "/profile",
      // },
      // {
      //   icon: <FiFileText className="w-5 h-5" />,
      //   label: "Forms",
      //   route: "#",
      //   children: [
      //     { label: "Form Elements", route: "/forms/form-elements" },
      //     { label: "Form Layout", route: "/forms/form-layout" },
      //   ],
      // },
      // {
      //   icon: <FiLayout className="w-5 h-5" />,
      //   label: "Tables",
      //   route: "/tables",
      // },
      // {
      //   icon: <FiLayers className="w-5 h-5" />,
      //   label: "UI Elements",
      //   route: "#",
      //   children: [
      //     { label: "Alerts", route: "/ui/alerts" },
      //     { label: "Buttons", route: "/ui/buttons" },
      //   ],
      // },
      // {
      //   icon: <FiLogIn className="w-5 h-5" />,
      //   label: "Authentication",
      //   route: "#",
      //   children: [
      //     { label: "Sign In", route: "/auth/signin" },
      //     { label: "Sign Up", route: "/auth/signup" },
      //   ],
      // },
    ],
  },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const [pageName, setPageName] = useLocalStorage("selectedMenu", "dashboard");
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser
  });

  // Admin 사용자인지 확인하는 함수
  const isAdmin = user?.role === 'admin';

  // menuGroups를 동적으로 생성합니다
  const menuGroups = [
    {
      name: "MENU",
      menuItems: [
        {
          icon: <FiFileText className="w-5 h-5" />,
          label: "Keyword News",
          route: "/keyword-news",
        },
        {
          icon: <FiCalendar className="w-5 h-5" />,
          label: "IT News",
          route: "/it-news",
        },
        {
          icon: <FiSettings className="w-5 h-5" />,
          label: "Settings",
          route: "/settings",
        },
        // Admin 메뉴는 isAdmin이 true일 때만 포함됩니다
        ...(isAdmin ? [{
          icon: <RiAdminLine className="w-5 h-5" />,
          label: "Admin",
          route: "/admin",
        }] : []),
      ],
    },
  ];

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside
        className={`fixed left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* <!-- SIDEBAR HEADER --> */}
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
          <Link href="/" className="flex items-center space-x-4">
            <div className="flex items-center">
              <Image
                width={48}
                height={48}
                src={"/images/logo/news-96.svg"}
                alt="Logo"
                priority
              />
              <h1 className="text-white text-2xl font-bold ml-2">AI NewsBrief</h1>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            className="block lg:hidden"
          >
            <svg
              className="fill-current"
              width="20"
              height="18"
              viewBox="0 0 20 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
                fill=""
              />
            </svg>
          </button>
        </div>
        {/* <!-- SIDEBAR HEADER --> */}

        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          {/* <!-- Sidebar Menu --> */}
          <nav className="px-4 py-4 lg:px-6">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                  {group.name}
                </h3>

                <ul className="mb-6 flex flex-col gap-1.5">
                  {group.menuItems.map((menuItem, menuIndex) => (
                    <SidebarItem
                      key={menuIndex}
                      item={menuItem}
                      pageName={pageName}
                      setPageName={setPageName}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          {/* <!-- Sidebar Menu --> */}
        </div>
      </aside>
    </ClickOutside>
  );
};

export default Sidebar;
