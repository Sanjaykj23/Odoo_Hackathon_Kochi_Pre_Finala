# Production-Grade Subscription Platform — Brightloop Software (RBAC & Dynamic Architecture)

An enterprise-ready subscription management platform for Brightloop Software featuring strict Role-Based Access Control (RBAC), demystified product and billing plan architectures, 100% dynamic metric calculations, customer quotation self-approval workflows, automated GST invoicing, and a bespoke fintech UI without developer mockups or AI-slop design tropes.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Revisions & Architecture Overhaul:**
> - **Strict Role-Based Access Control (RBAC)**:
>   - **Administrator**: Full CRUD access across all modules (Master Catalog, Billing Plans, Subscriptions, Invoices, Payments, Discounts, Staff IAM).
>   - **Sales Representative / Internal Staff**: Manages Quotation Offers, Subscriptions Kanban, and Payment Logging. Product & Plan Catalog is restricted to **Read-Only Reference Mode** (No create/edit/delete buttons). Staff IAM is **Strictly Blocked** with route guards.
>   - **Customer Portal**: Isolated portal restricted strictly to the logged-in client's subscriptions, quotes, and invoices. Features **Accept & Activate** (instant transition to Active with sales alert) and **Negotiate with Sales** workflow.
>   - **Finance Lead**: Full Executive Analytics Dashboard (MRR/ARR, revenue collections, overdue aging matrix) and Invoices Ledger. Restricted from catalog editing and IAM.
> - **Demystified Product vs. Billing Plan Architecture**:
>   - **Software Products & Add-ons**: What Brightloop sells (Base Price ₹, Cost Price ₹, Profit Margin %, HSN/SAC code, and Variant Add-ons like Odoo Brand +₹560).
>   - **Billing Cadence Plans**: How Brightloop bills (Monthly/Yearly/Weekly/Daily schedule, Base Cadence Rate ₹, Min Quantity, Early Closure/Pause rules).
> - **100% Dynamic Metrics**: Every financial figure (MRR, ARR, Total Revenue, Outstanding Dues, Overdue Aging, Column sums in Kanban, Margins, Invoice Totals, GST calculations) is computed dynamically from real-time state with zero hardcoded values.

---

## 1. System Architecture & RBAC Permission Matrix

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   BRIGHTLOOP CORE SYSTEM ARCHITECTURE                                   │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                        │
│  ┌────────────────────────┐    ┌────────────────────────┐    ┌──────────────────────────────────────┐  │
│  │   Master Catalog (Admin)│   │  Quotations & Pricing  │    │      Kanban Subscription Engine      │  │
│  │ - Products & Add-ons   │───>│ - Template Offers      │───>│ [Draft] ➔ [Quotation] ➔ [Confirmed]  │  │
│  │ - Variant Adjustments  │    │ - Validity Windows     │    │       ➔ [Active] ➔ [Closed/Paused]  │  │
│  │ - Billing Frequencies  │    │ - Discount Engine      │    └──────────────────┬───────────────────┘  │
│  └────────────────────────┘    └────────────────────────┘                       │                      │
│                                                                                 ▼                      │
│  ┌────────────────────────┐    ┌────────────────────────┐    ┌──────────────────────────────────────┐  │
│  │   Executive Analytics  │    │    Payment Ledger      │    │       Automated Billing Engine       │  │
│  │ - Dynamic MRR/ARR Calc │<───│ - UPI / NetBanking /   │<───│ - "Trigger Billing Day" Execution    │  │
│  │ - Overdue Aging Matrix │    │   NEFT Reconciliation  │    │ - 18% GST (CGST/SGST/IGST) Tax Engine│  │
│  │ - Revenue Summaries    │    │ - Payment Logging      │    │ - Idempotency Key Lock                │  │
│  └────────────────────────┘    └────────────────────────┘    └──────────────────────────────────────┘  │
│                                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Role Access Matrix
| Feature / View | Administrator | Sales Representative | Customer Portal | Finance Lead |
| :--- | :--- | :--- | :--- | :--- |
| **Executive Dashboard** | Full Access | Sales Queue View | Hidden | Full Analytics View |
| **Subscriptions Kanban / Matrix** | Full Control | Transition & Manage | View Own Only | View All (Read-Only) |
| **Product & Variant Catalog** | Full CRUD | Read-Only Reference | View Catalog | Read-Only Reference |
| **Billing Plans Manager** | Full CRUD | Read-Only Reference | View Available | Read-Only Reference |
| **Quotation Offers** | Full Access | Create & Send Offers | Accept or Negotiate | Read-Only |
| **Bulk Billing Day Engine** | Execute Run | Execute Run | Hidden | Execute Run |
| **Invoices & Payment Log** | Full Access | Record & Confirm | View Receipts | View All & Audit |
| **Discount Rules Engine** | Create & Manage | Apply Allowed Rules | View Active | View Impact |
| **Staff Accounts & IAM** | Full Access | **403 Restricted** | **403 Restricted** | **403 Restricted** |

