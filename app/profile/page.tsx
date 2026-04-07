import ProfileContent from "@/app/components/profile/ProfileContent";
export const metadata = {
  title: "Profile — SOAR",
  description: "View and manage your SOAR profile, organization, and projects.",
};

export default function ProfilePage() {
  return (
    <div className="container-page flex flex-col flex-1">
      <main className="flex-1 py-xl pb-3xl">
        <ProfileContent />
      </main>
    </div>
  );
}
