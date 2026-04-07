import { Check } from "lucide-react";
export const metadata = {
  title: "Pricing — SOAR",
  description:
    "Simple pricing to launch your projects and find talent on SOAR.",
};

const freeTierFeatures = [
  "1 active project posting",
  "Basic project page",
  "Team member listing",
  "Listed in discover feed",
  "Applicant notifications",
];

const proTierFeatures = [
  "Unlimited project postings",
  "Everything in Free, plus:",
  "Applicant analytics & insights",
  "Priority discover placement",
  "Export applicant data",
  "Custom project branding",
];

export default function PricingPage() {
  return (
    <>
      <div className="container-page flex flex-col flex-1">
        <main className="flex-1 py-3xl">
          {/* Header */}
          <div className="text-center mb-2xl">
            <h1 className="type-display mb-sm">
              Simple{" "}
              <span className="bg-gradient-to-r from-[#DCB063] via-[#56D6A6] to-[#6EC3BE] bg-clip-text text-transparent">
                pricing
              </span>
            </h1>
            <p className="type-subhead text-text-secondary mx-auto">
              Get started for free. Upgrade when you need more.
            </p>
          </div>

          {/* Cards */}
          <div className="flex flex-col md:flex-row gap-lg max-w-[820px] mx-auto items-start">
            {/* Free Tier */}
            <div className="rounded-[var(--radius-xl)] border-[3px] border-[#8B7355]/30 p-lg flex flex-col w-full md:w-1/2">
              <h2 className="type-title text-text-primary mb-2xs">Free</h2>
              <div className="flex items-baseline gap-2xs mb-xs">
                <span className="type-display">$0</span>
                <span className="type-body text-text-secondary">/month</span>
              </div>
              <p className="type-body text-text-secondary mb-lg">
                Perfect for getting started with your first project.
              </p>

              <ul className="flex flex-col gap-sm mb-lg flex-1">
                {freeTierFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2xs">
                    <Check
                      size={18}
                      className="text-[#8B7355] mt-[3px] shrink-0"
                    />
                    <span className="type-body">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className="
                  w-full h-[var(--btn-height-lg)] rounded-[var(--radius-sm)]
                  border-2 border-[#8B7355]/30 text-text-primary font-medium
                  hover:border-[#8B7355]/50 hover:bg-[#8B7355]/5
                  active:scale-[0.97]
                  transition-all duration-[var(--duration-base)]
                  [transition-timing-function:var(--ease-enter)]
                  cursor-pointer
                "
              >
                Get started
              </button>
            </div>

            {/* Pro Tier — gradient border */}
            <div className="rounded-[var(--radius-xl)] p-[3px] bg-gradient-to-b from-[#DCB063] via-[#56D6A6] to-[#6EC3BE] w-full md:w-1/2">
              <div className="rounded-[calc(var(--radius-xl)-3px)] bg-background p-lg flex flex-col h-full">
                <div className="flex items-center justify-between mb-2xs">
                  <h2 className="type-title text-text-primary">Pro</h2>
                  <span className="text-[13px] font-semibold bg-[#56D6A6] text-white px-sm py-[3px] rounded-[var(--radius-full)]">
                    Best value
                  </span>
                </div>
                <div className="flex items-baseline gap-2xs mb-xs">
                  <span className="type-display">$24.99</span>
                  <span className="type-body text-text-secondary">/month</span>
                </div>
                <p className="type-body text-text-secondary mb-lg">
                  Scale your hiring pipeline and gain deeper insights.
                </p>

                <ul className="flex flex-col gap-md mb-xl flex-1">
                  {proTierFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-2xs">
                      <Check
                        size={18}
                        className="text-[#56D6A6] mt-[3px] shrink-0"
                      />
                      <span className="type-body">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className="
                    w-full h-[var(--btn-height-lg)] rounded-[var(--radius-sm)]
                    bg-[#56D6A6] text-white font-semibold!
                    hover:bg-[#4bc496]
                    active:scale-[0.97]
                    transition-all duration-[var(--duration-base)]
                    [transition-timing-function:var(--ease-enter)]
                    cursor-pointer
                  "
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
