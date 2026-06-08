# Stellar Tithing Splitter

A transparent church donation tool that splits tithes across ministries. Configure allocation percentages, see exactly where every peso goes, and generate per-ministry QR codes for instant Stellar payments.

**Track:** Financial Inclusion & Everyday Payments (Track 2)

---

## The Problem

**Church donations lack transparency.** When a parishioner gives their tithe, they rarely know how it's distributed — how much goes to the main church, the youth ministry, charity programs, or building maintenance. This lack of visibility erodes trust and reduces giving.

Churches also manage multiple Stellar wallets for different ministries, making it cumbersome to direct donors to the right address. A single tithe often needs to be split, but there's no easy way to show the donor exactly where their money went.

## The Solution

A **transparent tithing dashboard** that lets churches:

1. **Configure ministries** — set up each ministry with its Stellar address and allocation percentage
2. **Auto-normalize percentages** — percentages always sum to 100%, with proportional adjustments
3. **Show live breakdowns** — donors enter an amount and instantly see every ministry's exact share
4. **Generate per-ministry QR codes** — each ministry gets its own scannable QR for direct payment
5. **Print all QRs** — expand to show all ministry QRs at once for printed church bulletins

No more "trust us with your donation." Every peso is transparent from the start.

## How Stellar Is Used

| Primitive | Usage |
|-----------|-------|
| **SEP-7 URI** | `web+stellar:pay?destination=G...&amount=...&memo=Tithe:Youth` encodes per-ministry donations with ministry name as memo |
| **Stellar accounts (G...)** | Each ministry has its own Stellar address as payment destination |
| **Asset issuers** | Native XLM and USDC (Circle Mainnet issuer) with proper issuer validation |
| **Donation memos** | Each QR includes a memo (`Tithe: Ministry Name`) so incoming payments are identifiable |
| **5-second settlement** | Payments clear in seconds at sub-cent fees — fast, cheap, and transparent |

No Soroban contracts needed — SEP-7 URIs are pure URL construction.

## Network Details

| Network | USDC Issuer |
|---------|-------------|
| **Mainnet** | `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` (Circle) |
| **Testnet** | `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5` |

## Features

- **Ministry configuration** — add, edit, and remove ministries with custom names
- **Auto-normalizing percentages** — adjust any percentage, others rebalance proportionally to always sum to 100%
- **Live donation breakdown** — enter an amount, see every ministry's share calculated in real-time
- **Per-ministry QR codes** — each ministry generates its own scannable SEP-7 URI or raw address QR
- **Simple/Full QR toggle** — Address QR for reliable scanning, Full QR for auto-fill SEP-7 URI
- **Print-all QRs mode** — expand to show all ministry QRs at once for bulletins and posters
- **XLM or USDC** — choose asset with correct issuer
- **Fullscreen QR** — enlarge for easy scanning from a distance
- **Download PNG** — save individual QRs for reuse

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [qrcode](https://www.npmjs.com/package/qrcode) — canvas-based QR rendering

## Getting Started

### Prerequisites

- **Node.js 18+** (recommended: Node.js 20+)
- **npm** (comes with Node.js)
- A modern web browser

### Install & Run

```bash
# Clone the repository
git clone https://github.com/mjmagno22/Project-3-Stellar-Tithing-Splitter.git
cd Project-3-Stellar-Tithing-Splitter

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

### Run on a Different Port

```bash
npx next dev -p 3002
```

## Usage

### For Church Administrators (Setup Tab)

1. **Add ministries** — click "Add Ministry" for each department (Main Church, Youth, Charity, etc.)
2. **Enter Stellar addresses** — each ministry needs a G... address to receive donations
3. **Set allocation percentages** — percentages auto-normalize to 100%
4. **Switch to Donate tab** — ready for donors to use

### For Donors (Donate Tab)

1. **Enter your tithe amount** — see the live breakdown across all ministries
2. **Choose your asset** — XLM or USDC
3. **Select a ministry** — click QR next to any ministry to generate its donation QR
4. **Scan and pay** — scan with Freighter mobile to send directly to that ministry's wallet
5. **View all QRs** — expand "Show all ministry QR codes" to see every QR at once

### QR Mode

- **Address QR** (default) — raw G... address, most reliable for Freighter mobile scanning
- **Full QR** — SEP-7 URI with amount + memo pre-filled, auto-fills in compatible wallets

## Project Structure

```
src/
├── lib/
│   └── sep7.ts               # SEP-7 URI builder & validation
├── components/
│   └── QrDisplay.tsx         # QR code display + copy/share/download
└── app/
    ├── globals.css           # Tailwind v4 + design tokens
    ├── layout.tsx            # Root layout
    └── page.tsx              # Main page (Setup + Donate tabs)
```

## Team

- **Mark Jason R. Magno** — [mjmagno22](https://github.com/mjmagno22) (solo entry)

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
