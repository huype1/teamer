import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Team } from "@/types/team";

interface TeamCardProps {
  team: Team;
}

const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow group cursor-pointer relative h-full overflow-hidden">
      <Link to={`/teams/${team.id}`} className="block h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-2">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={team.avatarUrl || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(team.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 overflow-hidden">
              <CardTitle className="text-md group-hover:text-primary transition-colors block">
                {team.name}
              </CardTitle>
              <CardDescription className="text-sm truncate block">
                Tạo {formatDate(team.createdAt)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {team.description || "No description provided"}
          </p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span>Team</span>
            </div>
            <Badge variant="outline">
              Active
            </Badge>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default TeamCard; 