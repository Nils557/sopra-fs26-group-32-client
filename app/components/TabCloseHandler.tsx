"use client";                                                                                                                                                                                           
  
  import { useEffect } from "react";
  import { getApiDomain } from "@/utils/domain";

  export default function TabCloseHandler() {                                                                                                                                                                 useEffect(() => {
      const handleBeforeUnload = () => {                                                                                                                                                                  
        const userId = localStorage.getItem("userId")?.replace(/"/g, "");
        if (userId) {
          fetch(`${getApiDomain()}/users/${userId}`, {
            method: "DELETE",                                                                                                                                                                                         keepalive: true,
          });                                                                                                                                                                                             
        }
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, []);                                                                                                                                                                                                  
    return null;                                                                                                                                                                                          
  }