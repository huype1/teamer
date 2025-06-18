import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen  to-white flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <h1 className="text-5xl font-extrabold text-black mb-4 text-center">
          Welcome to <span className="text-gray-500">Teamer</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-xl">
          The modern way to manage your team, projects, and productivity,
          tailored for software engineering teams using agile scrum or kanban.
        </p>
        <Button size="lg" className="mb-12">
          Get Started
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <span className="text-3xl mb-2">🚀</span>
              <h2 className="font-semibold text-xl mb-1">Fast Setup</h2>
              <p className="text-gray-500 text-center">
                Get your team up and running in minutes with our intuitive
                onboarding.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <span className="text-3xl mb-2">🔒</span>
              <h2 className="font-semibold text-xl mb-1">Secure</h2>
              <p className="text-gray-500 text-center">
                Managed your issues, sprints and also your team docummentation
                in one place.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <span className="text-3xl mb-2">✨</span>
              <h2 className="font-semibold text-xl mb-1">Beautiful UI</h2>
              <p className="text-gray-500 text-center">
                Enjoy a delightful and responsive interface on any device.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-row gap-2 items-center">
              <Button
                onClick={() => navigate("/login")}
                variant={"destructive"}
              >
                Login
              </Button>
              <Button onClick={() => navigate("/team")} variant={"ghost"}>
                Create your team now
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
