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
      await teamService.createTeam(data);
      toastSuccess("Tạo nhóm thành công!");
      reset();
      fetchTeams();
    } catch (e: unknown) {
      const error = e as { message?: string };
      toastError(error.message || "Tạo nhóm thất bại!");
      setError(error.message || "Failed to save team");
    }
  };

  if (loading && teams.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nhóm</h1>
            <p className="text-muted-foreground">
              Quản lý các nhóm và thành viên nhóm
            </p>
          </div>
        <CreateTeamDialog onSubmit={onSubmit} />
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Tìm kiếm team..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first team to start collaborating with others
            </p>
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Team
            </Button>
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