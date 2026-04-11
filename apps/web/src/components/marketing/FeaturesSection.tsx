'use client';
import React from 'react';

const features = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        width="32"
        height="32"
        fill="currentColor"
      >
        <path d="M144,104V64a8,8,0,0,1,13.66-5.66L172,72.69l30.34-30.35a8,8,0,0,1,11.32,11.32L183.31,84l14.35,14.34A8,8,0,0,1,192,112H152A8,8,0,0,1,144,104Zm-40,40H64a8,8,0,0,0-5.66,13.66L72.69,172,42.34,202.34a8,8,0,0,0,11.32,11.32L84,183.31l14.34,14.35A8,8,0,0,0,112,192V152A8,8,0,0,0,104,144Zm3.06-87.39a8,8,0,0,0-8.72,1.73L84,72.69,53.66,42.34A8,8,0,0,0,42.34,53.66L72.69,84,58.34,98.34A8,8,0,0,0,64,112h40a8,8,0,0,0,8-8V64A8,8,0,0,0,107.06,56.61ZM183.31,172l14.35-14.34A8,8,0,0,0,192,144H152a8,8,0,0,0-8,8v40a8,8,0,0,0,13.66,5.66L172,183.31l30.34,30.35a8,8,0,0,0,11.32-11.32Z" />
      </svg>
    ),
    title: 'Effortless Connectivity',
    description:
      'Our AI agents seamlessly integrate with your existing systems, ensuring a smooth transition and enhanced productivity.',
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        width="32"
        height="32"
        fill="currentColor"
      >
        <path d="M212,76V72a44,44,0,0,0-74.86-31.31,3.93,3.93,0,0,0-1.14,2.8v88.72a4,4,0,0,0,6.2,3.33A47.67,47.67,0,0,1,167.68,128a8.18,8.18,0,0,1,8.31,7.58,8,8,0,0,1-8,8.42,32,32,0,0,0-32,32v33.88a4,4,0,0,0,1.49,3.12,47.92,47.92,0,0,0,74.21-17.16,4,4,0,0,0-4.49-5.56A68.06,68.06,0,0,1,192,192h-7.73a8.18,8.18,0,0,1-8.25-7.47,8,8,0,0,1,8-8.53h8a51.6,51.6,0,0,0,24-5.88v0A52,52,0,0,0,212,76Zm-12,36h-4a36,36,0,0,1-36-36V72a8,8,0,0,1,16,0v4a20,20,0,0,0,20,20h4a8,8,0,0,1,0,16ZM88,28A44.05,44.05,0,0,0,44,72v4a52,52,0,0,0-4,94.12h0A51.6,51.6,0,0,0,64,176h7.73A8.18,8.18,0,0,1,80,183.47,8,8,0,0,1,72,192H64a67.48,67.48,0,0,1-15.21-1.73,4,4,0,0,0-4.5,5.55A47.93,47.93,0,0,0,118.51,213a4,4,0,0,0,1.49-3.12V176a32,32,0,0,0-32-32,8,8,0,0,1-8-8.42A8.18,8.18,0,0,1,88.32,128a47.67,47.67,0,0,1,25.48,7.54,4,4,0,0,0,6.2-3.33V43.49a4,4,0,0,0-1.14-2.81A43.85,43.85,0,0,0,88,28Zm8,48a36,36,0,0,1-36,36H56a8,8,0,0,1,0-16h4A20,20,0,0,0,80,76V72a8,8,0,0,1,16,0Z" />
      </svg>
    ),
    title: 'The Next Frontier',
    description:
      'Explore the exciting predictions and trends shaping the future of AI technology and its impact on various industries.',
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        width="32"
        height="32"
        fill="currentColor"
      >
        <path d="M128,24a104,104,0,1,0,30.57,203.43,7.9,7.9,0,0,0,3.3-2l63.57-63.57a8,8,0,0,0,2-3.31A104.09,104.09,0,0,0,128,24ZM92,96a12,12,0,1,1-12,12A12,12,0,0,1,92,96Zm82.92,60c-10.29,17.79-27.39,28-46.92,28s-36.63-10.2-46.92-28a8,8,0,1,1,13.84-8c7.47,12.91,19.21,20,33.08,20s25.61-7.1,33.08-20a8,8,0,1,1,13.84,8ZM164,120a12,12,0,1,1,12-12A12,12,0,0,1,164,120Z" />
      </svg>
    ),
    title: 'Exceptional User Engagement',
    description:
      'Our platform prioritizes user experience, providing intuitive interfaces and personalized interactions.',
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        width="32"
        height="32"
        fill="currentColor"
      >
        <path d="M224,40V80a8,8,0,0,1-16,0V48H176a8,8,0,0,1,0-16h40A8,8,0,0,1,224,40ZM80,208H48V176a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H80a8,8,0,0,0,0-16Zm136-40a8,8,0,0,0-8,8v32H176a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V176A8,8,0,0,0,216,168ZM40,88a8,8,0,0,0,8-8V48H80a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8V80A8,8,0,0,0,40,88Zm32-8v96a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8V80a8,8,0,0,0-8-8H80A8,8,0,0,0,72,80Z" />
      </svg>
    ),
    title: 'Future Insights',
    description:
      'Stay ahead of the curve with our analysis of emerging AI trends that will redefine business landscapes.',
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        width="32"
        height="32"
        fill="currentColor"
      >
        <path d="M32,80a8,8,0,0,1,8-8H77.17a28,28,0,0,1,53.66,0H216a8,8,0,0,1,0,16H130.83a28,28,0,0,1-53.66,0H40A8,8,0,0,1,32,80Zm184,88H194.83a28,28,0,0,0-53.66,0H40a8,8,0,0,0,0,16H141.17a28,28,0,0,0,53.66,0H216a8,8,0,0,0,0-16Z" />
      </svg>
    ),
    title: 'Streamlined Solutions',
    description:
      'Experience the power of our AI agents that effortlessly adapt to your business needs, enhancing efficiency.',
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        width="32"
        height="32"
        fill="currentColor"
      >
        <path d="M101.85,191.14C97.34,201,82.29,224,40,224a8,8,0,0,1-8-8c0-42.29,23-57.34,32.86-61.85a8,8,0,0,1,6.64,14.56c-6.43,2.93-20.62,12.36-23.12,38.91,26.55-2.5,36-16.69,38.91-23.12a8,8,0,1,1,14.56,6.64Zm122-144a16,16,0,0,0-15-15c-12.58-.75-44.73.4-71.4,27.07h0L88,108.7A8,8,0,0,1,76.67,97.39l26.56-26.57A4,4,0,0,0,100.41,64H74.35A15.9,15.9,0,0,0,63,68.68L28.7,103a16,16,0,0,0,9.07,27.16l38.47,5.37,44.21,44.21,5.37,38.49a15.94,15.94,0,0,0,10.78,12.92,16.11,16.11,0,0,0,5.1.83A15.91,15.91,0,0,0,153,227.3L187.32,193A16,16,0,0,0,192,181.65V155.59a4,4,0,0,0-6.83-2.82l-26.57,26.56a8,8,0,0,1-11.71-.42,8.2,8.2,0,0,1,.6-11.1l49.27-49.27h0C223.45,91.86,224.6,59.71,223.85,47.12Z" />
      </svg>
    ),
    title: 'Visionary AI',
    description:
      'Discover how our innovative AI solutions are set to transform industries and create new opportunities for growth.',
  },
];

