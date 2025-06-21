import React, { useState, useEffect } from "react";
import {Button} from "@/components/ui/button.tsx";
import { useDispatch } from "react-redux";
import {logout} from "@/store/authReducer.ts";

const TeamManagementPage: React.FC = () => {
  const [teams, setTeams] = useState("");
  const dispatch = useDispatch();
    const handleLogout = () => {
        dispatch(logout())
          .unwrap()
          .then(() => {
            window.location.href = "/";
          });
    };

  useEffect(() => {
    return () => {
      return;
    };
  }, [teams]);

  return (
    <div>
      <Button onClick={handleLogout}>Logout</Button>
      <h1>Protected content for user</h1>
      <p>{teams}</p>
      {/* <ul> */}
      {/*   {teams.map((t: string) => ( */}
      {/*     <li>t</li> */}
      {/*   ))} */}
      {/* </ul> */}
    </div>
  );
};

export default TeamManagementPage;