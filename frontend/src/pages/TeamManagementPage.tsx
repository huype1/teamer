import React, { useState, useEffect } from "react";

const TeamManagementPage: React.FC = () => {
  const [teams, setTeams] = useState("");

  useEffect(() => {
    return () => {
      return;
    };
  }, [teams]);

  return (
    <div>
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