---

## 2. Dynamic Metric Computation Specifications

1. **Monthly Recurring Revenue (MRR)**:
   $$\text{MRR} = \sum_{\text{Active Subscriptions}} \left( \sum_{\text{Lines}} \text{Line Total} \times \text{Frequency Multiplier} \right)$$
   - Monthly: $\times 1$, Yearly: $/ 12$, Weekly: $\times 4.33$, Daily: $\times 30$.
2. **Annual Recurring Revenue (ARR)**:
   $$\text{ARR} = \text{MRR} \times 12$$
3. **Total Revenue Collected**:
   $$\text{Total Collected} = \sum \text{Payments Recorded}$$
4. **Total Outstanding Dues**:
   $$\text{Outstanding Dues} = \sum_{\text{Confirmed Invoices}} \text{Balance Due}$$
5. **Overdue Aging Matrix**:
   - `< 30 Days`, `30-60 Days`, `> 60 Days` computed dynamically by calculating `Date.now() - Invoice.dueDate`.
6. **Product Profit Margins**:
   $$\text{Margin } (₹) = \text{Sales Price} - \text{Cost Price}, \quad \text{Margin } (\%) = \left( \frac{\text{Sales Price} - \text{Cost Price}}{\text{Sales Price}} \right) \times 100$$

---

## 3. Implementation Roadmap

1. **RBAC Engine & Route Guards (`src/context/AppContext.tsx` & View Wrappers)**:
   - Implement role permission checkers restricting UI controls (e.g. hiding "Add Product", "Edit Plan", "Manage Staff" for non-admins).
   - Display explicit "403 Access Restricted" fallback component when non-admins attempt to access unauthorized views.

2. **Customer Quotation Self-Approval & Negotiation Workflow**:
   - Build **"Accept & Activate"** action button in Customer Portal, transitioning Quotation $\rightarrow$ Active subscription and dispatching alert notification to sales team.
   - Build **"Negotiate with Sales"** modal allowing customers to send feedback directly to assigned sales rep.

3. **Demystified Product vs. Billing Plan UI (`src/components/ProductCatalog.tsx`)**:
   - Refactor into 2 crystal-clear tabs with visual diagrams and explanatory headers:
     - **Tab 1: Software Products & Add-on Catalog** (Sales Price ₹, Cost Price ₹, Profit Margin %, HSN Code, Attribute Variants).
     - **Tab 2: Billing Cadence Plans** (Frequency schedule, Base Cadence Rate ₹, Min Quantity, Contract Closure rules).

4. **100% Dynamic Metrics Audit (`src/components/FinanceDashboard.tsx`, `KanbanBoard.tsx`, `SubscriptionList.tsx`)**:
   - Ensure all sums, counts, ratios, and aging buckets are derived dynamically from state.

5. **Verification & Build**:
   - Run `compile_applet` to verify zero build or TypeScript errors.