export default function FeaturesSection() {
  return (
    <section
      className="w-full flex flex-col items-center"
      id="core-value"
      style={{ padding: '64px', backgroundColor: 'rgb(248,249,250)' }}
    >
      <div className="w-full max-w-[1000px] flex flex-col gap-16">
        {/* Header */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-4">
            <span className="section-badge">EASY ONBOARDING</span>
            <div className="text-center">
              <h1
                style={{
                  fontSize: '48px',
                  fontWeight: 600,
                  letterSpacing: '-3px',
                  lineHeight: '1em',
                  color: '#000000',
                  textAlign: 'center',
                }}
              >
                Discover the amazing
              </h1>
              <h1
                style={{
                  fontSize: '48px',
                  fontWeight: 600,
                  letterSpacing: '-3px',
                  lineHeight: '1em',
                  color: '#000000',
                  textAlign: 'center',
                }}
              >
                features of our AI Agents
              </h1>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="w-full">
          {/* Top Row */}
          <div
            className="flex border-b"
            style={{ borderColor: 'rgb(233,235,239)' }}
          >
            {features?.slice(0, 3)?.map((feature, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-3 flex-1 p-6">
                  <div style={{ color: '#000000' }}>{feature?.icon}</div>
                  <div className="flex flex-col items-center gap-3">
                    <h5
                      style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#000000',
                        textAlign: 'center',
                        lineHeight: '1em',
                      }}
                    >
                      {feature?.title}
                    </h5>
                    <p
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#000000',
                        textAlign: 'center',
                        opacity: 0.7,
                        lineHeight: '1.5em',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {feature?.description}
                    </p>
                  </div>
                </div>
                {i < 2 && (
                  <div
                    className="w-px"
                    style={{ backgroundColor: 'rgb(233,235,239)' }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          {/* Bottom Row */}
          <div className="flex">
            {features?.slice(3, 6)?.map((feature, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-3 flex-1 p-6">
                  <div style={{ color: '#000000' }}>{feature?.icon}</div>
                  <div className="flex flex-col items-center gap-3">
                    <h5
                      style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#000000',
                        textAlign: 'center',
                        lineHeight: '1em',
                      }}
                    >
                      {feature?.title}
                    </h5>
                    <p
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#000000',
                        textAlign: 'center',
                        opacity: 0.7,
                        lineHeight: '1.5em',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {feature?.description}
                    </p>
                  </div>
                </div>
                {i < 2 && (
                  <div
                    className="w-px"
                    style={{ backgroundColor: 'rgb(233,235,239)' }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
