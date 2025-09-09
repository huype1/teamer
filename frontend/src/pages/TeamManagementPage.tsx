import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Users } from "lucide-react";
import teamService from "@/service/teamService";
import type { Team } from "@/types/team";
import { TeamCard } from "@/components/team";
import { toastSuccess, toastError } from "@/utils/toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CreateTeamDialog from "@/components/team/CreateTeamDialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";


const teamSchema = z.object({
  name: z.string().min(1, "Tên nhóm không được để trống"),
  description: z.string().min(1, "Mô tả không được để trống"),
});

type TeamFormData = z.infer<typeof teamSchema>;

const TeamManagementPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");


  const { reset } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await teamService.getTeams("");
      console.log(res.result)
      setTeams(res.result || []);
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string } } };
      toastError(error.response?.data?.message || "Tải danh sách nhóm thất bại!");
      setError(error.response?.data?.message || "Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleOpenCreate = () => {
    reset();
  };

  const onSubmit = async (data: TeamFormData) => {
    try {
      const response = await teamService.createTeam(data);
      toastSuccess("Tạo nhóm thành công!");
      reset();
      fetchTeams();
      return response; 
    } catch (e: unknown) {
      const error = e as { message?: string };
      toastError(error.message || "Tạo nhóm thất bại!");
      setError(error.message || "Failed to save team");
      throw error;
    }
  };

  if (loading && teams.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nhóm</h1>
            <p className="text-muted-foreground">
              Quản lý các nhóm và thành viên nhóm
            </p>
          </div>
        <CreateTeamDialog onSubmit={onSubmit} />
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Tìm kiếm team..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {teams.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có nhóm nào</h3>
            <p className="text-muted-foreground mb-4">
              Tạo nhóm đầu tiên để bắt đầu hợp tác và quản lý thành viên
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.filter(team => team.name.toLowerCase().includes(search.toLowerCase())).map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamManagementPage;