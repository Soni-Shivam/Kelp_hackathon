# Slide Generation JSON Schema Documentation

This documentation describes the structured JSON format required by the Presentation Generator to create McKinsey-style PowerPoint slides. The system uses a block-based architecture, allowing for flexible yet structured layouts.

## Table of Contents
- [Root Structure](#root-structure)
- [Slide Object](#slide-object)
- [Content Blocks](#content-blocks)
    - [Text Deep Dive (`text_deep_dive`)](#text-deep-dive)
    - [Dashboard Grid (`dashboard_grid`)](#dashboard-grid)
    - [Chart Complex (`chart_complex`)](#chart-complex)
    - [Visual Map (`visual_map`)](#visual-map)
    - [Logo Grid (`logo_grid`)](#logo-grid)
    - [Composite Block (`composite_block`)](#composite-block)
- [Supporting Types](#supporting-types)
    - [Chart Data](#chart-data)
- [Enums](#enums)
- [Example JSON](#example-json)

---

## Root Structure

### `PresentationData`
The top-level container for the entire presentation.

| Field | Type | Description |
| :--- | :--- | :--- |
| `project_code_name` | `string` | The title of the project (e.g., "Project Delta"). |
| `sector` | `string` | The industry or sector (e.g., "Energy", "FMCG"). |
| `slides` | `List<SlideData>` | An array of individual slide objects. |

---

## Slide Object

### `SlideData`
Represents a single slide within the presentation.

| Field | Type | Description |
| :--- | :--- | :--- |
| `slide_number` | `integer` | The order of the slide. |
| `title` | `string` | The primary headline of the slide (rendered in the purple header). |
| `kicker` | `string` (Optional) | Small context label displayed above the title. |
| `blocks` | `List<SlideBlock>` | An array of content blocks to be rendered on the slide. |

---

## Content Blocks

All blocks share a common base:
- `block_id`: `integer` (Unique ID for the block)
- `block_type`: `string` (One of the [BlockType](#blocktype) enums)
- `heading`: `string` (The title of the block)
- `citation`: `string` (Optional, footer-style citation for the block)

### Text Deep Dive (`text_deep_dive`)
Used for detailed text analysis and vertical bullet points.

| Field | Type | Description |
| :--- | :--- | :--- |
| `verbose_bullets` | `List<string>` | Array of bullet points. Supports **markdown bold** (e.g., `**Market Leader** in Asia`). |
| `style_variant` | `integer` (Optional) | `1`: Light grey background (Default), `2`: Light orange background, `3`: Individual boxes per bullet. |

### Dashboard Grid (`dashboard_grid`)
Used for showcasing key performance indicators (KPIs) or lists of items (e.g., certifications).

| Field | Type | Description |
| :--- | :--- | :--- |
| `contextual_metrics` | `Object` OR `List<string>` | If **Object**: Key-Value pairs (e.g., `{"Revenue": "$100M"}`). If **List**: Simple list of items rendered as badges. |

### Chart Complex (`chart_complex`)
Used for data visualization with integrated strategic analysis.

| Field | Type | Description |
| :--- | :--- | :--- |
| `chart_data` | `ChartData` | The actual data and configuration for the chart. See [Chart Data](#chart-data). |

### Visual Map (`visual_map`)
Used for image placeholders or maps.

| Field | Type | Description |
| :--- | :--- | :--- |
| `detailed_image_prompt` | `string` | A detailed description of the visual to be generated or placed. |

### Logo Grid (`logo_grid`)
Used for displaying a group of company or partner logos.

| Field | Type | Description |
| :--- | :--- | :--- |
| `logos` | `List<string>` | Array of company names to be rendered as logos in a circular grid. |

### Composite Block (`composite_block`)
A special block used for side-by-side comparison or grouping of information.

| Field | Type | Description |
| :--- | :--- | :--- |
| `sub_blocks` | `List<SlideBlock>` | Array of blocks (excluding other composite blocks). These are rendered in equal-width columns. |
| `sub_block_headings` | `List<string>` | Headings for each column, rendered as a vertical text strip on the left side of each sub-block. |

---

## Visual Rules & Layout Behavior

The generator applies several McKinsey-style design patterns automatically based on the JSON input:

1.  **Header**:
    - **Purple Strip**: The slide title is rendered inside a full-width purple header.
    - **Logo**: The "Kelp" logo is automatically added to the top-right corner.
    - **Kicker**: If provided, a grey context label (all-caps) is placed above the title.
2.  **Elastic Layout**:
    - The system automatically calculates the height needed for each block based on the amount of content (character count and number of bullets).
    - If total content exceeds the slide height, blocks are scaled proportionally to fit.
    - If content is sparse, blocks remain at their natural size (e.g., text won't stretch awkwardly).
3.  **Smart Patterns**:
    - **Sidebar**: If you have one `text_deep_dive` and one `chart_complex`, the system may automatically choose a sidebar layout (text on left, chart on right).
    - **Grids**: If 4+ blocks are present, they are automatically arranged in a 2x2 or dense grid.
4.  **Formatting**:
    - **Markdown Bold**: Use `**text**` in `verbose_bullets` to highlight key findings (rendered in bold Arial).
    - **Citations**: Citations are rendered in 9pt grey italics at the bottom of their respective blocks.

---

## Supporting Types

### `ChartData`
Configuration for charts inside `chart_complex` blocks.

| Field | Type | Description |
| :--- | :--- | :--- |
| `title` | `string` | The internal title of the chart. |
| `chart_type` | `string` | One of the [ChartType](#charttype) enums. |
| `labels` | `List<string>` | Labels for the X-axis or categorical data. |
| `datasets` | `List<ChartDataset>` | Array of data series. |
| `strategic_analysis` | `string` (Optional) | A summary analysis rendered below the chart. |

### `ChartDataset`
| Field | Type | Description |
| :--- | :--- | :--- |
| `label` | `string` | The name of the data series. |
| `data` | `List<float>` | The numerical values for the series. |
| `type` | `string` (Optional) | Overrides series type for combo charts (`bar` or `line`). |

---

## Enums

### `BlockType`
- `text_deep_dive`
- `dashboard_grid`
- `chart_complex`
- `visual_map`
- `logo_grid`
- `composite_block`

### `ChartType`
- `combo_bar_line`
- `stacked_bar`
- `doughnut`
- `bar`
- `line`

---

## Example JSON

```json
{
  "project_code_name": "Project Emerald",
  "sector": "Sustainable Energy",
  "slides": [
    {
      "slide_number": 1,
      "kicker": "Market Analysis",
      "title": "Solar Energy Adoption in Southeast Asia",
      "blocks": [
        {
          "block_id": 1,
          "block_type": "text_deep_dive",
          "heading": "Regional Trends",
          "verbose_bullets": [
            "**Vietnam** is leading the region with over 16GW of solar capacity.",
            "Government incentives are **driving investment** across Thailand and Malaysia.",
            "Grid stability remains a **key challenge** for remote installations."
          ],
          "style_variant": 1,
          "citation": "IEA Renewable Energy Report 2023"
        },
        {
          "block_id": 2,
          "block_type": "chart_complex",
          "heading": "Year-on-Year Growth",
          "chart_data": {
            "title": "Installed Capacity (GW)",
            "chart_type": "bar",
            "labels": ["2020", "2021", "2022", "2023"],
            "datasets": [
              {
                "label": "Solar PV",
                "data": [12.5, 15.2, 19.8, 24.5]
              }
            ],
            "strategic_analysis": "Consistent 20%+ growth observed in the last 3 years."
          }
        }
      ]
    }
  ]
}
```
