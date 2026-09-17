import { SocietyForm } from "@/components/societies/society-form";

export default function NewSocietyPage() {
  return (
    <div>
      <div className="border-b border-line pb-6">
        <h1 className="font-heading text-2xl font-semibold text-ink">New Society</h1>
      </div>
      <div className="mt-8">
        <SocietyForm />
      </div>
    </div>
  );
}
