export const metadata = {
  title: "About — SOAR",
  description: "Learn what SOAR is all about.",
};

export default function AboutPage() {
  return (
    <div className="container-page flex flex-col min-h-full">
      <main className="flex-1 py-xl">
        <div className="w-full max-w-[90vw] lg:max-w-[66vw] mx-auto flex flex-col gap-xl">
          {/* Banner */}
          <div
            className="w-full aspect-[5/3] rounded-[var(--radius-md)] flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: "var(--surface-dark)" }}
          >
            <svg
              width="380"
              height="104"
              viewBox="0 0 95 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-[60%] max-w-[380px] h-auto"
            >
              <defs>
                <linearGradient id="proGradient" x1="0" y1="13" x2="95" y2="13" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#DCB063" />
                  <stop offset="50%" stopColor="#56D6A6" />
                  <stop offset="100%" stopColor="#6EC3BE" />
                </linearGradient>
              </defs>
              <path
                d="M9.88109 9.84151C9.81096 9.18527 9.5154 8.67431 8.99442 8.30863C8.47845 7.94294 7.80719 7.76009 6.98063 7.76009C6.39954 7.76009 5.9011 7.84776 5.48532 8.02309C5.06954 8.19842 4.75144 8.43636 4.53102 8.73693C4.31061 9.0375 4.1979 9.38064 4.19289 9.76637C4.19289 10.087 4.26552 10.365 4.4108 10.6004C4.56108 10.8359 4.76396 11.0363 5.01944 11.2016C5.27492 11.3619 5.55796 11.4971 5.86854 11.6073C6.17912 11.7175 6.49221 11.8102 6.80781 11.8854L8.25052 12.246C8.83161 12.3813 9.39016 12.5641 9.92617 12.7946C10.4672 13.025 10.9506 13.3155 11.3764 13.6662C11.8072 14.0169 12.1479 14.4402 12.3983 14.9361C12.6488 15.432 12.774 16.0131 12.774 16.6794C12.774 17.5811 12.5436 18.3751 12.0827 19.0614C11.6219 19.7426 10.9556 20.2761 10.084 20.6619C9.21734 21.0426 8.16787 21.2329 6.93555 21.2329C5.73829 21.2329 4.69884 21.0476 3.81718 20.6769C2.94053 20.3062 2.25424 19.7652 1.75831 19.0538C1.26738 18.3425 1.00188 17.4759 0.961809 16.4539H3.70447C3.74454 16.99 3.90986 17.4358 4.2004 17.7915C4.49095 18.1471 4.86916 18.4126 5.33504 18.588C5.80592 18.7633 6.33191 18.851 6.913 18.851C7.51915 18.851 8.05014 18.7608 8.506 18.5804C8.96687 18.3951 9.32755 18.1396 9.58804 17.814C9.84853 17.4834 9.98128 17.0977 9.98629 16.6568C9.98128 16.2561 9.86356 15.9255 9.63312 15.665C9.40269 15.3995 9.07958 15.179 8.6638 15.0037C8.25303 14.8234 7.77212 14.6631 7.22108 14.5228L5.47029 14.072C4.20291 13.7464 3.20102 13.2529 2.46464 12.5917C1.73326 11.9254 1.36757 11.0413 1.36757 9.93919C1.36757 9.03249 1.61303 8.23849 2.10396 7.55721C2.59989 6.87593 3.27366 6.34744 4.12526 5.97173C4.97686 5.59101 5.94118 5.40065 7.0182 5.40065C8.11026 5.40065 9.06706 5.59101 9.8886 5.97173C10.7152 6.34744 11.3639 6.87092 11.8348 7.54218C12.3056 8.20844 12.5486 8.97488 12.5636 9.84151H9.88109ZM32.1842 13.3055C32.1842 14.9636 31.8736 16.3838 31.2524 17.566C30.6363 18.7433 29.7947 19.645 28.7277 20.2711C27.6657 20.8973 26.4609 21.2104 25.1134 21.2104C23.7658 21.2104 22.5586 20.8973 21.4916 20.2711C20.4296 19.6399 19.588 18.7357 18.9668 17.5585C18.3506 16.3763 18.0426 14.9586 18.0426 13.3055C18.0426 11.6474 18.3506 10.2297 18.9668 9.05252C19.588 7.8703 20.4296 6.9661 21.4916 6.33992C22.5586 5.71374 23.7658 5.40065 25.1134 5.40065C26.4609 5.40065 27.6657 5.71374 28.7277 6.33992C29.7947 6.9661 30.6363 7.8703 31.2524 9.05252C31.8736 10.2297 32.1842 11.6474 32.1842 13.3055ZM29.3814 13.3055C29.3814 12.1383 29.1986 11.154 28.8329 10.3525C28.4722 9.54595 27.9712 8.93731 27.33 8.52654C26.6888 8.11075 25.9499 7.90286 25.1134 7.90286C24.2768 7.90286 23.5379 8.11075 22.8967 8.52654C22.2555 8.93731 21.752 9.54595 21.3864 10.3525C21.0257 11.154 20.8453 12.1383 20.8453 13.3055C20.8453 14.4727 21.0257 15.4596 21.3864 16.2661C21.752 17.0676 22.2555 17.6762 22.8967 18.092C23.5379 18.5028 24.2768 18.7082 25.1134 18.7082C25.9499 18.7082 26.6888 18.5028 27.33 18.092C27.9712 17.6762 28.4722 17.0676 28.8329 16.2661C29.1986 15.4596 29.3814 14.4727 29.3814 13.3055ZM39.1434 21H36.1678L41.5855 5.61105H45.027L50.4522 21H47.4766L43.3663 8.76699H43.2461L39.1434 21ZM39.2411 14.9661H47.3563V17.2054H39.2411V14.9661ZM55.6531 21V5.61105H61.4239C62.6061 5.61105 63.598 5.81644 64.3995 6.22721C65.206 6.63798 65.8147 7.21407 66.2255 7.95546C66.6412 8.69185 66.8491 9.55096 66.8491 10.5328C66.8491 11.5197 66.6387 12.3763 66.2179 13.1026C65.8022 13.824 65.1885 14.3826 64.377 14.7783C63.5655 15.169 62.5686 15.3644 61.3864 15.3644H57.2761V13.05H61.0106C61.7019 13.05 62.268 12.9549 62.7088 12.7645C63.1497 12.5691 63.4753 12.2861 63.6857 11.9154C63.9011 11.5397 64.0088 11.0788 64.0088 10.5328C64.0088 9.98678 63.9011 9.52091 63.6857 9.13518C63.4703 8.74444 63.1422 8.44889 62.7013 8.24851C62.2605 8.04313 61.6919 7.94043 60.9956 7.94043H58.4408V21H55.6531ZM63.603 14.0269L67.4127 21H64.3018L60.5598 14.0269H63.603Z"
                fill="url(#proGradient)"
              />
              <path
                d="M87.7793 20.7433L94.2764 8.18223C94.4233 7.89822 94.5 7.58313 94.5 7.26338V4.73259C94.5 4.28374 94.0252 3.99382 93.6259 4.19885L77.513 12.473C76.9107 12.7823 76.941 13.6533 77.5633 13.92L82.7268 16.1329C82.9051 16.2093 83.0573 16.3359 83.1649 16.4973L86.0591 20.8386C86.4816 21.4724 87.4294 21.4199 87.7793 20.7433Z"
                fill="url(#proGradient)"
              />
            </svg>
          </div>

          {/* Intro */}
          <section>
            <h1 className="type-headline mb-sm">About SOAR</h1>
            <p className="type-body text-text-secondary">
              SOAR is a simple way to post small projects, share them with the
              right people, and connect with motivated talent — without the noise
              of traditional job boards. It was created to make it easier for
              businesses, founders, creators, and teams to find help for
              short-term remote projects — whether that&apos;s building a
              website, supporting a campaign, or finding an assistant for a
              focused task.
            </p>
          </section>

          {/* Why it exists */}
          <section>
            <h2 className="type-title mb-xs">Why SOAR exists</h2>
            <p className="type-body text-text-secondary">
              A lot of great projects never get posted because the process feels
              too heavy. A lot of talented people never get discovered because
              the right opportunities are hard to find. SOAR exists to make that
              connection feel lighter, clearer, and more human. Instead of long
              hiring workflows or noisy outreach, SOAR gives project posters a
              clean page to share and gives applicants a simple way to express
              interest.
            </p>
          </section>

          {/* Mission & Vision */}
          <section>
            <h2 className="type-title mb-xs">Vision</h2>
            <p className="type-body text-text-secondary mb-sm">
              Imagine a world where anyone with a great idea can find the right
              person to help bring it to life — in minutes, not months. Where
              talent isn&apos;t hidden behind resumes and algorithms, and
              opportunities aren&apos;t buried in noise. That&apos;s the world
              we&apos;re building.
            </p>
            <h2 className="type-title mb-xs">Mission</h2>
            <p className="type-body text-text-secondary">
              Every day, SOAR helps people post projects in minutes, share them
              with a single link, and connect with the right talent — no lengthy
              hiring processes, no middlemen, no friction. Just real projects
              meeting real people, ready to work.
            </p>
          </section>

          {/* What SOAR is */}
          <section>
            <h2 className="type-title mb-xs">What SOAR is</h2>
            <ul className="type-body text-text-secondary flex flex-col gap-2xs list-disc pl-md">
              <li>A project posting page</li>
              <li>A lightweight application flow</li>
              <li>A shareable link for opportunities</li>
              <li>A growing community of people looking to help on real work</li>
            </ul>
            <p className="type-body text-text-secondary mt-sm">
              It is not meant to be a full management tool or a complicated
              marketplace. The work happens outside the platform — SOAR is simply
              where the connection begins.
            </p>
          </section>

          {/* How it started */}
          <section>
            <h2 className="type-title mb-xs">How it started</h2>
            <p className="type-body text-text-secondary">
              SOAR began as an idea inside the Studio School Human Centered Design x AI program by DFSG, where the
              focus was on building something useful, thoughtful, and real. What
              started as a concept about connecting learners to projects evolved
              into something broader: a cleaner way for businesses and creators
              to share small opportunities and find people who actually want to
              work on them.
            </p>
          </section>

          {/* What we care about */}
          <section>
            <h2 className="type-title mb-xs">What we care about</h2>
            <ul className="type-body text-text-secondary flex flex-col gap-2xs list-disc pl-md">
              <li>
                <span className="font-medium text-text-primary">Clarity</span>{" "}
                — posting a project should feel easy
              </li>
              <li>
                <span className="font-medium text-text-primary">Quality</span>{" "}
                — opportunities should feel relevant and intentional
              </li>
              <li>
                <span className="font-medium text-text-primary">
                  Connection
                </span>{" "}
                — the right match matters more than volume
              </li>
              <li>
                <span className="font-medium text-text-primary">
                  Simplicity
                </span>{" "}
                — good design should reduce friction
              </li>
              <li>
                <span className="font-medium text-text-primary">Momentum</span>{" "}
                — projects should feel like they can take off quickly
              </li>
            </ul>
          </section>

          {/* Closing */}
          <section>
            <p className="type-subhead text-text-primary">
              Great projects should be easy to share, and great people should be
              easier to find.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
