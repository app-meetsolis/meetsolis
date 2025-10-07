'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { fadeInUp } from '@/lib/animations/variants';

const comparisonData = [
  {
    feature: 'Unlimited Meetings',
    meetsolis: true,
    zoom: false,
    zoomNote: 'Pro plan required',
  },
  {
    feature: 'No Time Limits',
    meetsolis: true,
    zoom: false,
    zoomNote: '40 min limit on free',
  },
  {
    feature: 'AI Meeting Summaries',
    meetsolis: true,
    zoom: false,
    zoomNote: 'Add-on required',
  },
  {
    feature: 'Collaborative Whiteboard',
    meetsolis: true,
    zoom: true,
    zoomNote: 'Limited features',
  },
  {
    feature: 'Screen Sharing',
    meetsolis: true,
    zoom: true,
    zoomNote: '',
  },
  {
    feature: 'File Sharing (10GB)',
    meetsolis: true,
    zoom: false,
    zoomNote: '5GB on Pro',
  },
  {
    feature: 'Calendar Integration',
    meetsolis: true,
    zoom: true,
    zoomNote: '',
  },
  {
    feature: 'Up to 100 Participants',
    meetsolis: true,
    zoom: true,
    zoomNote: '',
  },
  {
    feature: 'Monthly Price',
    meetsolis: '$15',
    zoom: '$15.99',
    zoomNote: 'Per user/month',
  },
];

export function ComparisonTable() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            MeetSolis vs Zoom
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how we compare to the competition
          </p>
        </motion.div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto overflow-x-auto"
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-900">
                  Feature
                </th>
                <th className="text-center py-4 px-4 font-semibold text-primary">
                  MeetSolis
                </th>
                <th className="text-center py-4 px-4 font-semibold text-gray-600">
                  Zoom Pro
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4 text-gray-900">{row.feature}</td>
                  <td className="py-4 px-4 text-center">
                    {typeof row.meetsolis === 'boolean' ? (
                      row.meetsolis ? (
                        <Check className="w-6 h-6 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-6 h-6 text-red-500 mx-auto" />
                      )
                    ) : (
                      <span className="font-semibold text-primary">
                        {row.meetsolis}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {typeof row.zoom === 'boolean' ? (
                      row.zoom ? (
                        <Check className="w-6 h-6 text-gray-400 mx-auto" />
                      ) : (
                        <>
                          <X className="w-6 h-6 text-red-500 mx-auto" />
                          {row.zoomNote && (
                            <span className="text-xs text-gray-500 block mt-1">
                              {row.zoomNote}
                            </span>
                          )}
                        </>
                      )
                    ) : (
                      <>
                        <span className="font-semibold text-gray-600">
                          {row.zoom}
                        </span>
                        {row.zoomNote && (
                          <span className="text-xs text-gray-500 block mt-1">
                            {row.zoomNote}
                          </span>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-lg text-gray-700 font-medium">
            Save over $200/year while getting better features.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
