import type { EngagementReviewDto, EngagementSummaryDto } from '../api/review-api.models';

/**
 * Sample data for `MockReviewApi`.
 *
 * Implementation detail of the mock backend: application code goes through
 * `ReviewApi` instead. Replacing the contents of this file with other data that
 * satisfies the DTOs is all it takes to run the application against a different
 * data set.
 */
export interface MockEngagement {
  summary: EngagementSummaryDto;
  review: EngagementReviewDto;
  /** Delay before `getReview()` responds. */
  loadDelayMs: number;
  /** Delay before `saveReview()` responds. */
  saveDelayMs: number;
  /** When set, `getReview()` fails instead of returning `review`. */
  loadFails?: boolean;
  /** When set, `saveReview()` fails. */
  saveFails?: boolean;
}

export const MOCK_ENGAGEMENTS: MockEngagement[] = [
  {
    summary: {
      id: 'ENG-2044',
      name: 'Q3 Interim Review',
      clientName: 'Lakeside Medical Partners',
      pendingChangeCount: 3,
      status: 'READY',
    },
    loadDelayMs: 250,
    saveDelayMs: 250,
    review: {
      engagementId: 'ENG-2044',
      revision: 9,
      generatedAt: '2026-02-13T16:30:00.000Z',
      changes: [
        {
          id: 'CHG-4401',
          version: 1,
          group: 'Client details',
          title: 'Update the registered address',
          description: 'The practice relocated in January 2026.',
          oldValue: '18 Lakeside Drive, Suite 200',
          newValue: '400 Meridian Way, Suite 1100',
        },
        {
          id: 'CHG-4402',
          version: 1,
          group: 'Engagement team',
          title: 'Change the engagement partner',
          description: 'Rotation required after seven consecutive years.',
          oldValue: 'D. Okonkwo',
          newValue: 'M. Halvorsen',
        },
        {
          id: 'CHG-4403',
          version: 2,
          group: 'Client details',
          title: 'Update the fiscal year end',
          description: 'The partnership agreement moved the year end by one quarter.',
          oldValue: '2026-06-30',
          newValue: '2026-09-30',
        },
      ],
    },
  },

  {
    summary: {
      id: 'ENG-2043',
      name: 'FY2025 Group Consolidation',
      clientName: 'Cascadia Metals Group',
      pendingChangeCount: 5,
      status: 'READY',
    },
    loadDelayMs: 1400,
    saveDelayMs: 300,
    saveFails: true,
    review: {
      engagementId: 'ENG-2043',
      revision: 3,
      generatedAt: '2026-02-02T09:00:00.000Z',
      changes: [
        {
          id: 'CHG-4301',
          version: 1,
          group: 'Group structure',
          title: 'Add newly acquired component: Cascadia Extrusions Inc.',
          description: 'Acquired on 1 July 2025 and consolidated from that date.',
          oldValue: null,
          newValue: 'Full scope audit',
        },
        {
          id: 'CHG-4302',
          version: 2,
          group: 'Group structure',
          title: 'Change component significance for Cascadia Rail Services',
          description: 'Revenue grew to 11% of group revenue in the current period.',
          oldValue: 'Not significant',
          newValue: 'Significant by size',
        },
        {
          id: 'CHG-4303',
          version: 1,
          group: 'Group structure',
          title: 'Remove dormant component: Cascadia Foundry (NZ) Ltd.',
          description: 'Struck off the register on 14 November 2025.',
          oldValue: 'In scope',
          newValue: null,
        },
        {
          id: 'CHG-4304',
          version: 1,
          group: 'Consolidation eliminations',
          title: 'Add intercompany elimination for management fees',
          description: 'Fees charged by the parent to three components were not eliminated.',
          oldValue: null,
          newValue: 1250000,
        },
        {
          id: 'CHG-4305',
          version: 4,
          group: 'Consolidation eliminations',
          title: 'Update the translation rate for Cascadia Extrusions Inc.',
          description: 'Closing rate updated to the published 31 December 2025 rate.',
          oldValue: 1.3421,
          newValue: 1.3688,
        },
      ],
    },
  },

  {
    summary: {
      id: 'ENG-2041',
      name: 'FY2025 Statutory Audit',
      clientName: 'Harborview Logistics Ltd.',
      pendingChangeCount: 4,
      status: 'READY',
    },
    loadDelayMs: 300,
    saveDelayMs: 300,
    review: {
      engagementId: 'ENG-2041',
      revision: 12,
      generatedAt: '2026-02-11T08:05:00.000Z',
      changes: [
        {
          id: 'CHG-4101',
          version: 1,
          group: 'Engagement setup',
          title: 'Change the materiality benchmark',
          description: 'Total revenue is the more stable benchmark after a loss-making year.',
          oldValue: 'Profit before tax',
          newValue: 'Total revenue',
        },
        {
          id: 'CHG-4102',
          version: 2,
          group: 'Engagement setup',
          title: 'Recalculate planning materiality',
          description: 'Planning materiality recalculated at 1.5% of total revenue.',
          oldValue: 185000,
          newValue: 262500,
        },
        {
          id: 'CHG-4103',
          version: 1,
          group: 'Trial balance mappings',
          title: "Map 'Fuel surcharge recoveries' to Revenue",
          description: 'Account 4120 was imported without a financial statement mapping.',
          oldValue: null,
          newValue: 'Revenue',
        },
        {
          id: 'CHG-4104',
          version: 1,
          group: 'Risk assessment',
          title: 'Raise the fraud risk rating for management override',
          description: 'Two manual journals above materiality were posted after the year end.',
          oldValue: 'Low',
          newValue: 'Moderate',
        },
      ],
    },
  },

  {
    summary: {
      id: 'ENG-2045',
      name: 'FY2025 Statutory Audit',
      clientName: 'Pemberton Craft Brewing Co.',
      pendingChangeCount: 2,
      status: 'READY',
    },
    loadDelayMs: 500,
    saveDelayMs: 300,
    loadFails: true,
    // Not served while `loadFails` is set; kept so the flag can be turned off.
    review: {
      engagementId: 'ENG-2045',
      revision: 1,
      generatedAt: '2026-02-05T07:45:00.000Z',
      changes: [
        {
          id: 'CHG-4501',
          version: 1,
          group: 'Trial balance mappings',
          title: "Map 'Excise duty payable' to Current tax liabilities",
          description: 'Account 2310 was imported without a financial statement mapping.',
          oldValue: null,
          newValue: 'Current tax liabilities',
        },
        {
          id: 'CHG-4502',
          version: 1,
          group: 'Trial balance mappings',
          title: "Reclassify 'Taproom sales' to Revenue - retail",
          description: 'Taproom sales are retail, not wholesale distribution.',
          oldValue: 'Revenue - wholesale',
          newValue: 'Revenue - retail',
        },
      ],
    },
  },

  {
    summary: {
      id: 'ENG-2042',
      name: 'FY2025 Year-End Close',
      clientName: 'Northwind Dairy Co-operative',
      pendingChangeCount: 0,
      status: 'READY',
    },
    loadDelayMs: 200,
    saveDelayMs: 200,
    review: {
      engagementId: 'ENG-2042',
      revision: 4,
      generatedAt: '2026-01-29T11:20:00.000Z',
      changes: [],
    },
  },
];
