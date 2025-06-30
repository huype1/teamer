import { Button } from "@/components/ui/button";
import { ArrowRight, BotMessageSquare, GanttChartSquare, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "@/components/nav/top-nav";
import { useDispatch } from "react-redux";
import { logout } from "@/store/authReducer";
import type { AppDispatch } from "@/store";

const useAppDispatch: () => AppDispatch = useDispatch;

const LandingPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopNav variant="simple" onLogout={handleLogout} />

      <main className="flex-1 flex flex-col items-center justify-center">
        <section className="w-full flex-1 flex items-center justify-center py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center justify-center">
              <div className="flex flex-col justify-center space-y-4 items-center text-center">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Quản lý dự án hiệu quả cho đội ngũ của bạn
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl">
                    Teamer là công cụ hiện đại giúp bạn quản lý đội nhóm, dự án và năng suất. Được thiết kế đặc biệt cho các nhóm phát triển phần mềm theo phương pháp Agile Scrum hoặc Kanban.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" onClick={() => navigate("/register")}>
                    Bắt đầu miễn phí <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              <img
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                src="https://placehold.co/600x400/png"
              />
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Tính năng chính
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Mọi thứ bạn cần để thành công
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Teamer cung cấp các công cụ mạnh mẽ để giúp nhóm của bạn làm việc hiệu quả hơn, từ quản lý nhiệm vụ đến theo dõi tiến độ.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <Users className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Quản lý đội nhóm</h3>
                </div>
                <p className="text-gray-500">
                  Dễ dàng mời và quản lý các thành viên trong nhóm, phân công vai trò và theo dõi hoạt động của họ.
                </p>
              </div>
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <GanttChartSquare className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Quản lý dự án</h3>
                </div>
                <p className="text-gray-500">
                  Tạo và quản lý các dự án, chia nhỏ công việc thành các nhiệm vụ, đặt deadline và theo dõi tiến độ.
                </p>
              </div>
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <BotMessageSquare className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Quản lý tài liệu</h3>
                </div>
                <p className="text-gray-500">
                  Tích hợp công cụ tạo và quản lý tài liệu hiệu quả ngay trong ứng dụng của bạn. Hạn chế tối thiểu số lượng công cụ bên ngoài giúp bạn tập trung vào những công việc quan trọng.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Tại sao chọn Teamer?
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Teamer không chỉ là một công cụ quản lý dự án. Đó là một nền tảng toàn diện được xây dựng để trao quyền cho các nhóm phát triển phần mềm, giúp họ đạt được hiệu suất cao nhất.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Quản lý đội nhóm</h3>
                      <p className="text-gray-500">
                        Dễ dàng mời và quản lý các thành viên trong nhóm, sử dụng những phương pháp quản lý nhóm hiệu quả và hiện đại như Scrum, Kanban, ...
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Quản lý tài liệu tập trung</h3>
                      <p className="text-gray-500">
                        Tích hợp công cụ tạo và quản lý tài liệu, giảm thiểu sự phụ thuộc vào các công cụ bên ngoài và giữ mọi thứ trong một nơi duy nhất.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Báo cáo và phân tích chuyên sâu</h3>
                      <p className="text-gray-500">
                        Cung cấp các báo cáo và biểu đồ trực quan giúp bạn theo dõi tiến độ dự án, hiệu suất nhóm và đưa ra quyết định dựa trên dữ liệu.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <img
                alt="Why Choose Us"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
                src="https://placehold.co/600x400/png"
              />
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 flex flex-col items-center justify-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Sẵn sàng bắt đầu?
            </h2>
            <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Tham gia cùng hàng ngàn đội ngũ đang tối ưu hóa quy trình làm việc của họ với Teamer. Đăng ký ngay hôm nay để trải nghiệm sự khác biệt!
            </p>
            <Button size="lg" onClick={() => navigate("/register")}>
              Bắt đầu miễn phí <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Teamer. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Điều khoản dịch vụ
          </a>
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Chính sách bảo mật
          </a>
        </nav>
      </footer>
    </div>
  );
};

export default LandingPage;