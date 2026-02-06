import { Presentation } from "@/types/presentation";

export const COMPLEX_PRESENTATION: Presentation = {
    project_code_name: "Project Silver Screen - Stress Test",
    sector: "Entertainment & Media",
    slides: [
        {
            slide_number: 1,
            kicker: "STRESS TEST: EXECUTIVE DASHBOARD",
            title: "ConnPlex: High-Density Operational Overview",
            blocks: [
                {
                    block_id: 1,
                    block_type: "text_deep_dive",
                    heading: "Business Architecture",
                    style_variant: 1,
                    verbose_bullets: [
                        "**Hybrid Model**: Combining asset-light franchise expansion with premium company-owned flagship properties.",
                        "**Operational Alpha**: Decoupled service layers (F&B, Security) to maintain 77% ROE efficiency.",
                        "**Scale Velocity**: Rapid deployment capability (3 days warehouse-to-site) ensuring minimum downtime."
                    ],
                    citation: "Source: Business Description"
                },
                {
                    block_id: 2,
                    block_type: "dashboard_grid",
                    heading: "Financial Velocity (H1 FY26)",
                    contextual_metrics: {
                        "Revenue": "₹96.78 Cr",
                        "YoY Growth": "+59%",
                        "EBITDA": "₹26.25 Cr",
                        "PAT Growth": "+365%"
                    },
                    citation: "Source: Financials Status"
                },
                {
                    block_id: 3,
                    block_type: "dashboard_grid",
                    heading: "Unit Economics",
                    contextual_metrics: {
                        "ATP": "₹243",
                        "SPH": "₹94",
                        "Occupancy": "32%",
                        "Screens": "88"
                    },
                    citation: "Source: Key Operational Indicators"
                },
                {
                    block_id: 4,
                    block_type: "chart_complex",
                    heading: "Revenue Mix (Fabricated)",
                    chart_data: {
                        title: "Revenue Sources",
                        chart_type: "doughnut",
                        labels: ["Box Office", "F&B", "Advertising", "Convenience Fees"],
                        datasets: [
                            {
                                label: "Contribution",
                                data: [55, 25, 15, 5]
                            }
                        ],
                        strategic_analysis: "Diversified revenue streams reduce dependency on box office volatility."
                    },
                    citation: "Source: Internal Estimates (Fabricated)"
                },
                {
                    block_id: 5,
                    block_type: "visual_map",
                    heading: "Network Topology",
                    detailed_image_prompt: "India map showing high density clusters in Gujarat and Maharashtra, with arrow pointing to Vancouver expansion.",
                    citation: "Source: Geographic Distribution"
                },
                {
                    block_id: 6,
                    block_type: "logo_grid",
                    heading: "Ecosystem Partners",
                    logos: ["BookMyShow", "Paytm", "Coca-Cola", "PepsiCo", "Qube Cinema", "UFO Moviez", "Christie", "Dolby"],
                    citation: "Source: Vendor Data (Fabricated)"
                },
                {
                    block_id: 7,
                    block_type: "chart_complex",
                    heading: "Ad Revenue Surge",
                    chart_data: {
                        title: "Ad Revenue (Lakhs)",
                        chart_type: "bar",
                        labels: ["H1 FY25", "H1 FY26"],
                        datasets: [
                            {
                                label: "Revenue",
                                data: [54.2, 112.4]
                            }
                        ],
                        strategic_analysis: "107% growth driven by new screen inventory."
                    },
                    citation: "Source: Key Operational Indicators"
                },
                {
                    block_id: 8,
                    block_type: "dashboard_grid",
                    heading: "Strategic Badges",
                    contextual_metrics: ["Times Award '25", "Tier-2 Leader", "Fastest Growing", "Debt Free"],
                    citation: "Source: Awards"
                }
            ]
        },
        {
            slide_number: 2,
            kicker: "STRESS TEST: FINANCIAL VARIATION A",
            title: "Deep Dive: P&L Structure & Profitability",
            blocks: [
                {
                    block_id: 1,
                    block_type: "chart_complex",
                    heading: "EBITDA Bridge (Fabricated)",
                    chart_data: {
                        title: "EBITDA Evolution",
                        chart_type: "bar",
                        labels: ["FY24 Actual", "Vol Growth", "Price Hike", "Cost Save", "FY25 Actual"],
                        datasets: [
                            {
                                label: "Value (Cr)",
                                data: [6.2, 8.5, 4.1, 7.4, 26.2]
                            }
                        ],
                        strategic_analysis: "Operational leverage accounting for 40% of margin expansion."
                    },
                    citation: "Source: Analysis (Fabricated)"
                },
                {
                    block_id: 2,
                    block_type: "text_deep_dive",
                    heading: "Margin Analysis",
                    style_variant: 2,
                    verbose_bullets: [
                        "**Explosive PAT**: Net Profit margins expanded to 19% in FY25 from 6.6% in FY24.",
                        "**Cost Rationalization**: Material costs held steady despite volume surge.",
                        "**Tax Efficiency**: Effective tax planning utilized in FY25."
                    ],
                    citation: "Source: Ratio Analysis"
                },
                {
                    block_id: 3,
                    block_type: "dashboard_grid",
                    heading: "Key Ratios",
                    contextual_metrics: {
                        "ROE": "51.7%",
                        "RoCE": "22.3%",
                        "Asset Turns": "1.97x",
                        "Current Ratio": "1.4x"
                    },
                    citation: "Source: Ratio Analysis"
                },
                {
                    block_id: 4,
                    block_type: "chart_complex",
                    heading: "Cost Composition (Fabricated)",
                    chart_data: {
                        title: "Expense Breakdown",
                        chart_type: "doughnut",
                        labels: ["Distributor Share", "Employee Cost", "Rent/Power", "Marketing", "Other"],
                        datasets: [
                            {
                                label: "% of Rev",
                                data: [45, 12, 18, 15, 10]
                            }
                        ],
                        strategic_analysis: "Distributor share remains largest cost component at 45%."
                    },
                    citation: "Source: Cost Analysis (Fabricated)"
                },
                {
                    block_id: 5,
                    block_type: "text_deep_dive",
                    heading: "Liquidity Position",
                    style_variant: 3,
                    verbose_bullets: [
                        "**Cash Flow**: Operating Cash Flow doubled to ₹129.2 Cr in FY25.",
                        "**Working Capital**: Negative working capital cycle achieved (-₹134 Cr change) indicating strong supplier terms.",
                        "**Investment**: aggressive Capex of ₹79.6 Cr deployed for new screens."
                    ],
                    citation: "Source: Cash Flow Statement"
                },
                {
                    block_id: 6,
                    block_type: "chart_complex",
                    heading: "PAT Trajectory",
                    chart_data: {
                        title: "Net Profit (Cr)",
                        chart_type: "line",
                        labels: ["FY22", "FY23", "FY24", "FY25"],
                        datasets: [
                            {
                                label: "PAT",
                                data: [8.8, 18.6, 40.5, 183.9]
                            }
                        ],
                        strategic_analysis: "Vertical takeoff in profitability post-pandemic."
                    },
                    citation: "Source: Income Statement"
                }
            ]
        },
        {
            slide_number: 3,
            kicker: "STRESS TEST: FINANCIAL VARIATION B",
            title: "Deep Dive: Balance Sheet & Capital Structure",
            blocks: [
                {
                    block_id: 1,
                    block_type: "dashboard_grid",
                    heading: "Balance Sheet Summary",
                    contextual_metrics: {
                        "Share Cap": "₹140 Cr",
                        "Reserves": "₹106 Cr",
                        "Borrowings": "₹6.2 Cr",
                        "Fixed Assets": "₹126 Cr"
                    },
                    citation: "Source: Balance Sheet"
                },
                {
                    block_id: 2,
                    block_type: "chart_complex",
                    heading: "Leverage Profile",
                    chart_data: {
                        title: "Debt vs Equity",
                        chart_type: "stacked_bar",
                        labels: ["FY23", "FY24", "FY25"],
                        datasets: [
                            {
                                label: "Equity",
                                data: [15.8, 56.7, 246.4]
                            },
                            {
                                label: "Debt",
                                data: [2.7, 2.6, 6.2]
                            }
                        ],
                        strategic_analysis: "Company remains net cash positive with minimal leverage."
                    },
                    citation: "Source: Balance Sheet"
                },
                {
                    block_id: 3,
                    block_type: "text_deep_dive",
                    heading: "Asset Quality",
                    verbose_bullets: [
                        "**Fixed Asset Base**: Tangible assets grew to ₹102.1 Cr, reflecting screen additions.",
                        "**CWIP**: ₹24.4 Cr in Capital Work in Progress indicates future pipeline.",
                        "**Inventory**: Inventory levels optimized at ₹73.8 Cr given scale."
                    ],
                    citation: "Source: Balance Sheet - Assets"
                },
                {
                    block_id: 4,
                    block_type: "chart_complex",
                    heading: "Shareholding Structure",
                    chart_data: {
                        title: "Ownership %",
                        chart_type: "doughnut",
                        labels: ["Patel & Dhyani (Promoters)", "Public", "Funds"],
                        datasets: [
                            {
                                label: "Stake",
                                data: [70.1, 25.0, 4.9]
                            }
                        ],
                        strategic_analysis: "Promoters hold super-majority control."
                    },
                    citation: "Source: Shareholders"
                },
                {
                    block_id: 5,
                    block_type: "dashboard_grid",
                    heading: "Key Investors",
                    contextual_metrics: ["L7 Securities", "Sanshi Fund", "Nexus Equity", "Vikasa India"],
                    citation: "Source: Shareholder List"
                },
                {
                    block_id: 6,
                    block_type: "chart_complex",
                    heading: "Return Profile",
                    chart_data: {
                        title: "Return on Net Worth",
                        chart_type: "line",
                        labels: ["FY23", "FY24", "FY25"],
                        datasets: [
                            {
                                label: "RONW %",
                                data: [290, 111, 51.7]
                            }
                        ],
                        strategic_analysis: "Normalization of ROE as equity base expands."
                    },
                    citation: "Source: Ratios"
                },
                {
                    block_id: 7,
                    block_type: "text_deep_dive",
                    heading: "Audit & Compliance",
                    verbose_bullets: [
                        "**Clean Audit**: No major qualifications in FY25 report.",
                        "**Tax Provisioning**: Adequate tax provisioning of ₹67.6 Cr.",
                        "**Related Party**: Transparent disclosures on director dealings."
                    ],
                    citation: "Source: Financials Status"
                }
            ]
        },
        {
            slide_number: 4,
            kicker: "STRESS TEST: STRATEGIC PLANNING",
            title: "Market Landscape & Competitive Benchmarking",
            blocks: [
                {
                    block_id: 1,
                    block_type: "chart_complex",
                    heading: "Market Growth Projections",
                    chart_data: {
                        title: "Industry Size ($B)",
                        chart_type: "combo_bar_line",
                        labels: ["2024", "2025F", "2026F", "2027F", "2028F"],
                        datasets: [
                            {
                                label: "Events Market",
                                data: [5.2, 5.66, 6.1, 6.7, 7.4],
                                type: "bar"
                            },
                            {
                                label: "Growth Rate %",
                                data: [8.0, 8.3, 9.1, 9.5, 10.0],
                                type: "line"
                            }
                        ],
                        strategic_analysis: "Sector tailwinds strong with 8-10% sustained growth."
                    },
                    citation: "Source: Market Size"
                },
                {
                    block_id: 2,
                    block_type: "logo_grid",
                    heading: "Direct Competitors",
                    logos: ["PVR Inox", "Cinepolis", "Miraj", "Mukta A2", "NY Cinemas", "Rajhans", "City Gold", "Wide Angle"],
                    citation: "Source: Peers"
                },
                {
                    block_id: 3,
                    block_type: "text_deep_dive",
                    heading: "Competitive Advantage",
                    verbose_bullets: [
                        "**Cost Leader**: Lowest cost-per-screen setup in industry.",
                        "**Tech Stack**: Proprietary 'ConnPlex OS' for seamless booking (Fabricated).",
                        "**Flexibility**: Agnostic to mall vs standalone locations."
                    ],
                    citation: "Source: SWOT Strengths"
                },
                {
                    block_id: 4,
                    block_type: "chart_complex",
                    heading: "Benchmarking (Fabricated)",
                    chart_data: {
                        title: "ATP Comparison (₹)",
                        chart_type: "bar",
                        labels: ["PVR", "Cinepolis", "ConnPlex", "Local Single"],
                        datasets: [
                            {
                                label: "Avg Ticket Price",
                                data: [350, 310, 243, 150]
                            }
                        ],
                        strategic_analysis: "ConnPlex positioned in the 'sweet spot' between premium and mass."
                    },
                    citation: "Source: Internal Benchmarking (Fabricated)"
                },
                {
                    block_id: 5,
                    block_type: "dashboard_grid",
                    heading: "Threat Assessment",
                    contextual_metrics: ["OTT Adoption", "Piracy", "Reg. Content", "Inflation"],
                    citation: "Source: SWOT Threats"
                },
                {
                    block_id: 6,
                    block_type: "text_deep_dive",
                    heading: "Future Milestones",
                    verbose_bullets: [
                        "**2026**: Reach 200 screen milestone.",
                        "**2027**: Launch IPO for liquidity event (Fabricated).",
                        "**2028**: Pan-India presence in 20 states."
                    ],
                    citation: "Source: Future Plan"
                }
            ]
        },
        {
            slide_number: 5,
            kicker: "STRESS TEST: ODD NUMBER BLOCKS",
            title: "SWOT Analysis: Asymmetric Layout Test",
            blocks: [
                {
                    block_id: 1,
                    block_type: "text_deep_dive",
                    heading: "Strengths",
                    verbose_bullets: [
                        "**Financial**: 365% PAT growth.",
                        "**Brand**: Award winning innovation.",
                        "**Efficiency**: 77% ROE."
                    ],
                    citation: "Source: SWOT"
                },
                {
                    block_id: 2,
                    block_type: "text_deep_dive",
                    heading: "Weaknesses",
                    verbose_bullets: [
                        "**Occupancy**: Down 30% due to screen dilation.",
                        "**Ad Revenue**: Industry lag in ad recovery.",
                        "**Dependency**: Reliance on blockbuster content."
                    ],
                    citation: "Source: SWOT"
                },
                {
                    block_id: 3,
                    block_type: "visual_map",
                    heading: "Strategic Pivot",
                    detailed_image_prompt: "Flowchart showing shift from 'Cinema Only' to 'Lifestyle Hub' model.",
                    citation: "Source: Future Plan"
                },
                {
                    block_id: 4,
                    block_type: "text_deep_dive",
                    heading: "Opportunities",
                    verbose_bullets: [
                        "**Market Size**: INR 412k Cr industry by 2025.",
                        "**Formats**: Gold Class & IMAX additions.",
                        "**Regions**: Untapped Tier-3 towns."
                    ],
                    citation: "Source: SWOT"
                },
                {
                    block_id: 5,
                    block_type: "text_deep_dive",
                    heading: "Threats",
                    verbose_bullets: [
                        "**Technology**: VR/AR home entertainment.",
                        "**Economy**: Inflation impacting discretionary spend.",
                        "**Content**: Box office volatility."
                    ],
                    citation: "Source: SWOT"
                }
            ]
        },
        {
            slide_number: 6,
            kicker: "COMPOSITE BLOCK TEST",
            title: "Integrated Performance Overview",
            blocks: [
                {
                    block_id: 1,
                    block_type: "composite_block",
                    heading: "Market Dynamics & Financial Impact",
                    sub_block_headings: ["Market Share", "Revenue Trend"],
                    sub_blocks: [
                        {
                            block_id: 101,
                            block_type: "dashboard_grid",
                            heading: "Hidden Title 1",
                            contextual_metrics: { "Share": "28%", "CAGR": "12%", "NPS": "72" }
                        },
                        {
                            block_id: 102,
                            block_type: "chart_complex",
                            heading: "Hidden Title 2",
                            chart_data: {
                                title: "Revenue Trend",
                                chart_type: "bar",
                                labels: ["Q1", "Q2", "Q3", "Q4"],
                                datasets: [{ label: "Revenue", data: [10, 15, 22, 28] }]
                            }
                        }
                    ]
                },
                {
                    block_id: 2,
                    block_type: "text_deep_dive",
                    heading: "Integration Context",
                    verbose_bullets: [
                        "This slide demonstrates the **Composite Block** feature.",
                        "It groups a Dashboard and a Chart under one main heading.",
                        "Original request: Club multiple things like chart and image."
                    ]
                }
            ]
        }
    ]
};
